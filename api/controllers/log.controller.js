import { createLog } from "../services/log.service.js";
import { getLogs } from "../services/log.service.js";
 
export const handleCreateLog = async (req, res) => {
  try {
    const body = req.body;

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const log = await createLog({
      ...body,
      ip,
      userAgent,
    });

    if (global._io) {
      global._io.emit("new-log", log);
    }

    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Ghi log thất bại" });
  }
};

export const handleGetLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getLogs(Number(page), Number(limit));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Lấy log thất bại",
    });
  }
};

