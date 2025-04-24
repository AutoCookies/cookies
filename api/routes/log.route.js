import express from 'express';
const router = express.Router();
import { handleCreateLog } from '../controllers/log.controller.js';

router.post("/", handleCreateLog);

export default router;
