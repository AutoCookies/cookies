import Log from '../models/log.model.js';

export const createLog = async (logData) => {
  const log = await Log.create(logData);
  return log;
};

export const getLogs = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const logs = await Log.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Log.countDocuments();

  return {
    logs,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};
