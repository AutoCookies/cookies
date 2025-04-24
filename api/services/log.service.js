import Log from '../models/log.model.js';

export const createLog = async (logData) => {
  const log = await Log.create(logData);
  return log;
};