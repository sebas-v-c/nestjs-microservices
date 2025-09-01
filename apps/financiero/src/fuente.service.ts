import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
// import { DomainError } from '@app/domain-errors/domain-error';
import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class FuenteService {
  constructor(private readonly prisma: PrismaService) {}

  async getFuentes() {
    const fuentes = await this.prisma.fuente.findMany();
    if (fuentes[0].fnt_id != 3) {
      throw new RpcException({
        code: status.NOT_FOUND,
        details: 'Fuente no encontrada',
      });
    }
    return { fuentes: fuentes };
  }
}
