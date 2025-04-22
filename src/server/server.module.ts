import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaService } from 'src/auth/prisma/prisma.service';
import { ServerCronService } from 'src/server-cronjob/servercronjob';

@Module({
  providers: [ServerService, ServerCronService, PrismaService],
  controllers: [ServerController],
})
export class ServerModule {}
