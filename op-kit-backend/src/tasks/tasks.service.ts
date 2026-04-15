import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { TasksGateway } from './tasks.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private gateway: TasksGateway,
  ) {}

  async getAllTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
    });
  }

  async createTask(userId: number, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId,
      },
    });
  }

  async updateTask(userId: number, taskId: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });

    //  Fire websocket event if status changed
    if (dto.status) {
      this.gateway.sendTaskUpdate(updated.id, updated.status);
    }

    return updated;
  }

  async deleteTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
