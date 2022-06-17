import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./services/auth/guards/jwt-auth.guard";
import { JwtStrategy } from "./services/auth/strategies/jwt.strategy";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {expiresIn: '10000s'}
      })
    })
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
