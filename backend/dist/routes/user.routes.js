"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// This route is protected. The authenticateToken middleware will run first.
// If the token is valid, it will call next() and pass control to getCurrentUser.
// If not, the middleware will send a 401/403 response and stop the request.
router.get('/profile', auth_middleware_1.authenticateToken, user_controller_1.getCurrentUser);
// Route to update user profile
router.put('/profile', auth_middleware_1.authenticateToken, user_controller_1.updateCurrentUser);
// Route to delete user account
router.delete('/account', auth_middleware_1.authenticateToken, user_controller_1.deleteCurrentUser);
exports.default = router;
