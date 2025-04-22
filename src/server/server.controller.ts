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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServerService } from './server.service';

@UseGuards(JwtAuthGuard)
@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: { name: string; version: string; port: number },
  ) {
    return this.serverService.createServer(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.serverService.getUserServers(req.user.userId);
  }

  @Patch(':id/start')
  start(@Param('id') id: string) {
    return this.serverService.startServer(id);
  }

  @Patch(':id/stop')
  stop(@Param('id') id: string) {
    return this.serverService.stopServer(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.serverService.deleteServer(id);
  }
}
