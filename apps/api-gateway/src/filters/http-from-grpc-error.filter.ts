import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ServiceError, status as Grpc } from '@grpc/grpc-js';
import { Response } from 'express';

// import { GrpcExceptionFilter } from '@app/domain-errors';

function isGrpcServiceError(e: unknown): e is ServiceError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    'details' in e &&
    'message' in e
  );
}

@Catch()
export class HttpFromGrpcErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res: Response = host.switchToHttp().getResponse<Response>();
    // const err = exception as ServiceError;

    if (isGrpcServiceError(exception)) {
      const err = exception;
      const http = this.grpcToHttp(err.code);
      return res.status(http).json({ message: err.details });
    }

    return exception;
  }

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
