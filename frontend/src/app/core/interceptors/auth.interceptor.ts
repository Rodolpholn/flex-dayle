import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let clonedReq = req;

  // 1. Lógica de "Ida": Adiciona o token se ele existir
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 2. Lógica de "Volta": Escuta a resposta da API
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se a API retornar 401 (Não autorizado) ou 403 (Proibido)
      if (error.status === 401 || error.status === 403) {
        console.warn('Sessão inválida ou expirada. Deslogando...');

        // Limpa o localStorage/Session através do seu serviço
        authService.logout();

        // Redireciona para a tela de login
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
