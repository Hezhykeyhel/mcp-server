import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerService } from '../server/server.service';

@Injectable()
export class ServerCronService {
  constructor(private readonly serverService: ServerService) {}

  // Start all available (stopped) servers at 7:00 A
  // @Cron('0 7 * * *') // Every day at 7:00 AM
  @Cron('47 4 * * *') // Every day at 4:10 AM
  async startAllServers() {
    // Assuming there's a way to get the admin or userId for the cron job, e.g., you could use a hardcoded admin ID or a predefined user
    const userId = 'some-admin-user-id'; // Replace this with actual logic to get userId

    const availableServers = await this.serverService.getAllAvailableServers();

    for (const server of availableServers) {
      try {
        console.log(`Starting server: ${server.name}`);
        await this.serverService.startServer(userId, server.id); // Pass userId and server.id to verify ownership and start
      } catch (error) {
        console.error(`Failed to start server ${server.name}:`, error);
      }
    }
  }

  // Stop all running servers at 9:00 PM
  // @Cron('0 21 * * *') // Every day at 9:00 PM
  @Cron('48 4 * * *') // Every day at 4:15 AM
  async stopAllServers() {
    const runningServers = await this.serverService.getAllRunningServers();

    for (const server of runningServers) {
      try {
        console.log(`Stopping server: ${server.name}`);
        await this.serverService.stopServer(server.id);
      } catch (error) {
        console.error(`Failed to stop server ${server.name}:`, error);
      }
    }
  }
}
