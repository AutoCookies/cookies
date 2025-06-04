import express from "express";
import { 
    getUserProfile,
    changeUserPassword,
    changeUserName,
    changeUserFullname,
    changeUserPhoneNumber,
    updateProfilePicture,
    getProfilePicture,
    searchUserByName,
    updateCoverPhoto,
    getCoverPhoto,
    getUserImagePage
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Lấy profile của một user khi biết id
router.get("/:id", getUserProfile);
// Thay đổi mật khẩu một tài khoản
router.put("/change-password", changeUserPassword);
// Thay đổi username của một tài khoản
router.put("/change-username", changeUserName);
// Thay đổi fullname của một tài khoản
router.put("/change-fullname", changeUserFullname);
// Thay đổi số điện thoại của một user
router.put("/change-phone", changeUserPhoneNumber);
// Cập nhật profile image của một cá nhân
router.post("/updateProfilePicture", upload.single("profilePicture"), updateProfilePicture);
// Cập nhật cover photo của một cá nhân
router.post("/coverPhoto", upload.single("coverPhoto"), updateCoverPhoto);
// Lấy cover phto của cá nhân
router.get("/me/cover-photo", getCoverPhoto);
// Lấy profile picture của cá nhân
router.get("/me/profile-picture", getProfilePicture);
// Tìm kiếm user bằng tên
router.get("/search/user", searchUserByName);
// Lấy cover picture của một user khi biết userId
router.get("/:userId/imagePage", getUserImagePage);

export default router;
