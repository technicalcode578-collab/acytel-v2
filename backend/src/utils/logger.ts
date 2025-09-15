import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  data?: any;
  userId?: string;
  ip?: string;
}

class Logger {
  private logFile: string;

  constructor() {
    this.logFile = path.join(process.cwd(), 'auth-security.log');
  }

  private writeLog(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.logFile, logLine);
  }

  logAuthSuccess(userId: string, ip: string, provider: string) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'Authentication successful',
      data: { provider },
      userId,
      ip,
    });
  }

  logAuthFailure(ip: string, reason: string, email?: string) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: 'Authentication failed',
      data: { reason, email },
      ip,
    });
  }

  logSecurityEvent(message: string, data?: any, userId?: string, ip?: string) {
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

export default new Logger();
