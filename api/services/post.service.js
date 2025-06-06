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
export const createPostService = async (
    userId,
    title,
    content,
    imageBuffer,
    visibility = 'public' // Default to public
) => {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Validate required fields
    if (!title || (!content && !imageBuffer)) {
        throw new Error("Bài đăng phải có tiêu đề và ít nhất nội dung hoặc ảnh!");
    }

    // Validate visibility value
    if (!['public', 'friends', 'private'].includes(visibility)) {
        throw new Error("Chế độ hiển thị không hợp lệ!");
    }

    // Upload image if provided
    let imageUrl = "";
    if (imageBuffer) {
        imageUrl = await uploadImageService(imageBuffer);
    }

    // Create new post with visibility
    const newPost = await Post.create({
        user: userId,
        title,
        content,
        image: imageUrl,
        visibility // Add visibility field
    });

    // Update user's posts
    user.posts.push(newPost._id);
    await user.save();

    // Cache the new post
    await redisClient.set(`post:${newPost._id}`, JSON.stringify(newPost), {
        EX: 600 // Expire after 10 minutes
    });

    return newPost;
};


export const getOwnPostsService = async (userId, page = 1, limit = 10) => {
    // console.log(`UserId ${userId}`)
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Lấy danh sách bài Post của user với pagination
    const posts = await Post.find({ user: userId })
        .populate("user", "username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();//

    // console.log(`Posts length ${posts.length}`)

    // Lấy danh sách bài SharePost với pagination
    const sharedPosts = await SharePost.find({ user: userId })
        .populate("user", "id username profilePicture")
        .populate("originalPost", "title content image user createdAt")
        .populate({
            path: "originalPost",
            populate: {
                path: "user",
                select: "username profilePicture"
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // console.log(`SharedPosts length ${sharedPosts.length}`)

    // Gộp và sắp xếp
    const allPosts = [...posts, ...sharedPosts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // console.log(`AllPosts length ${allPosts.length}`)

    let userLikedPosts = [];
    if (userId) {
        userLikedPosts = await LikePost.find({ user: userId })
            .distinct("post");
    }

    // console.log(`UserLikedPosts length ${userLikedPosts.length}`)

    // Gán trạng thái like
    const postsWithLikeStatus = allPosts.map(post => ({
        ...post,
        isLiked: userLikedPosts.some(
            id => id.toString() === post._id.toString()
        ),
    }));

    // console.log(`PostsWithLikeStatus length ${postsWithLikeStatus.length}`)

    return postsWithLikeStatus;
};

// API để cập nhật Post
export const updatePostService = async (userId, postId, title, content, imageBuffer) => {
    // 1. Kiểm tra người dùng
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // 2. Tìm post
    let post = await Post.findById(postId);  // Thay đổi `const` thành `let`
    if (!post) throw new Error("Bài viết không tồn tại!");

    // 3. Kiểm tra quyền
    if (post.user.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền chỉnh sửa bài viết này!");
    }

    // 4. Xử lý ảnh nếu có
    let imageUrl = post.image;
    if (imageBuffer) {
        if (post.image) {
            try {
                const publicId = post.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`post_images/${publicId}`);
            } catch (error) {
                console.error("Lỗi khi xóa ảnh cũ:", error);
            }
        }

        imageUrl = await uploadImageService(imageBuffer);
        if (!imageUrl) throw new Error("Lỗi khi tải ảnh lên");
    }

    // Cập nhật bài viết
    post = await Post.findByIdAndUpdate(  // Gán lại `post`
        postId,
        {
            title: title !== undefined ? title : post.title,
            content: content !== undefined ? content : post.content,
            image: imageUrl || post.image
        },
        { new: true, runValidators: true }
    );

    await redisClient.del(`post:${postId}`);

    return post;
};


export const updateSharePostService = async (userId, sharePostId, newCaption) => {

    console.log(`SharePostId ${sharePostId}`)
    // 1. Kiểm tra bài viết chia sẻ có tồn tại hay không
    let sharePost = await SharePost.findById(sharePostId);
    if (!sharePost) throw new Error("Bài viết không tồn tại!");

    // 2. Kiểm tra quyền chỉnh sửa
    if (sharePost.user.toString() !== userId.toString()) {
        throw new Error("Bạn không có quyền chỉnh sửa bài viết này!");
    }

    // 3. Cập nhật caption
    sharePost = await SharePost.findByIdAndUpdate(
        sharePostId,
        { caption: newCaption }, // Đổi từ caption thành newCaption
        { new: true, runValidators: true }
    );

    // 4. Xóa cache Redis
    await redisClient.del(`post:${sharePostId}`);

    return sharePost;
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


// Ở đây chỉ hiện các bài Post có visibility là "public"
// Muốn hiện tất cả thì xóa "if (post.visibility !== 'public')"
export const getAllPostsService = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        // Lấy danh sách bài Post với visibility là "public"
        const posts = await Post.find({ visibility: 'public' })
            .populate("user", "id username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Lấy danh sách bài SharePost với visibility là "public"
        const sharedPosts = await SharePost.find({ visibility: 'public' })
            .populate("user", "id username profilePicture")
            .populate("originalPost", "title content image user createdAt visibility")
            .populate({
                path: "originalPost",
                populate: {
                    path: "user",
                    select: "username profilePicture"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Lọc bỏ các SharePost mà originalPost không phải public
        const filteredSharedPosts = sharedPosts.filter(
            post => post.originalPost?.visibility === 'public'
        );

        // Gộp và sắp xếp bài viết
        const allPosts = [...posts, ...filteredSharedPosts].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Kiểm tra bài viết nào user đã like (nếu có userId)
        let userLikedPosts = [];
        if (userId) {
            userLikedPosts = await LikePost.find({ user: userId })
                .distinct("post");
        }

        // Gán trạng thái like
        const postsWithLikeStatus = allPosts.map(post => ({
            ...post,
            isLiked: userLikedPosts.some(
                id => id.toString() === post._id.toString()
            ),
        }));

        return postsWithLikeStatus;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bài viết:", error);
        throw new Error("Không thể lấy danh sách bài viết!");
    }
};


export const getPostsByUserIdService = async (userId, currentUserId, page = 1, limit = 10) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("Người dùng không tồn tại!");

        // 1. Query post filter theo quyền
        let postFilter = { user: userId };
        if (userId.toString() !== currentUserId.toString()) {
            postFilter.visibility = 'public';
        }

        // 2. Lấy bài Post gốc (của user)
        const posts = await Post.find(postFilter)
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // 3. Lấy bài SharePost của user (share bài nào chỉ được xem public)
        const sharePosts = await SharePost.find({ user: userId })
            .populate("user", "username profilePicture")
            .populate("originalPost", "title content image user createdAt visibility")
            .populate({
                path: "originalPost",
                populate: { path: "user", select: "username profilePicture" }
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // 4. Nếu không phải chính chủ, chỉ show share post có original là public
        const filteredSharedPosts = (userId === currentUserId)
            ? sharePosts
            : sharePosts.filter(post => post.originalPost?.visibility === 'public');

        // 5. Gộp & sort lại
        const allPosts = [...posts, ...filteredSharedPosts].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // 6. Lấy trạng thái like
        let userLikedPosts = [];
        if (currentUserId) {
            userLikedPosts = await LikePost.find({ user: currentUserId })
                .distinct("post");
        }

        // 7. Gán trạng thái like cho từng bài
        const postsWithLikeStatus = allPosts.map(post => ({
            ...post,
            isLiked: userLikedPosts.some(
                id => id === post._id
            ),
        }));

        return postsWithLikeStatus;
    } catch (error) {
        console.log(error);
        throw error; // Để controller catch trả lỗi 500 nếu có
    }
};
