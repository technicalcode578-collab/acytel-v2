"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.googleAuth = googleAuth;
exports.googleCallback = googleCallback;
exports.refreshUserProfile = refreshUserProfile;
exports.logout = logout;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../core/database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
// Define a schema for input validation using Zod.
// This ensures the data we receive conforms to our expectations.
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format.'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long.'),
});
async function register(req, res) {
    try {
        // 1. Validate Input
        const { email, password } = registerSchema.parse(req.body);
        // 2. Check for Existing User
        // We use a parameterized query to prevent CQL injection.
        const existingUserQuery = 'SELECT email FROM acytel.users WHERE email = ? ALLOW FILTERING';
        const existingUserResult = await database_1.default.execute(existingUserQuery, [email], { prepare: true });
        if (existingUserResult.rowLength > 0) {
            logger_1.default.logAuthFailure(req.ip || 'unknown', 'registration_attempt_existing_email', email);
            // Use 409 Conflict status code for duplicate resource
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        // 3. Hash Password
        // A salt round of 12 is a strong, recommended standard.
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // 4. Generate UUID
        const userId = (0, uuid_1.v4)();
        const now = new Date();
        // 5. Persist to Database
        // Again, we use a parameterized query for security.
        const insertQuery = 'INSERT INTO acytel.users (id, email, hashed_password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
        const params = [userId, email, hashedPassword, now, now];
        await database_1.default.execute(insertQuery, params, { prepare: true });
        logger_1.default.logSecurityEvent('User registered', { userId }, req.ip || 'unknown');
        // 6. Return Success Response
        return res.status(201).json({
            message: 'User registered successfully.',
            userId: userId,
        });
    }
    catch (error) {
        // Handle validation errors from Zod
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
        }
        // Handle all other potential errors
        logger_1.default.logSecurityEvent('Registration error', { error }, req.ip || 'unknown');
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
// Add this new login function after the existing register function
async function login(req, res) {
    try {
        // 1. Validate Input
        const { email, password } = registerSchema.parse(req.body);
        // 2. Find User by Email
        const findUserQuery = 'SELECT id, email, hashed_password FROM acytel.users WHERE email = ? LIMIT 1 ALLOW FILTERING';
        const userResult = await database_1.default.execute(findUserQuery, [email], { prepare: true });
        const user = userResult.first();
        // 3. Handle "Not Found"
        if (!user) {
            logger_1.default.logAuthFailure(req.ip || 'unknown', 'login_attempt_user_not_found', email);
            // Return a generic 401 to prevent attackers from knowing which emails are registered
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // 4. Compare Passwords
        const isPasswordValid = await bcrypt_1.default.compare(password, user.hashed_password);
        // 5. Handle "Incorrect Password"
        if (!isPasswordValid) {
            logger_1.default.logAuthFailure(req.ip || 'unknown', 'login_attempt_invalid_password', email);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // 6. Generate JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.default.logSecurityEvent('JWT_SECRET not found', undefined, undefined, req.ip || 'unknown');
            throw new Error('JwtSecretNotStored: JWT_SECRET is not defined in environment variables.');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id.toString() }, // Payload
        secret, // Secret Key
        { expiresIn: '7d' } // Options
        );
        logger_1.default.logAuthSuccess(user.id.toString(), req.ip || 'unknown', 'local');
        // 7. Return Token
        return res.status(200).json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
        }
        logger_1.default.logSecurityEvent('Login error', { error }, req.ip || 'unknown');
        console.error('Login error:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
async function googleAuth(req, res) {
    // This will be handled by Passport middleware
}
async function googleCallback(req, res) {
    try {
        const user = req.user;
        if (!user) {
            logger_1.default.logAuthFailure(req.ip || 'unknown', 'google_oauth_callback_no_user');
            return res.redirect(`${process.env.CORS_ORIGIN}/welcome?error=authentication_failed`);
        }
        // Generate JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.default.logSecurityEvent('JWT_SECRET not found', undefined, user.id, req.ip || 'unknown');
            console.error('JWT_SECRET not found');
            return res.redirect(`${process.env.CORS_ORIGIN}/welcome?error=server_error`);
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            authProvider: user.authProvider
        }, secret, { expiresIn: '7d' });
        logger_1.default.logAuthSuccess(user.id, req.ip || 'unknown', 'google');
        // Redirect to frontend with token
        const redirectURL = `${process.env.CORS_ORIGIN}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider
        }))}`;
        res.redirect(redirectURL);
    }
    catch (error) {
        logger_1.default.logSecurityEvent('Google callback error', { error }, req.user?.id, req.ip || 'unknown');
        console.error('Google callback error:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/welcome?error=callback_failed`);
    }
}
async function refreshUserProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userQuery = 'SELECT * FROM acytel.users WHERE id = ? LIMIT 1';
        const result = await database_1.default.execute(userQuery, [userId], { prepare: true });
        const user = result.first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id.toString(),
            email: user.email,
            displayName: user.display_name,
            profilePicture: user.profile_picture,
            authProvider: user.auth_provider,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        });
    }
    catch (error) {
        logger_1.default.logSecurityEvent('Profile refresh error', { error }, req.user?.id, req.ip || 'unknown');
        console.error('Profile refresh error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function logout(req, res) {
    try {
        // For JWT-based auth, logout is primarily client-side
        // But we can log the logout event for security monitoring
        const userId = req.user?.id;
        if (userId) {
            logger_1.default.logSecurityEvent('User logged out', undefined, userId, req.ip || 'unknown');
            console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
        }
        // Clear session if using sessions
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    logger_1.default.logSecurityEvent('Session destruction error', { error: err }, userId, req.ip || 'unknown');
                    console.error('Session destruction error:', err);
                }
            });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        logger_1.default.logSecurityEvent('Logout error', { error }, req.user?.id, req.ip || 'unknown');
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
