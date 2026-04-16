import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { TasksService } from './tasks.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@UseGuards(JwtGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAllTasks(@GetUser('userId') userId: number) {
    return this.tasksService.getAllTasks(userId);
  }

  @Post()
  createTask(@GetUser('userId') userId: number, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(userId, dto);
  }

  @Patch(':id')
  updateTask(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(userId, taskId, dto);
  }

  @Delete(':id')
  deleteTask(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    return this.tasksService.deleteTask(userId, taskId);
  }
}
