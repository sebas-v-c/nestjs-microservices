import { Controller } from '@nestjs/common';
import { FuenteService } from './fuente.service';
import { FuenteServiceControllerMethods } from '@app/proto-types/financiero';

/**
 * Controlador gRPC del dominio Financiero.
 *
 * Implementa los handlers definidos en el contrato gRPC (FuenteService)
 * mediante el decorador `@FuenteServiceControllerMethods()`. Cada
 * invocación RPC se delega al servicio de aplicación correspondiente.
 *
 * Responsabilidades:
 * - Mantener la forma de entrada/salida según el esquema protobuf generado.
 * - Delegar la lógica de negocio al `FuenteService`.
 */

@Controller()
@FuenteServiceControllerMethods()
export class FinancieroController {
  /**
   * Crea una instancia del controlador e inyecta el servicio de fuentes.
   *
   * @param fuenteService Servicio de aplicación para operaciones de fuentes financieras.
   */

  constructor(private readonly fuenteService: FuenteService) {}

  /**
   * Handler gRPC: Listado de fuentes financieras.
   *
   * - Atiende la operación `getFuentes` definida en el servicio gRPC.
   * - Retorna un objeto con la forma `{ fuentes: Fuente[] }`, compatible con el contrato.
   *
   * Errores:
   * - Puede propagar `RpcException` mapeadas a códigos gRPC en caso de
   *   condiciones de negocio no satisfechas (por ejemplo, NOT_FOUND).
   *
   * @returns Objeto con la colección de fuentes financieras.
   */
  getFuentes() {
    return this.fuenteService.getFuentes();
  }
}
