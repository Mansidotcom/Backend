import express from 'express'
import { allUsers, changePassword, forgotPassword, getMe, getUserById, login, logout, otpVerify, refreshToken, register, reVerify, updateUser, verify } from '../controllers/userControllers.js'
import { isAdmin, isAuthenticated } from '../middleware/isAuthenticated.js'

import { singleUpload } from '../middleware/multer.js'
import { User } from '../models/userModels.js'


const router = express.Router()

router.post('/register', register)

router.get('/verify/:token', verify)
router.post('/reverify', reVerify)
router.post('/login', login)
router.post("/refresh", refreshToken);
router.get("/me", isAuthenticated, getMe);
router.post("/logout", isAuthenticated, logout)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", otpVerify);
router.post("/change-password", isAuthenticated, changePassword);
router.get("/all-users", isAuthenticated, isAdmin, allUsers);
router.get("/user/:userId", isAuthenticated, isAdmin, getUserById);
router.put("/update/:id", isAuthenticated, singleUpload, updateUser);

// DEBUG ENDPOINT - Check all users in database (REMOVE IN PRODUCTION)
router.get("/debug/all-emails", async (req, res) => {
    try {
        const users = await User.find({}, { email: 1, firstname: 1, lastname: 1 }).lean();
        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            users: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DEBUG ENDPOINT - Make user admin (REMOVE IN PRODUCTION)
router.post("/debug/make-admin/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const trimmedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: "i" } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.role = "admin";
        await user.save();

        return res.status(200).json({
            success: true,
            message: `${user.email} is now an admin`,
            user: { email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// DEBUG ENDPOINT - Clear all users (REMOVE IN PRODUCTION)
router.post("/debug/clear-users", async (req, res) => {
    try {
        const result = await User.deleteMany({});
        return res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} users`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
