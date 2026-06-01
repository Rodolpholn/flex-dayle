import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RelatoriosService } from '../../core/services/relatorios.service'; // Novo caminho ajustado!

@Component({
  selector: 'app-relatorios',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class RelatoriosComponent {
  // Signals para capturar a seleção do usuário (Iniciando com o mês atual e ano atual)
  // Como estamos em junho de 2026, iniciamos com '6' e '2026'
  mesSelecionado = signal<string>('6');
  anoSelecionado = signal<string>('2026');

  // Signals para armazenar os valores do resumo financeiro (KPIs)
  faturamentoBruto = signal<number>(0);
  lucroLiquido = signal<number>(0);
  gastoCombustivel = signal<number>(0);
  kmTotalRodado = signal<number>(0);

  // Estado de carregamento para dar um feedback visual premium na tela
  isLoading = signal<boolean>(false);

  /**
   * Método responsável por buscar os dados históricos na sua API .NET
   */
  buscarDadosRelatorio(): void {
    this.isLoading.set(true);

    console.log(`Buscando dados do período: ${this.mesSelecionado()}/${this.anoSelecionado()}`);

    // TODO: Integrar com o RelatoriosService para puxar os dados da VPS da Oracle
    // Temporariamente simulando um delay de rede de 800ms
    setTimeout(() => {
      this.isLoading.set(false);
    }, 800);
  }

  /**
   * Método que vai disparar a geração e o download do PDF
   */
  exportarPDF(): void {
    console.log(
      `Iniciando exportação em PDF para o período: ${this.mesSelecionado()}/${this.anoSelecionado()}`,
    );
    // A lógica de desenho do PDF entrará aqui na próxima etapa
  }

  /**
   * Método que vai gerar e baixar a planilha Excel (CSV)
   */
  exportarCSV(): void {
    console.log(
      `Iniciando exportação em CSV para o período: ${this.mesSelecionado()}/${this.anoSelecionado()}`,
    );
    // A lógica de conversão e download de dados tabulares entrará aqui
  }
}
