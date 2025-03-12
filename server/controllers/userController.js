const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validateUser } = require('../utils/validation');

class UserController {
    static async getUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        }
    }

    static async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching user' });
        }
    }

    static async createUser(req, res) {
        try {
            const validation = validateUser(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ errors: validation.errors });
            }

            const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;
            const hashedPassword = await bcrypt.hash('defaultPassword123', 10);

            const userData = {
                ...req.body,
                avatar: avatarPath,
                password: hashedPassword
            };

            const userId = await User.create(userData);
            res.status(201).json({ id: userId, message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error creating user' });
        }
    }

    static async updateUser(req, res) {
        try {
            const validation = validateUser(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ errors: validation.errors });
            }

            const userData = { ...req.body };
            if (req.file) {
                userData.avatar = `/uploads/avatars/${req.file.filename}`;
            }

            const updated = await User.update(req.params.id, userData);
            if (!updated) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error updating user' });
        }
    }

    static async deleteUser(req, res) {
        try {
            const deleted = await User.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting user' });
        }
    }
}

module.exports = UserController;