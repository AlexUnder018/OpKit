import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [AuthModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true }), TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
