import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
// import { DomainError } from '@app/domain-errors/domain-error';
import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

/**
 * Servicio de aplicación del dominio Financiero para operaciones sobre "Fuentes".
 *
 * Responsabilidades:
 * - Acceder al repositorio de datos mediante `PrismaService`.
 * - Aplicar reglas de negocio y devolver datos con la forma esperada por el contrato RPC.
 * - Propagar errores como `RpcException` usando códigos gRPC apropiados.
 */
@Injectable()
export class FuenteService {
  /**
   * Inyecta el cliente de base de datos.
   * @param prisma Servicio de acceso a datos (Prisma).
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recupera el listado de fuentes desde la base de datos.
   *
   * Contrato de salida:
   * - Retorna un objeto con la forma `{ fuentes: Fuente[] }`, compatible con los tipos generados.
   *
   * Regla de negocio (ejemplo ilustrativo):
   * - Si la primera fuente no cumple `fnt_id === 3`, se considera que no existe el recurso
   *   esperado y se lanza `RpcException` con `status.NOT_FOUND`.
   *
   * Errores:
   * - `RpcException({ code: status.NOT_FOUND, details: 'Fuente no encontrada' })`
   *   cuando la condición de negocio no se satisface.
   */
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
