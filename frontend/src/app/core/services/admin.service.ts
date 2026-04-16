import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboard } from '../models/rota.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.baseUrl}/dashboard`);
  }

  getUsuarios(search?: string): Observable<Usuario[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, { params });
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${id}`);
  }

  blockUsuario(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${id}/bloquear`, {});
  }

  unblockUsuario(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${id}/desbloquear`, {});
  }

  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`);
  }

  resetSenha(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/${id}/reset-senha`, {});
  }
}
