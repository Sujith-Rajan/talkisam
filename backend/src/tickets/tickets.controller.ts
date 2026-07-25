import { Controller, Post, Body, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketStatusDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post()
  @Roles('USER')
  create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(req.user.id, createTicketDto);
  }

  @Get('stats')
  @Roles('ADMIN')
  getStats() {
    return this.ticketsService.getStats();
  }

  @Get('admin/user/:userId')
  @Roles('ADMIN')
  getUserTickets(@Param('userId') userId: string) {
    return this.ticketsService.findAllByUser(userId);
  }

  @Post('admin/reply/:userId')
  @Roles('ADMIN')
  adminReply(@Param('userId') userId: string, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createAdminReply(userId, createTicketDto);
  }

  @Get('archives')
  findArchives(@Request() req) {
    if (req.user.role === 'ADMIN') {
      return this.ticketsService.findArchives();
    }
    return this.ticketsService.findArchivesByUser(req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    if (req.user.role === 'ADMIN') {
      return this.ticketsService.findAll();
    }
    return this.ticketsService.findAllByUser(req.user.id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(id, updateTicketStatusDto);
  }
}
