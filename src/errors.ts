export class ServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ConfigurationError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super('configuration_error', message, 503, details);
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super('validation_error', message, 422, details);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super('not_found', message, 404, details);
  }
}

export class UpstreamError extends ServiceError {
  constructor(message: string, status: number, details?: unknown) {
    super('upstream_error', message, status, details);
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message = 'Unauthorized') {
    super('unauthorized', message, 401);
  }
}
