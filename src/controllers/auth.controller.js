import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';

const authRepo = new AuthRepository();

export const register = async (req, res) => {
    try {
        const { username, email, password, companyName, companyAddress, ownerName, ownerPhone, initialCapital } = req.body;

        const existingUser = await authRepo.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ status: false, message: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name: ownerName,
            username,
            email,
            password: hashedPassword,
            role: "owner",
            isActive: true,
        };

        const companyData = {
            name: companyName,
            address: companyAddress,
            ownerName: ownerName || username,
            ownerPhone: ownerPhone,
            initialCapital: initialCapital ? String(initialCapital) : '0',
        };

        const result = await authRepo.createUserWithCompany(userData, companyData);

        return res.status(201).json({
            status: true,
            message: 'Registration successful',
            data: {
                userId: result.user.id,
                username: result.user.username,
                companyId: result.company.id,
                companyName: result.company.name,
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authRepo.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ status: false, message: 'User account is inactive' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await authRepo.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // If username contains an email or system sends to configured email
        await sendResetPasswordEmail(email, resetToken);

        return res.status(200).json({
            status: true,
            message: 'Password reset link sent to your email',
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ status: false, message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await authRepo.updatePassword(decoded.id, hashedPassword);

        return res.status(200).json({
            status: true,
            message: 'Password reset successfully. You can now login with your new password.',
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};