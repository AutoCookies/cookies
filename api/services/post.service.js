import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { SharePost } from '../models/sharedPost.model.js';
import { uploadImageService } from "./upload.service.js";
import cloudinary from "../config/cloudinary.js";
import redisClient from "../config/redisClient.js";
import LikePost from "../models/likePost.model.js";

/**
 * Tạo bài viết mới
 * @param {string} userId - ID của người đăng bài
 * @param {Object} data - Dữ liệu bài viết
 * @param {string} data.content - Nội dung bài viết
 * @param {Buffer} data.imageBuffer - Ảnh bài viết (dạng Buffer)
 * @param {string} data.imageMimetype - Loại ảnh (image/png, image/jpeg, ...)
 * @returns {Promise<Object>} - Bài viết đã tạo
 */
export const createPostService = async (userId, title, content, imageBuffer) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    if (!title || (!content && !imageBuffer)) {
        throw new Error("Bài đăng phải có tiêu đề và ít nhất nội dung hoặc ảnh!");
    }

    let imageUrl = "";
    if (imageBuffer) {
        imageUrl = await uploadImageService(imageBuffer);
    }

    const newPost = await Post.create({
        user: userId,
        title,
        content,
        image: imageUrl,
    });

    user.posts.push(newPost._id);
    await user.save();

    // Cache bài viết mới ngay lập tức
    await redisClient.set(`post:${newPost._id}`, JSON.stringify(newPost), { EX: 600 });

    return newPost;
};


export const getOwnPostsService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Lấy danh sách bài viết và populate thêm thông tin user
    const posts = await Post.find({ user: userId })
        .populate("user", "username profilePicture") // Lấy thông tin user
        .sort({ createdAt: -1 }) // Sắp xếp bài đăng mới nhất lên đầu
        .lean();

    return posts;
};

export const updatePostService = async (userId, postId, title, content, imageBuffer, caption) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    let post = await Post.findById(postId);
    let postType = "Post";

    // Nếu không tìm thấy trong Post, kiểm tra trong SharePost
    if (!post) {
        post = await SharePost.findById(postId);
        postType = "SharePost";
    }

    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra quyền chỉnh sửa bài viết
    if (post.user.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền chỉnh sửa bài viết này!");
    }

    if (postType === "Post") {
        let imageUrl = post.image; // Giữ ảnh cũ nếu không có ảnh mới

        if (imageBuffer) {
            // 🔹 Xóa ảnh cũ trên Cloudinary trước khi upload ảnh mới
            if (post.image) {
                try {
                    // Lấy public_id từ URL ảnh cũ
                    const publicId = post.image.split("/").pop().split(".")[0]; 
                    console.log("Xóa ảnh cũ:", publicId);

                    await cloudinary.uploader.destroy(`post_images/${publicId}`);
                    console.log("Ảnh cũ đã xóa thành công!");
                } catch (error) {
                    console.error("Lỗi khi xóa ảnh cũ:", error);
                }
            }

            // Upload ảnh mới
            console.log("Uploading new image...");
            imageUrl = await uploadImageService(imageBuffer);
            console.log("New image URL:", imageUrl);

            if (!imageUrl) {
                throw new Error("Lỗi khi tải ảnh lên, vui lòng thử lại!");
            }
        }

        // Cập nhật Post
        post = await Post.findByIdAndUpdate(
            postId,
            { 
                title, 
                content, 
                image: imageUrl ?? post.image  
            },
            { new: true }
        );

    } else if (postType === "SharePost") {
        // Cập nhật SharePost (chỉ cập nhật caption)
        post = await SharePost.findByIdAndUpdate(
            postId,
            { caption },
            { new: true }
        );
    }

    // Xóa cache Redis
    await redisClient.del(`post:${postId}`);

    return post;
};


export const deletePostService = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    let post = await Post.findById(postId);
    let postType = "Post";

    // Nếu không tìm thấy trong Post, kiểm tra trong SharePost
    if (!post) {
        post = await SharePost.findById(postId);
        postType = "SharePost";
    }

    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra quyền xóa bài viết
    if (post.user.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền xóa bài viết này!");
    }

    // Nếu là bài viết gốc (Post) → Xóa ảnh trên Cloudinary trước khi xóa bài viết
    if (postType === "Post" && post.image) {
        try {
            const publicId = post.image.split("/").pop().split(".")[0];
            console.log("Xóa ảnh cũ trên Cloudinary:", publicId);
            await cloudinary.uploader.destroy(`post_images/${publicId}`);
        } catch (error) {
            console.error("Lỗi khi xóa ảnh trên Cloudinary:", error);
        }
    }

    // Xóa bài viết khỏi danh sách của user
    user.posts = user.posts.filter(id => id.toString() !== postId.toString());
    await user.save();

    // Xóa bài viết
    await post.deleteOne();
    
    // Xóa cache Redis liên quan
    await redisClient.del(`post:${postId}`);

    return { message: "Bài viết đã được xóa thành công!" };
};


export const sharePostService = async (userId, postId, caption, visibility) => {
    let post = await Post.findById(postId);
    let sharePost = await SharePost.findById(postId);
    let originalPostId, originalPostModel;

    if (post) {
        originalPostId = postId;
        originalPostModel = "Post";
    } else if (sharePost) {
        originalPostId = sharePost.originalPost;
        originalPostModel = sharePost.originalPostModel;
    } else {
        throw new Error("Bài viết không tồn tại!");
    }

    console.log("🔄 Tạo SharePost với visibility:", visibility);

    const newSharedPost = new SharePost({
        user: userId,
        originalPost: originalPostId,
        originalPostModel: originalPostModel,
        caption: caption,
        visibility: visibility 
    });

    await newSharedPost.save();

    return newSharedPost;
};


export const getAllPostsService = async (userId, page = 1, limit = 10) => {
    try {
        // console.log(`Truy vấn danh sách bài viết... Trang: ${page}, Giới hạn: ${limit}`);

        const skip = (page - 1) * limit;

        // Lấy danh sách tất cả bài Post
        const posts = await Post.find()
            .populate("user", "id username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Lấy danh sách tất cả SharePost
        const sharedPosts = await SharePost.find()
            .populate("user", "id username profilePicture")
            .populate("originalPost", "title content image user createdAt")
            .populate({
                path: "originalPost",
                populate: { path: "user", select: "username profilePicture" }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Gộp tất cả bài viết & sắp xếp theo thời gian
        const allPosts = [...posts, ...sharedPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Nếu có userId, kiểm tra bài viết nào user đã like
        let userLikedPosts = [];
        if (userId) {
            userLikedPosts = await LikePost.find({ user: userId }).distinct("post"); // Lấy danh sách ID của các bài đã like
        }

        // Gán thêm isLiked vào từng post
        const postsWithLikeStatus = allPosts.map(post => ({
            ...post,
            isLiked: userLikedPosts.map(id => id.toString()).includes(post._id.toString()),
        }));  

        return postsWithLikeStatus;
    } catch (error) {
        console.error("Lỗi Redis hoặc MongoDB:", error);
        throw new Error("Không thể lấy danh sách bài viết!");
    }
};



