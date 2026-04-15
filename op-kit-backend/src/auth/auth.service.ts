import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/aut.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: AuthDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user in DB
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    return this.signToken(user.id, user.email);
  }

  async login(dto: AuthDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Compare password
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  private async signToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token };
  }
}
