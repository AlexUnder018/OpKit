import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksGateway } from './tasks.gateway';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { TaskStatus } from '../../generated/prisma';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockTasksGateway = {
    sendTaskUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TasksGateway,
          useValue: mockTasksGateway,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should return all tasks for a user', async () => {
      const userId = 1;
      const expectedTasks = [
        { id: 1, title: 'Task 1', userId },
        { id: 2, title: 'Task 2', userId },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(expectedTasks);

      const result = await service.getAllTasks(userId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(expectedTasks);
    });

    it('should return empty array when user has no tasks', async () => {
      const userId = 1;

      mockPrismaService.task.findMany.mockResolvedValue([]);

      const result = await service.getAllTasks(userId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const userId = 1;
      const dto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task description',
      };
      const createdTask = {
        id: 1,
        title: dto.title,
        description: dto.description,
        userId,
        status: 'TODO',
        createdAt: new Date(),
      };

      mockPrismaService.task.create.mockResolvedValue(createdTask);

      const result = await service.createTask(userId, dto);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          userId,
        },
      });
      expect(result).toEqual(createdTask);
    });

    it('should create a task without description', async () => {
      const userId = 1;
      const dto = {
        title: 'New Task',
      } as CreateTaskDto;
      const createdTask = {
        id: 1,
        title: dto.title,
        description: null,
        userId,
        status: 'TODO',
        createdAt: new Date(),
      };

      mockPrismaService.task.create.mockResolvedValue(createdTask);

      const result = await service.createTask(userId, dto);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          userId,
        },
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    const userId = 1;
    const taskId = 1;

    it('should update a task successfully', async () => {
      const dto: UpdateTaskDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };
      const existingTask = {
        id: taskId,
        title: 'Old Title',
        description: 'Old description',
        userId,
        status: 'TODO',
      };
      const updatedTask = {
        ...existingTask,
        ...dto,
      };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.updateTask(userId, taskId, dto);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: dto,
      });
      expect(mockTasksGateway.sendTaskUpdate).not.toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });

    it('should update task status and emit websocket event', async () => {
      const dto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };
      const existingTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        userId,
        status: 'TODO',
      };
      const updatedTask = {
        ...existingTask,
        status: TaskStatus.DONE,
      };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.updateTask(userId, taskId, dto);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: dto,
      });
      expect(mockTasksGateway.sendTaskUpdate).toHaveBeenCalledWith(
        updatedTask.id,
        updatedTask.status,
      );
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      const dto: UpdateTaskDto = { title: 'Updated' };

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.updateTask(userId, taskId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateTask(userId, taskId, dto)).rejects.toThrow(
        'Task not found',
      );
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
      expect(mockTasksGateway.sendTaskUpdate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const dto: UpdateTaskDto = { title: 'Updated' };
      const existingTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        userId: 999, // Different user
        status: 'TODO',
      };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);

      await expect(service.updateTask(userId, taskId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateTask(userId, taskId, dto)).rejects.toThrow(
        'Task not found',
      );
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
      expect(mockTasksGateway.sendTaskUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    const userId = 1;
    const taskId = 1;

    it('should delete a task successfully', async () => {
      const existingTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        userId,
        status: 'TODO',
      };
      const deletedTask = { ...existingTask };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockPrismaService.task.delete.mockResolvedValue(deletedTask);

      const result = await service.deleteTask(userId, taskId);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(deletedTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.deleteTask(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteTask(userId, taskId)).rejects.toThrow(
        'Task not found',
      );
      expect(mockPrismaService.task.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      const existingTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        userId: 999, // Different user
        status: 'TODO',
      };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);

      await expect(service.deleteTask(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteTask(userId, taskId)).rejects.toThrow(
        'Task not found',
      );
      expect(mockPrismaService.task.delete).not.toHaveBeenCalled();
    });
  });
});
