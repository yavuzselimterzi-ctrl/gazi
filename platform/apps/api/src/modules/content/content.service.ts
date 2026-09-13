import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.contentItem.findMany({ where: { isPublished: true } });
  }

  async create(data: { title: string; slug: string; body: string; category: string }) {
    return this.prisma.contentItem.create({ data: { ...data, isPublished: true } });
  }
}
