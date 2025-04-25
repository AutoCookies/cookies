import asyncHandler from "express-async-handler";
import { CreateUserAccountService } from "../../services/admin/account.service.js";

export const createUserAccount = asyncHandler(async (req, res) => {
    const data = await CreateUserAccountService(req.body, res);
    res.status(201).json(data);
});