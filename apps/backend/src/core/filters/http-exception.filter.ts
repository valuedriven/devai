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

    if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      const body = exception.getResponse() as Record<string, any>;
      title = 'Bad Request';
      detail = Array.isArray(body.message)
        ? body.message.join('; ')
        : body.message || title;
      if (Array.isArray(body.message)) {
        errors = body.message;
      }
    } else if (exception instanceof NotFoundException) {
      status = exception.getStatus();
      title = 'Not Found';
      detail =
        (exception.getResponse() as Record<string, any>).message || title;
    } else if (exception instanceof UnauthorizedException) {
      status = exception.getStatus();
      title = 'Unauthorized';
      detail =
        (exception.getResponse() as Record<string, any>).message || title;
    } else if (exception instanceof ForbiddenException) {
      status = exception.getStatus();
      title = 'Forbidden';
      detail =
        (exception.getResponse() as Record<string, any>).message || title;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        title = responseBody;
        detail = responseBody;
      } else if (typeof responseBody === 'object') {
        const body = responseBody as Record<string, any>;
        title = body.message || exception.message;
        detail = body.message || exception.message;
        if (Array.isArray(body.message)) {
          detail = body.message.join('; ');
          errors = body.message;
        }
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const problemDetails: Record<string, any> = {
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
