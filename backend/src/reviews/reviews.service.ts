import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByReportId(reportId: string) {
    return this.prisma.review.findMany({
      where: { reportId },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        reportVersion: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
