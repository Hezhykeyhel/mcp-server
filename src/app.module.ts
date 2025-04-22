import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './auth/prisma/prisma.service';
import { ServerModule } from './server/server.module';
import { LoggerService } from './logger/logger.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuthModule, ScheduleModule.forRoot(), UserModule, ServerModule],
  providers: [PrismaService, LoggerService],
  exports: [LoggerService],
})
export class AppModule {}
