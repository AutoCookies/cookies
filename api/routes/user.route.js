import express from "express";
import { 
    getUserProfile,
    changeUserPassword,
    changeUserName,
    changeUserFullname,
    changeUserPhoneNumber,
    updateProfilePicture,
    getProfilePicture
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);

router.put("/change-password", protectRoute, changeUserPassword);
router.put("/change-username", protectRoute, changeUserName);
router.put("/change-fullname", protectRoute, changeUserFullname);
router.put("/change-phone", protectRoute, changeUserPhoneNumber);
router.post("/updateProfilePicture", protectRoute, upload.single("profilePicture"), updateProfilePicture);
router.get("/me/profile-picture", protectRoute, getProfilePicture);

export default router;
