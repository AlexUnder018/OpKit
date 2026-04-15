import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class TasksGateway {
  @WebSocketServer()
  server!: Server;

  sendTaskUpdate(taskId: number, status: string) {
    this.server.emit('task:updated', {
      taskId,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
