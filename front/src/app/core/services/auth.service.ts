import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ApiResponse,
  AuthResponseData,
  User,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';

const KEYS = {
  ACCESS_TOKEN: 'accio_access_token',
  REFRESH_TOKEN: 'accio_refresh_token',
  USER: 'accio_user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = `${environment.apiUrl}/auth`;

  private userSignal = signal<User | null>(this.load<User>(KEYS.USER));
  private accessTokenSignal = signal<string | null>(
    localStorage.getItem(KEYS.ACCESS_TOKEN)
  );

  readonly user = this.userSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());

  login(data: LoginRequest): Observable<void> {
    return this.http
      .post<ApiResponse<AuthResponseData>>(`${this.authUrl}/login`, data)
      .pipe(
        tap((res) => {
          if (!res?.data) return;
          this.save(KEYS.ACCESS_TOKEN, res.data.accessToken);
          this.save(KEYS.REFRESH_TOKEN, res.data.refreshToken);
          this.saveObj(KEYS.USER, res.data.user);
          this.userSignal.set(res.data.user);
          this.accessTokenSignal.set(res.data.accessToken);
        }),
        map(() => undefined),
      );
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http
      .post<ApiResponse<AuthResponseData>>(`${this.authUrl}/register`, data)
      .pipe(
        tap((res) => {
          if (!res?.data) return;
          this.save(KEYS.ACCESS_TOKEN, res.data.accessToken);
          this.save(KEYS.REFRESH_TOKEN, res.data.refreshToken);
          this.saveObj(KEYS.USER, res.data.user);
          this.userSignal.set(res.data.user);
          this.accessTokenSignal.set(res.data.accessToken);
        }),
        map(() => undefined),
      );
  }

  refreshToken(): Observable<void> {
    const refreshToken = localStorage.getItem(KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http
      .post<ApiResponse<AuthResponseData>>(`${this.authUrl}/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((res) => {
          if (!res?.data) return;
          this.save(KEYS.ACCESS_TOKEN, res.data.accessToken);
          this.save(KEYS.REFRESH_TOKEN, res.data.refreshToken);
          this.accessTokenSignal.set(res.data.accessToken);
        }),
        map(() => undefined),
      );
  }

  logout(): void {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.USER);
    this.userSignal.set(null);
    this.accessTokenSignal.set(null);
  }

  private save(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private saveObj<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private load<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }
}
