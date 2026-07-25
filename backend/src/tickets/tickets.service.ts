import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTicketDto, UpdateTicketStatusDto } from './dto/ticket.dto';
import { Ticket, TicketStatus } from './schemas/ticket.schema';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async getStats() {
    const totalUsers = await this.userModel.countDocuments({ role: 'USER' });
    const totalTickets = await this.ticketModel.countDocuments();
    const openTickets = await this.ticketModel.countDocuments({ status: TicketStatus.OPEN });
    const inProgressTickets = await this.ticketModel.countDocuments({ status: TicketStatus.IN_PROGRESS });
    const closedTickets = await this.ticketModel.countDocuments({ status: TicketStatus.CLOSED });

    return {
      totalUsers,
      totalTickets,
      openTickets,
      inProgressTickets,
      closedTickets
    };
  }

  async create(userId: string, createTicketDto: CreateTicketDto) {
    return this.ticketModel.create({
      ...createTicketDto,
      userId: new Types.ObjectId(userId),
      senderRole: 'USER',
    });
  }

  async createAdminReply(userId: string, createTicketDto: CreateTicketDto) {
    return this.ticketModel.create({
      ...createTicketDto,
      userId: new Types.ObjectId(userId),
      senderRole: 'ADMIN',
    });
  }

  async findAll() {
    return this.ticketModel.find({ status: { $ne: TicketStatus.CLOSED } }).populate('userId', 'email role');
  }

  async findAllByUser(userId: string) {
    return this.ticketModel.find({ userId: new Types.ObjectId(userId), status: { $ne: TicketStatus.CLOSED } });
  }

  async findArchives() {
    return this.ticketModel.find({ status: TicketStatus.CLOSED }).populate('userId', 'email role');
  }

  async findArchivesByUser(userId: string) {
    return this.ticketModel.find({ userId: new Types.ObjectId(userId), status: TicketStatus.CLOSED });
  }

  async updateStatus(id: string, updateTicketStatusDto: UpdateTicketStatusDto) {
    const ticket = await this.ticketModel.findByIdAndUpdate(
      id,
      { status: updateTicketStatusDto.status },
      { new: true }
    );

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }
}
