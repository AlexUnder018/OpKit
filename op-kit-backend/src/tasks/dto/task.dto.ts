import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from 'generated/prisma/enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @IsOptional()
  description!: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
