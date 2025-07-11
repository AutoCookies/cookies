import express from "express";
import { followUser, unfollowUser } from "../controllers/follow.controller.js";

const router = express.Router();

router.post("/:id/follow", followUser);
router.delete("/:id/unfollow", unfollowUser);

export default router;
