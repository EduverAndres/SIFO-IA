// backend-nestjs/src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Si la respuesta ya tiene el formato correcto, retornarla tal como está
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        
        // Si no, envolver en el formato estándar
        return {
          success: true,
          message: 'Operación exitosa',
          data,
        };
      }),
    );
  }
}