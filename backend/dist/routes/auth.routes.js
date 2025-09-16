"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const router = (0, express_1.Router)();
// Existing routes
router.post('/register', rateLimiter_middleware_1.authRateLimit, auth_controller_1.register);
router.post('/login', rateLimiter_middleware_1.authRateLimit, auth_controller_1.login);
// Google OAuth routes
router.get('/google', rateLimiter_middleware_1.authRateLimit, passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force account selection for better UX
}));
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${process.env.CORS_ORIGIN}/welcome?error=oauth_failed`,
    session: false
}), auth_controller_1.googleCallback);
// Protected route to get user profile
router.get('/profile', auth_middleware_1.authenticateToken, auth_controller_1.refreshUserProfile);
router.post('/logout', auth_middleware_1.authenticateToken, auth_controller_1.logout);
exports.default = router;
