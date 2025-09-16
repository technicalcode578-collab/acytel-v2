"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Logger {
    constructor() {
        this.logFile = path_1.default.join(process.cwd(), 'auth-security.log');
    }
    writeLog(entry) {
        const logLine = JSON.stringify(entry) + '\n';
        fs_1.default.appendFileSync(this.logFile, logLine);
    }
    logAuthSuccess(userId, ip, provider) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: 'Authentication successful',
            data: { provider },
            userId,
            ip,
        });
    }
    logAuthFailure(ip, reason, email) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: 'WARN',
            message: 'Authentication failed',
            data: { reason, email },
            ip,
        });
    }
    logSecurityEvent(message, data, userId, ip) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            data,
            userId,
            ip,
        });
    }
}
exports.default = new Logger();
