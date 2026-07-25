import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TicketStatus } from '../schemas/ticket.schema';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateTicketStatusDto {
  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
