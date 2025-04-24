import { createLog } from "../services/log.service.js";
 
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

    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Ghi log thất bại" });
  }
};
