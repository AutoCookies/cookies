import User from '../../models/user.model.js';

export const CreateUserAccountService = async ({ username, fullName, email, password, role }, res) => {
    if (!username || !fullName || !email || !password) {
        throw new Error("All fields are required!");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email!");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters!");
    }

    const userExists = await User.exists({ email });
    if (userExists) throw new Error("Email already exists!");

    const user = await User.create({ username, fullName, email, password, role: role });

    if (!user) throw new Error("Create user failed!");

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};