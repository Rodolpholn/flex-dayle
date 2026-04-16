import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateRotaDto, DashboardData, Rota, UpdateRotaDto } from '../models/rota.model';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private readonly baseUrl = `${environment.apiUrl}/rotas`;

  constructor(private http: HttpClient) {}

  getRotas(mes?: number, ano?: number): Observable<Rota[]> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes.toString());
    if (ano) params = params.set('ano', ano.toString());
    return this.http.get<Rota[]>(this.baseUrl, { params });
  }

  getRota(id: string): Observable<Rota> {
    return this.http.get<Rota>(`${this.baseUrl}/${id}`);
  }

  createRota(dto: CreateRotaDto): Observable<Rota> {
    return this.http.post<Rota>(this.baseUrl, dto);
  }

  updateRota(id: string, dto: UpdateRotaDto): Observable<Rota> {
    return this.http.put<Rota>(`${this.baseUrl}/${id}`, dto);
  }

  deleteRota(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getDashboard(mes?: number, ano?: number): Observable<DashboardData> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes.toString());
    if (ano) params = params.set('ano', ano.toString());
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`, { params });
  }
}
