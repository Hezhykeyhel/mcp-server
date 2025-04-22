import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../auth/prisma.service';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ServerService {
  private processes = new Map<string, any>(); // in-memory process map

  constructor(private prisma: PrismaService) {}

  async createServer(
    userId: string,
    data: { name: string; version: string; port: number },
  ) {
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

  async startServer(serverId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });
    if (!server) throw new NotFoundException('Server not found');

    const jarPath = path.join(server.path, 'server.jar');
    const mcProcess = spawn(
      'java',
      ['-Xmx1024M', '-Xms1024M', '-jar', jarPath, 'nogui'],
      {
        cwd: server.path,
      },
    );

    this.processes.set(serverId, mcProcess);

    mcProcess.stdout.on('data', (data) =>
      console.log(`[${server.name}]`, data.toString()),
    );
    mcProcess.stderr.on('data', (data) =>
      console.error(`[${server.name}]`, data.toString()),
    );

    await this.prisma.server.update({
      where: { id: serverId },
      data: { status: 'running' },
    });

    return { message: 'Server started' };
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
