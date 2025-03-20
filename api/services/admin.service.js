import User from "../models/user.model.js";

export const getUser = async (id) => {
    const user = await User.findById(id).select("-password").lean();
    if (!user) throw new Error("User not found");
    return user;
};


export const getAllUser = async (currentUser) => {
    if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền xem danh sách người dùng!");
    }

    return await User.find().select("-password").lean();
};

export const deleteUserService = async (currentUser, userId) => {
    if (currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền xóa tài khoản!");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    await user.deleteOne();
    return { message: "Tài khoản đã được xóa!" };
};