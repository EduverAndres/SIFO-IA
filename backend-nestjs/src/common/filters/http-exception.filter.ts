// backend-nestjs/src/common/filters/http-exception.filter.ts
import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException,
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message,
      error: exception.getResponse(),
    };

    // Log del error para debugging
    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}