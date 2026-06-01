import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Ajustado o caminho relativo aqui

// Interface tipando a resposta da API .NET
export interface RelatorioResumoDto {
  faturamentoBruto: number;
  lucroLiquido: number;
  gastoCombustivel: number;
  kmTotalRodado: number;
}

@Injectable({
  providedIn: 'root',
})
export class RelatoriosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rotas/relatorio-mensal`;

  /**
   * Busca o resumo financeiro consolidado do banco Oracle baseado no mês e ano
   */
  getResumoMensal(mes: string, ano: string): Observable<RelatorioResumoDto> {
    return this.http.get<RelatorioResumoDto>(this.apiUrl, {
      params: { mes, ano },
    });
  }
}
