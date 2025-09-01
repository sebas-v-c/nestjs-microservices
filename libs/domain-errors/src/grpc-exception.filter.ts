import { Catch, ExceptionFilter } from '@nestjs/common';
import { throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(e: any) {
    if (e instanceof RpcException) {
      return throwError(() => e.getError());
    }
    return throwError(() => ({
      code: status.INTERNAL,
      message: 'Internal server error',
    }));
  }
}
