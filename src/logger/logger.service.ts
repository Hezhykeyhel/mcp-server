import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  logRequest(method: string, url: string) {
    this.log(`[REQUEST] ${method} ${url}`);
  }

  logSuccess(message: string) {
    this.log(`[SUCCESS] ${message}`);
  }

  logError(message: string, trace?: string) {
    this.error(`[ERROR] ${message}`, trace);
  }

  logAuth(event: string, email: string) {
    this.log(`[AUTH] ${event} - ${email}`);
  }

  logServer(event: string, serverName: string, userId: string) {
    this.log(`[SERVER] ${event} - "${serverName}" for user ${userId}`);
  }
}
