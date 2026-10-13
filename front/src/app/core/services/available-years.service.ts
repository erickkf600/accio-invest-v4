import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HAS_LOADING } from '../constants/http-context';
import type { ApiResponse } from '../models/auth.models';

/**
 * Anos disponíveis para filtro: do primeiro registro de compra até o ano atual.
 *
 * A requisição é cacheada com `shareReplay`, então é executada apenas uma vez
 * por sessão e o resultado é reutilizado em qualquer parte do projeto.
 */
@Injectable({
  providedIn: 'root',
})
export class AvailableYearsService {
  private http = inject(HttpClient);

  private readonly availableYears$: Observable<string[]> = this.http
    .get<ApiResponse<string[]>>(`${environment.apiUrl}/operations/available-years`, {
      context: new HttpContext().set(HAS_LOADING, false),
    })
    .pipe(
      map((res) => res.data),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  getAvailableYears(): Observable<string[]> {
    return this.availableYears$;
  }
}
