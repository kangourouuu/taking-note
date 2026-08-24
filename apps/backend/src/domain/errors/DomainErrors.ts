export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string) {
    super(identifier ? `${entity} with identifier ${identifier} not found` : `${entity} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
