import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwtguard/jwt-auth.guard';
import { ServerService } from './server.service';
import { CreateServerDto } from 'src/dto/create-server-dto';
import { PrismaService } from 'src/auth/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('server')
export class ServerController {
  constructor(
    private readonly serverService: ServerService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Request() req, @Body() body: CreateServerDto) {
    const userId = req.user.userId;

    // Check for duplicate server name for the current user
    const existing = await this.prisma.server.findFirst({
      where: {
        name: body.name,
        userId,
      },
    });

    if (existing) {
      throw new ConflictException('You already have a server with this name');
    }

    return this.serverService.createServer(userId, body);
  }

  @Get()
  findAll(@Request() req) {
    // Pass userId to ensure we only get servers that belong to the logged-in user
    return this.serverService.getUserServers(req.user.userId);
  }

  @Patch(':id/start')
  async start(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.serverService.startServer(userId, id);
  }

  @Patch(':id/stop')
  async stop(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    try {
      const server = await this.prisma.server.findUnique({
        where: { id },
      });

      if (!server) {
        throw new NotFoundException('Server not found');
      }

      if (server.userId !== userId) {
        throw new NotFoundException('You do not own this server');
      }

      return this.serverService.stopServer(id); // Now directly call the stop method from service
    } catch (error) {
      throw error; // Rethrow the error for proper handling
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.serverService.deleteServer(id);
  }
}
