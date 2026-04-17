import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto, UpdatePerfilDto, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'logitrack_token';
  private readonly REFRESH_KEY = 'logitrack_refresh';
  private readonly USER_KEY = 'logitrack_user';

  currentUser = signal<Usuario | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, dto);
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(response => {
        this.saveSession(response);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  updatePerfil(dto: UpdatePerfilDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${environment.apiUrl}/auth/perfil`, dto).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  changePassword(novaSenha: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, { novaSenha });
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { email });
  }

  getToken(): string | null {
    // Previne erros no Node.js (SSR / Angular Universal)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    }
    if (response.usuario) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
      this.currentUser.set(response.usuario);
    }
  }

  private getUserFromStorage(): Usuario | null {
    // Previne erros no Node.js (SSR / Angular Universal)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
