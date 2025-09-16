"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express")); // We no longer need 'json' from here
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser"); // Import the parser from body-parser
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const track_routes_1 = __importDefault(require("./routes/track.routes"));
const playlist_routes_1 = __importDefault(require("./routes/playlist.routes"));
const search_service_1 = require("./services/search.service");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: process.env.CORS_ORIGIN
};
// --- Middleware Setup ---
// This MUST come BEFORE your app.use('/api/...') routes
app.use((0, cors_1.default)(corsOptions));
app.use((0, body_parser_1.json)()); // Use the body-parser middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// --- API Routes ---
app.use('/api/auth', auth_routes_1.default);
console.log('Registering user routes');
app.use('/api/users', user_routes_1.default);
app.use('/api/tracks', track_routes_1.default);
app.use('/api/playlists', playlist_routes_1.default);
// --- Server Listener ---
(0, search_service_1.initializeTrackCollection)().catch(console.error);
app.listen(PORT, () => {
    console.log(`Acytel backend server running on http://localhost:${PORT}`);
});
