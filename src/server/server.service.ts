import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from 'src/auth/prisma/prisma.service';
import { CreateServerDto } from 'src/dto/create-server-dto';

@Injectable()
export class ServerService {
  private processes = new Map<string, any>(); // in-memory process map

  constructor(private prisma: PrismaService) {}

  async createServer(userId: string, data: CreateServerDto) {
    const serverPath = path.join(__dirname, '../../minecraft', data.name);
    fs.mkdirSync(serverPath, { recursive: true });

    return this.prisma.server.create({
      data: {
        name: data.name,
        version: data.version,
        port: data.port,
        status: 'stopped',
        path: serverPath,
        userId,
      },
    });
  }

  async getUserServers(userId: string) {
    return this.prisma.server.findMany({
      where: { userId },
    });
  }

  async getAllAvailableServers() {
    return this.prisma.server.findMany({
      where: { status: 'stopped' },
    });
  }

  async getAllRunningServers() {
    return this.prisma.server.findMany({
      where: { status: 'running' },
    });
  }

  async verifyServerOwnership(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.userId !== userId) {
      throw new ForbiddenException('You do not own this server');
    }

    return server;
  }

  async startServer(userId: string, serverId: string) {
    try {
      const server = await this.verifyServerOwnership(serverId, userId); // Check ownership
      const javaPath = '/Users/egbetayo/.jenv/shims/java'; // Full path to java
      const jarPath = path.join(server.path, 'server.jar');

      // Get environment variables from the current shell
      const env = {
        ...process.env,
        PATH: `${process.env.PATH}:/Users/egbetayo/.jenv/shims`,
      };

      const mcProcess = spawn(
        javaPath,
        ['-Xmx1024M', '-Xms1024M', '-jar', jarPath, 'nogui'],
        { cwd: server.path, env },
      );

      this.processes.set(serverId, mcProcess);

      mcProcess.stdout.on('data', (data) =>
        console.log(`[${server.name}]`, data.toString()),
      );

      mcProcess.stderr.on('data', (data) =>
        console.error(`[${server.name}]`, data.toString()),
      );

      mcProcess.on('exit', (code) => {
        if (code !== 0) {
          console.error(`[${server.name}] Process exited with code ${code}`);
        }
        this.prisma.server.update({
          where: { id: serverId },
          data: { status: 'stopped' },
        });
        // this.processes.delete(serverId);
      });

      // Update server status in DB
      await this.prisma.server.update({
        where: { id: serverId },
        data: { status: 'running' },
      });

      return { message: 'Server started' };
    } catch (error) {
      console.error('Error starting server:', error);
      throw new Error('Failed to start server');
    }
  }

  async stopServer(serverId: string) {
    const process = this.processes.get(serverId);
    if (process) {
      process.stdin.write('stop\n');
      this.processes.delete(serverId);

      await this.prisma.server.update({
        where: { id: serverId },
        data: { status: 'stopped' },
      });

      return { message: 'Server stopping...' };
    }

    return { message: 'Server not running' };
  }

  async deleteServer(serverId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });
    if (!server) throw new NotFoundException();

    this.stopServer(serverId); // ensure it's stopped

    await this.prisma.server.delete({ where: { id: serverId } });

    return { message: 'Server deleted' };
  }
}
