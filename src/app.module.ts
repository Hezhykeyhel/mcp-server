import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './auth/prisma.service';
import { ServerModule } from './server/server.module';

@Module({
  imports: [AuthModule, UserModule, ServerModule],
  providers: [PrismaService],
})
export class AppModule {}
