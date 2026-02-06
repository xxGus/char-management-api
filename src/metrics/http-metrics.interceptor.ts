import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const method = typeof request?.method === 'string' ? request.method : 'UNKNOWN';
        const status = response?.statusCode ? String(response.statusCode) : 'unknown';
        const route = this.resolveRoute(request);

        if (route === '/metrics') {
          return;
        }

        this.metrics.observeRequest(method, route, status, durationSeconds);
      })
    );
  }

  private resolveRoute(request: any): string {
    const route =
      request?.routeOptions?.url ??
      request?.routerPath ??
      request?.raw?.url ??
      request?.url ??
      'unknown';

    if (typeof route !== 'string') {
      return 'unknown';
    }

    return route.split('?')[0];
  }
}
