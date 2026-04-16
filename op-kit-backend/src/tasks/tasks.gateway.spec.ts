import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { TasksGateway } from './tasks.gateway';

describe('TasksGateway', () => {
  let gateway: TasksGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksGateway],
    }).compile();

    gateway = module.get<TasksGateway>(TasksGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('sendTaskUpdate', () => {
    it('should emit task:updated event with task data', () => {
      const mockEmit = jest.fn<void, [string, unknown]>();
      const mockServer = { emit: mockEmit } as unknown as Server;
      gateway.server = mockServer;

      const taskId = 1;
      const status = 'DONE';

      gateway.sendTaskUpdate(taskId, status);

      expect(mockEmit).toHaveBeenCalledWith('task:updated', {
        taskId,
        status,
        timestamp: expect.any(String),
      });
    });

    it('should emit with correct taskId and status values', () => {
      const mockEmit = jest.fn();
      const mockServer = { emit: mockEmit } as unknown as Server;
      gateway.server = mockServer;

      gateway.sendTaskUpdate(999, 'IN_PROGRESS');

      expect(mockEmit).toHaveBeenCalledWith(
        'task:updated',
        expect.objectContaining({
          taskId: 999,
          status: 'IN_PROGRESS',
        }),
      );
    });

    it('should include ISO timestamp in the emitted event', () => {
      const mockEmit = jest.fn();
      const mockServer = { emit: mockEmit } as unknown as Server;
      gateway.server = mockServer;

      const beforeCall = Date.now();
      gateway.sendTaskUpdate(1, 'TODO');
      const afterCall = Date.now();

      const emittedData: { timestamp: string } = mockEmit.mock.calls[0][1] as {
        timestamp: string;
      };
      expect(emittedData.timestamp).toBeDefined();
      const emittedTimestamp = new Date(emittedData.timestamp).getTime();
      expect(emittedTimestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(emittedTimestamp).toBeLessThanOrEqual(afterCall);
    });
  });
});
