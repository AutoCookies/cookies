import express from "express";
import { 
    getUserProfile,
    changeUserPassword,
    changeUserName,
    changeUserFullname,
    changeUserPhoneNumber
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);

router.put("/change-password", protectRoute, changeUserPassword);
router.put("/change-username", protectRoute, changeUserName);
router.put("/change-fullname", protectRoute, changeUserFullname);
router.put("/change-phone", protectRoute, changeUserPhoneNumber)

export default router;
