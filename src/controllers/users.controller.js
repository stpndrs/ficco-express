import { UsersRepository } from '../repositories/users.repository.js';

const usersRepo = new UsersRepository();

// --- USER MANAGEMENT ---
export const createUser = async (req, res) => {
    try {
        const user = await usersRepo.createUser(req.body);
        return res.status(201).json({
            status: true,
            message: 'Pengguna berhasil ditambahkan',
            data: user,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const result = await usersRepo.findAllUsers(req.query);
        return res.status(200).json({
            status: true,
            message: 'Daftar pengguna berhasil diambil',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usersRepo.findUserById(id);

        if (!user) {
            return res.status(404).json({ status: false, message: 'Pengguna tidak ditemukan' });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail pengguna berhasil diambil',
            data: user,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await usersRepo.findUserById(id);

        if (!existingUser) {
            return res.status(404).json({ status: false, message: 'Pengguna tidak ditemukan' });
        }

        const updated = await usersRepo.updateUser(id, req.body);
        return res.status(200).json({
            status: true,
            message: 'Data pengguna berhasil diperbarui',
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const existingUser = await usersRepo.findUserById(id);
        if (!existingUser) {
            return res.status(404).json({ status: false, message: 'Pengguna tidak ditemukan' });
        }

        const updated = await usersRepo.toggleUserStatus(id, isActive);
        return res.status(200).json({
            status: true,
            message: `Status pengguna berhasil diubah menjadi ${isActive ? 'Aktif' : 'Non-aktif'}`,
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// --- PROFILE MANAGEMENT ---
export const getProfile = async (req, res) => {
    try {
        // Assuming req.user.id is attached by auth middleware or fallback query ID
        const userId = req.user?.id || req.query.userId;

        if (!userId) {
            return res.status(400).json({ status: false, message: 'User ID is required' });
        }

        const profileData = await usersRepo.getProfile(userId);
        if (!profileData) {
            return res.status(404).json({ status: false, message: 'Profil tidak ditemukan' });
        }

        return res.status(200).json({
            status: true,
            message: 'Data profil berhasil diambil',
            data: profileData,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;

        console.log(req.body)

        if (!userId) {
            return res.status(400).json({ status: false, message: 'User ID is required' });
        }

        const updatedProfile = await usersRepo.updateProfile(userId, req.body);
        return res.status(200).json({
            status: true,
            message: 'Profil berhasil diperbarui',
            data: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};