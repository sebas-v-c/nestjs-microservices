import { status } from '@grpc/grpc-js';

export class DomainError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: status,
    public readonly meta?: Record<string, any>,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
