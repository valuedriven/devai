import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred';
    let errors: string[] | undefined;

    const getMessage = (
      responseBody: string | Record<string, unknown>,
    ): string | string[] | undefined => {
      if (typeof responseBody === 'string') {
        return responseBody;
      }
      const message = responseBody.message;
      if (
        Array.isArray(message) &&
        message.every((m): m is string => typeof m === 'string')
      ) {
        return message;
      }
      if (typeof message === 'string') {
        return message;
      }
      return undefined;
    };

    if (
      exception instanceof BadRequestException ||
      exception instanceof NotFoundException ||
      exception instanceof UnauthorizedException ||
      exception instanceof ForbiddenException ||
      exception instanceof HttpException
    ) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      const safeBody: string | Record<string, unknown> =
        typeof responseBody === 'object' && responseBody !== null
          ? (responseBody as Record<string, unknown>)
          : typeof responseBody === 'string'
            ? responseBody
            : {};
      const message = getMessage(safeBody);

      if (exception instanceof BadRequestException) {
        title = 'Bad Request';
        if (Array.isArray(message)) {
          detail = message.join('; ');
          errors = message;
        } else {
          detail = message || title;
        }
      } else if (exception instanceof NotFoundException) {
        title = 'Not Found';
        detail = typeof message === 'string' ? message : title;
      } else if (exception instanceof UnauthorizedException) {
        title = 'Unauthorized';
        detail = typeof message === 'string' ? message : title;
      } else if (exception instanceof ForbiddenException) {
        title = 'Forbidden';
        detail = typeof message === 'string' ? message : title;
      } else {
        if (typeof safeBody === 'string') {
          title = safeBody;
          detail = safeBody;
        } else {
          title =
            (typeof message === 'string' ? message : exception.message) ||
            title;
          detail =
            (typeof message === 'string' ? message : exception.message) ||
            title;
          if (Array.isArray(message)) {
            detail = message.join('; ');
            errors = message;
          }
        }
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const problemDetails: Record<string, unknown> = {
      type: `https://httpstatuses.org/${status}`,
      title,
      status,
      detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      problemDetails.errors = errors;
    }

    response.status(status).json(problemDetails);
  }
}
