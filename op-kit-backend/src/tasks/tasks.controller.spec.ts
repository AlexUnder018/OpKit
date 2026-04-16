import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { TaskStatus } from '../../generated/prisma';

describe('TasksController', () => {
  let controller: TasksController;

  const mockTasksService = {
    getAllTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);

    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should return all tasks for the authenticated user', async () => {
      const userId = 1;
      const expectedTasks = [
        { id: 1, title: 'Task 1', userId },
        { id: 2, title: 'Task 2', userId },
      ];

      mockTasksService.getAllTasks.mockResolvedValue(expectedTasks);

      const result = await controller.getAllTasks(userId);

      expect(mockTasksService.getAllTasks).toHaveBeenCalledWith(userId);
      expect(mockTasksService.getAllTasks).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedTasks);
    });
  });

  describe('createTask', () => {
    it('should create a new task for the authenticated user', async () => {
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
      };

      mockTasksService.createTask.mockResolvedValue(createdTask);

      const result = await controller.createTask(userId, dto);

      expect(mockTasksService.createTask).toHaveBeenCalledWith(userId, dto);
      expect(mockTasksService.createTask).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const userId = 1;
      const taskId = 1;
      const dto: UpdateTaskDto = {
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = {
        id: taskId,
        title: dto.title,
        description: 'Description',
        userId,
        status: TaskStatus.IN_PROGRESS,
      };

      mockTasksService.updateTask.mockResolvedValue(updatedTask);

      const result = await controller.updateTask(userId, taskId, dto);

      expect(mockTasksService.updateTask).toHaveBeenCalledWith(
        userId,
        taskId,
        dto,
      );
      expect(mockTasksService.updateTask).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const userId = 1;
      const taskId = 1;
      const deletedTask = {
        id: taskId,
        title: 'Deleted Task',
        description: 'Description',
        userId,
        status: 'TODO',
      };

      mockTasksService.deleteTask.mockResolvedValue(deletedTask);

      const result = await controller.deleteTask(userId, taskId);

      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(userId, taskId);
      expect(mockTasksService.deleteTask).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedTask);
    });
  });
});
