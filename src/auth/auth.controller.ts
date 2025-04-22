import {
  Body,
  Controller,
  Post,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from 'src/dto/auth.dto';
import { PrismaService } from './prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      this.logger.logAuth(
        'Attempted registration with existing email',
        body.email,
      );
      throw new ConflictException('Email already registered');
    }

    const user = await this.authService.register(body.email, body.password);
    this.logger.logAuth('User registered', body.email);
    return user;
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      this.logger.logAuth('Failed login', body.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.logAuth('Successful login', body.email);
    return this.authService.login(user);
  }
}
