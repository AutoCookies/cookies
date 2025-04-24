import express from 'express';
const router = express.Router();
import { 
    handleCreateLog,
    handleGetLogs
} from '../controllers/log.controller.js';

router.post("/", handleCreateLog);
router.get("/", handleGetLogs);

export default router;
