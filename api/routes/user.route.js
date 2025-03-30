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
    getCoverPhoto
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);

router.put("/change-password", changeUserPassword);
router.put("/change-username", changeUserName);
router.put("/change-fullname", changeUserFullname);
router.put("/change-phone", changeUserPhoneNumber);
router.post("/updateProfilePicture", upload.single("profilePicture"), updateProfilePicture);
router.post("/coverPhoto", upload.single("coverPhoto"), updateCoverPhoto);
router.get("/me/cover-photo", getCoverPhoto);
router.get("/me/profile-picture", getProfilePicture);
router.get("/search/user", searchUserByName);

export default router;
