import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * RFC 7807 Problem Details uyumlu global exception filter.
 * Tüm hatalar standart formatta döner:
 * {
 *   type: string,
 *   title: string,
 *   status: number,
 *   detail: string,
 *   instance: string
 * }
 */
@Catch()
export class Rfc7807ExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'Beklenmeyen bir hata oluştu.';
    let type = 'https://campusconnect.api/errors/internal-server-error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        detail = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, any>;
        detail = resp.message
          ? Array.isArray(resp.message)
            ? resp.message.join('; ')
            : resp.message
          : resp.detail || exception.message;
        title = resp.error || resp.title || this.getDefaultTitle(status);
      }

      type = this.getErrorType(status);
      title = this.getDefaultTitle(status);
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const problemDetails = {
      type,
      title,
      status,
      detail,
      instance: request.url,
    };

    response.status(status).json(problemDetails);
  }

  private getDefaultTitle(status: number): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return titles[status] || 'Error';
  }

  private getErrorType(status: number): string {
    const types: Record<number, string> = {
      400: 'https://campusconnect.api/errors/bad-request',
      401: 'https://campusconnect.api/errors/unauthorized',
      403: 'https://campusconnect.api/errors/forbidden',
      404: 'https://campusconnect.api/errors/not-found',
      409: 'https://campusconnect.api/errors/conflict',
      422: 'https://campusconnect.api/errors/unprocessable-entity',
      429: 'https://campusconnect.api/errors/too-many-requests',
      500: 'https://campusconnect.api/errors/internal-server-error',
    };
    return types[status] || 'https://campusconnect.api/errors/unknown';
  }
}
