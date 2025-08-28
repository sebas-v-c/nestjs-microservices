import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class FuenteService {
  constructor(private readonly prisma: PrismaService) {}

  async getFuentes() {
    const fuentes = await this.prisma.fuente.findMany();
    return { fuentes: fuentes };
  }
}
