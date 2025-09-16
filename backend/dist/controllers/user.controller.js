"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
exports.updateCurrentUser = updateCurrentUser;
exports.deleteCurrentUser = deleteCurrentUser;
const database_1 = __importDefault(require("../core/database"));
async function getCurrentUser(req, res) {
    try {
        // The user ID is attached by the authenticateToken middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication error.' });
        }
        const query = 'SELECT id, email, display_name, profile_picture, auth_provider, created_at, updated_at FROM users WHERE id = ? LIMIT 1';
        const result = await database_1.default.execute(query, [userId], { prepare: true });
        const user = result.first();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Return user data, explicitly omitting the hashed password
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
async function updateCurrentUser(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication error.' });
        }
        const { display_name, email } = req.body;
        // Basic validation
        if (!display_name && !email) {
            return res.status(400).json({ message: 'No update data provided.' });
        }
        const fieldsToUpdate = [];
        const values = [];
        if (display_name) {
            fieldsToUpdate.push('display_name = ?');
            values.push(display_name);
        }
        if (email) {
            // Optional: Check if email is already taken by another user
            const emailExistsQuery = 'SELECT id FROM users WHERE email = ? ALLOW FILTERING';
            const existingUser = await database_1.default.execute(emailExistsQuery, [email], { prepare: true });
            if (existingUser.first() && existingUser.first().id.toString() !== userId) {
                return res.status(409).json({ message: 'Email is already in use.' });
            }
            fieldsToUpdate.push('email = ?');
            values.push(email);
        }
        fieldsToUpdate.push('updated_at = ?');
        values.push(new Date());
        values.push(userId);
        const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        await database_1.default.execute(query, values, { prepare: true });
        // Fetch the updated user to return it
        const selectQuery = 'SELECT id, email, display_name, profile_picture, auth_provider, created_at, updated_at FROM users WHERE id = ? LIMIT 1';
        const result = await database_1.default.execute(selectQuery, [userId], { prepare: true });
        const updatedUser = result.first();
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Update current user error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
async function deleteCurrentUser(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication error.' });
        }
        // Note: Depending on application logic, you might want to handle related data
        // (e.g., tracks, playlists) before deleting the user. This is a direct deletion.
        const query = 'DELETE FROM users WHERE id = ?';
        await database_1.default.execute(query, [userId], { prepare: true });
        // Optional: Could also implement a soft delete by setting a `deleted_at` timestamp
        return res.status(204).send(); // 204 No Content is appropriate for a successful deletion
    }
    catch (error) {
        console.error('Delete current user error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
