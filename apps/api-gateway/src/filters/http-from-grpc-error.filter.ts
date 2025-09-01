import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ServiceError, status as Grpc } from '@grpc/grpc-js';
import { Response } from 'express';

/**
 * Determina si un valor desconocido cumple la forma de un `ServiceError` de gRPC.
 *
 * @param e Valor a inspeccionar.
 * @returns `true` si el valor tiene las propiedades mínimas de un `ServiceError`,
 *          en caso contrario `false`.
 */

function isGrpcServiceError(e: unknown): e is ServiceError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    'details' in e &&
    'message' in e
  );
}

/**
 * Filtro de excepciones para traducir errores de gRPC a respuestas HTTP.
 *
 * Uso recomendado: registrar como filtro global en la API Gateway cuando
 * se consumen microservicios gRPC, para entregar códigos y mensajes HTTP
 * coherentes al cliente.
 */

@Catch()
export class HttpFromGrpcErrorFilter implements ExceptionFilter {
  /**
   * Captura cualquier excepción lanzada durante el manejo de una petición HTTP.
   *
   * - Si la excepción es un `ServiceError` de gRPC, se convierte a un
   *   estado HTTP usando `grpcToHttp` y se retorna un JSON con `{ message }`
   *   basado en `err.details`.
   * - Si no es un error de gRPC, la excepción se devuelve sin tocar para que
   *   otros filtros o el manejador por defecto continúen el flujo.
   *
   * @param exception Excepción capturada (puede ser de cualquier tipo).
   * @param host Contexto de NestJS con acceso a la respuesta HTTP.
   * @returns La respuesta enviada o la excepción original si no se procesa aquí.
   */

  catch(exception: unknown, host: ArgumentsHost) {
    const res: Response = host.switchToHttp().getResponse<Response>();
    // const err = exception as ServiceError;

    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }

    if (isGrpcServiceError(exception)) {
      const err = exception;
      const http = this.grpcToHttp(err.code);
      return res.status(http).json({ message: err.details });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }

  /**
   * Mapea códigos de estado gRPC a códigos de estado HTTP.
   *
   * Referencia principal:
   * - INVALID_ARGUMENT, FAILED_PRECONDITION, OUT_OF_RANGE -> 400 Bad Request
   * - UNAUTHENTICATED -> 401 Unauthorized
   * - PERMISSION_DENIED -> 403 Forbidden
   * - NOT_FOUND -> 404 Not Found
   * - ALREADY_EXISTS -> 409 Conflict
   * - RESOURCE_EXHAUSTED -> 429 Too Many Requests
   * - CANCELLED -> 499 Client Closed Request (convención usada por algunos proxies)
   * - UNKNOWN, INTERNAL -> 500 Internal Server Error
   * - UNIMPLEMENTED -> 501 Not Implemented
   * - UNAVAILABLE -> 503 Service Unavailable
   * - DEADLINE_EXCEEDED -> 504 Gateway Timeout
   * - Cualquier otro -> 500 Internal Server Error
   *
   * @param code Código gRPC (`status`) opcional.
   * @returns Código de estado HTTP equivalente.
   */

  private grpcToHttp(code?: number) {
    switch (code) {
      case Grpc.INVALID_ARGUMENT:
        return 400;
      case Grpc.FAILED_PRECONDITION:
      case Grpc.OUT_OF_RANGE:
        return 400;
      case Grpc.UNAUTHENTICATED:
        return 401;
      case Grpc.PERMISSION_DENIED:
        return 403;
      case Grpc.NOT_FOUND:
        return 404;
      case Grpc.ALREADY_EXISTS:
        return 409;
      case Grpc.RESOURCE_EXHAUSTED:
        return 429;
      case Grpc.CANCELLED:
        return 499;
      case Grpc.UNKNOWN:
      case Grpc.INTERNAL:
        return 500;
      case Grpc.UNIMPLEMENTED:
        return 501;
      case Grpc.UNAVAILABLE:
        return 503;
      case Grpc.DEADLINE_EXCEEDED:
        return 504;
      default:
        return 500;
    }
  }
}
