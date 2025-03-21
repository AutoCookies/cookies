import express from "express";
import { 
    getUserProfile,
    changeUserPassword,
    changeUserName,
    changeUserFullname,
    changeUserPhoneNumber,
    updateProfilePicture,
    getProfilePicture,
    searchUserByName
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { checkBanStatus } from "../middlewares/checkBan.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);

router.put("/change-password", protectRoute, checkBanStatus, changeUserPassword);
router.put("/change-username", protectRoute, checkBanStatus, changeUserName);
router.put("/change-fullname", protectRoute, checkBanStatus, changeUserFullname);
router.put("/change-phone", protectRoute, checkBanStatus, changeUserPhoneNumber);
router.post("/updateProfilePicture", protectRoute, checkBanStatus, upload.single("profilePicture"), updateProfilePicture);
router.get("/me/profile-picture", protectRoute, checkBanStatus, getProfilePicture);
router.get("/search/user", protectRoute, checkBanStatus, searchUserByName);

export default router;
