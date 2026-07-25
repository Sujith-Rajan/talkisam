import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  async onModuleInit() {
    // Seed an admin user if one doesn't exist
    const adminExists = await this.userModel.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await this.userModel.create({
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'ADMIN',
      });
      console.log('Hardcoded admin user created: admin@admin.com / Admin@123');
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      role: 'USER', // Ensure standard users always get the USER role
    });

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d', secret: 'super-secret-refresh-key' });

    return {
      access_token,
      refresh_token,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d', secret: 'super-secret-refresh-key' });

    return {
      access_token,
      refresh_token,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: 'super-secret-refresh-key' });
      const newPayload = { email: payload.email, sub: payload.sub };
      const access_token = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const refresh_token = this.jwtService.sign(newPayload, { expiresIn: '7d', secret: 'super-secret-refresh-key' });
      return { access_token, refresh_token };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
