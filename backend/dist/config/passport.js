"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const database_1 = __importDefault(require("../core/database"));
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleProfile = profile;
        // Check if user already exists with Google ID
        const existingGoogleUserQuery = 'SELECT * FROM users WHERE google_id = ? LIMIT 1 ALLOW FILTERING';
        const existingGoogleUser = await database_1.default.execute(existingGoogleUserQuery, [googleProfile.id], { prepare: true });
        if (existingGoogleUser.rowLength > 0) {
            const user = existingGoogleUser.first();
            logger_1.default.logAuthSuccess(user.id.toString(), 'N/A', 'google');
            return done(null, {
                id: user.id.toString(),
                email: user.email,
                displayName: user.display_name,
                profilePicture: user.profile_picture,
                authProvider: 'google'
            });
        }
        // Check if user exists with same email but different provider
        const existingEmailUserQuery = 'SELECT * FROM users WHERE email = ? LIMIT 1 ALLOW FILTERING';
        const existingEmailUser = await database_1.default.execute(existingEmailUserQuery, [googleProfile.emails[0].value], { prepare: true });
        if (existingEmailUser.rowLength > 0) {
            // Link Google account to existing email account
            const user = existingEmailUser.first();
            const updateQuery = `
        UPDATE users 
        SET google_id = ?, display_name = ?, profile_picture = ?, auth_provider = ?, updated_at = ?
        WHERE id = ?
      `;
            const profilePicture = googleProfile.photos && googleProfile.photos.length > 0
                ? googleProfile.photos[0].value : null;
            await database_1.default.execute(updateQuery, [
                googleProfile.id,
                googleProfile.displayName,
                profilePicture,
                'google',
                new Date(),
                user.id
            ], { prepare: true });
            logger_1.default.logSecurityEvent('Linked Google account to existing email', { userId: user.id.toString() }, 'N/A');
            return done(null, {
                id: user.id.toString(),
                email: user.email,
                displayName: googleProfile.displayName,
                profilePicture: profilePicture,
                authProvider: 'google'
            });
        }
        // Create new user
        const userId = (0, uuid_1.v4)();
        const now = new Date();
        const profilePicture = googleProfile.photos && googleProfile.photos.length > 0
            ? googleProfile.photos[0].value : null;
        const insertQuery = `
      INSERT INTO users 
      (id, email, google_id, display_name, profile_picture, auth_provider, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await database_1.default.execute(insertQuery, [
            userId,
            googleProfile.emails[0].value,
            googleProfile.id,
            googleProfile.displayName,
            profilePicture,
            'google',
            now,
            now
        ], { prepare: true });
        logger_1.default.logSecurityEvent('New user created via Google OAuth', { userId }, 'N/A');
        return done(null, {
            id: userId,
            email: googleProfile.emails[0].value,
            displayName: googleProfile.displayName,
            profilePicture: profilePicture,
            authProvider: 'google'
        });
    }
    catch (error) {
        logger_1.default.logSecurityEvent('Google OAuth error', { error }, undefined, 'N/A');
        console.error('Google OAuth error:', error);
        return done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const userQuery = 'SELECT * FROM users WHERE id = ? LIMIT 1';
        const result = await database_1.default.execute(userQuery, [id], { prepare: true });
        const user = result.first();
        if (user) {
            done(null, {
                id: user.id.toString(),
                email: user.email,
                displayName: user.display_name,
                profilePicture: user.profile_picture,
                authProvider: user.auth_provider
            });
        }
        else {
            done(null, false);
        }
    }
    catch (error) {
        done(error, false);
    }
});
exports.default = passport_1.default;
