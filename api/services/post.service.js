import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { SharePost } from '../models/sharedPost.model.js';
import { uploadImageService } from "./upload.service.js";
import cloudinary from "../config/cloudinary.js";

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
        likes: [],
        comments: [],
    });

    user.posts.push(newPost._id);
    await user.save();

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

export const updatePostService = async (userId, postId, title, content, imageBuffer) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra quyền chỉnh sửa bài viết
    if (post.user.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền chỉnh sửa bài viết này!");
    }

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
    }

    // Cập nhật bài viết
    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, content, image: imageUrl },
        { new: true }
    );

    return updatedPost;
};

export const deletePostService = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    const post = await Post.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra quyền xóa bài viết
    if (post.user.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền xóa bài viết này!");
    }

    // Xóa ảnh trên Cloudinary trước khi xóa bài viết
    if (post.image) {
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
    await user.save(); // Lưu lại thay đổi

    // Xóa bài viết
    await post.deleteOne();

    return { message: "Bài viết đã được xóa thành công!" };
};


export const likePostService = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Tìm trong Post trước, nếu không có thì tìm trong SharePost
    let post = await Post.findById(postId) || await SharePost.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra nếu user đã like
    if (post.likes.includes(userId)) {
        throw new Error("Bạn đã thích bài viết này rồi!");
    }

    // Thêm userId vào danh sách likes
    post.likes.push(userId);
    user.likedPosts.push(postId);

    await post.save();
    await user.save();

    return post;
};

export const unlikePostService = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Tìm trong Post trước, nếu không có thì tìm trong SharePost
    let post = await Post.findById(postId) || await SharePost.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra nếu user chưa like
    if (!post.likes.includes(userId)) {
        throw new Error("Bạn chưa thích bài viết này!");
    }

    // Xóa userId khỏi danh sách likes
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    user.likedPosts = user.likedPosts.filter(id => id.toString() !== postId.toString());

    await post.save();
    await user.save();

    return post;
};

export const sharePostService = async (userId, postId, caption) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Tạo bản ghi chia sẻ
    const sharedPost = await SharePost.create({
        user: userId,
        originalPost: postId,
        caption: caption || "",
    });

    // Thêm sharedPost vào danh sách bài viết của user
    await User.findByIdAndUpdate(userId, {
        $push: { posts: sharedPost._id }
    });

    return sharedPost;
};

export const getAllPostsService = async () => {
    // Lấy tất cả bài viết gốc
    const posts = await Post.find()
        .populate("user", "username profilePicture") // Lấy thông tin người đăng bài
        .sort({ createdAt: -1 })
        .lean();

    // Lấy tất cả bài viết đã share
    const sharedPosts = await SharePost.find()
        .populate("user", "username profilePicture") // Người share
        .populate("originalPost", "title content image user createdAt") // Thông tin bài gốc
        .populate({
            path: "originalPost",
            populate: { path: "user", select: "username profilePicture" } // Người đăng bài gốc
        })
        .sort({ createdAt: -1 })
        .lean();

    // Gộp danh sách và sắp xếp theo thời gian
    const allPosts = [...posts, ...sharedPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return allPosts;
};

export const commentPostService = async (userId, postId, text) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    if (!text.trim()) throw new Error("Bình luận không được để trống!");

    let post = await Post.findById(postId);
    let sharePost = await SharePost.findById(postId);

    if (!post && !sharePost) {
        throw new Error("Bài viết không tồn tại!");
    }

    const comment = {
        user: userId,
        text,
        createdAt: new Date(),
    };

    if (post) {
        post.comments.push(comment);
        await post.save();
    } else if (sharePost) {
        sharePost.comments.push(comment);
        await sharePost.save();
    }

    return { message: "Bình luận đã được thêm!" };
};



