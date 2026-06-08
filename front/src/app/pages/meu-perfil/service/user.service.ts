import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse, User } from '../../../core/models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`).pipe(
      map((res) => res.data),
    );
  }

  updateProfile(name: string, avatar?: string): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/profile`, { name, avatar }).pipe(
      map((res) => res.data),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    }).pipe(
      map(() => undefined),
    );
  }
}
