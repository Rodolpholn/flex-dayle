import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RelatoriosService } from '../../core/services/relatorios.service'; // Verifique se o caminho do seu service está certinho
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-relatorios',
  imports: [FormsModule, CommonModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class RelatoriosComponent {
  private relatoriosService = inject(RelatoriosService);

  // Signals de controle da tela
  mesSelecionado = signal<string>('6');
  anoSelecionado = signal<string>('2026');
  isLoading = signal<boolean>(false);

  // Signals para armazenar os valores que o HTML exibe nos cards
  faturamentoBruto = signal<number>(0);
  lucroLiquido = signal<number>(0);
  gastoCombustivel = signal<number>(0);
  kmTotalRodado = signal<number>(0);

  /**
   * Executa a busca real batendo no backend do Docker na Oracle VPS
   */
  buscarDadosRelatorio(): void {
    this.isLoading.set(true);

    // Chama o service enviando os Signals de mês e ano escolhidos na tela
    this.relatoriosService.getResumoMensal(this.mesSelecionado(), this.anoSelecionado()).subscribe({
      next: (dados) => {
        // Injeta os dados vindos do banco Oracle nos Signals da tela
        this.faturamentoBruto.set(dados.faturamentoBruto);
        this.lucroLiquido.set(dados.lucroLiquido);
        this.gastoCombustivel.set(dados.gastoCombustivel);
        this.kmTotalRodado.set(dados.kmTotalRodado);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do relatório da API:', err);
        this.isLoading.set(false);
      },
    });
  }

  exportarPDF(): void {
    // Declaração do construtor jsPDF instanciada de forma explícita
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Mapeamento local dos meses para evitar erros de propriedade na classe
    const nomesMeses: { [key: string]: string } = {
      '1': 'Janeiro',
      '2': 'Fevereiro',
      '3': 'Março',
      '4': 'Abril',
      '5': 'Maio',
      '6': 'Junho',
      '7': 'Julho',
      '8': 'Agosto',
      '9': 'Setembro',
      '10': 'Outubro',
      '11': 'Novembro',
      '12': 'Dezembro',
    };

    const mesExtenso = nomesMeses[this.mesSelecionado()] || this.mesSelecionado();
    const ano = this.anoSelecionado();

    // --- ESTILIZAÇÃO E CORES ---
    const corPrimaria = [17, 24, 39]; // Gray 900
    const corTexto = [75, 85, 99]; // Gray 600
    const corSucesso = [16, 185, 129]; // Emerald 500
    const corLinha = [229, 231, 235]; // Gray 200

    // --- CABEÇALHO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text('LOGITRACK', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
    doc.text('Relatório de Desempenho Financeiro Mensal', 20, 31);

    // Linha divisória superior
    doc.setDrawColor(corLinha[0], corLinha[1], corLinha[2]);
    doc.line(20, 37, 190, 37);

    // --- METADADOS ---
    doc.setFont('helvetica', 'bold');
    doc.text('Período de Referência:', 20, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(`${mesExtenso} / ${ano}`, 63, 46);

    doc.setFont('helvetica', 'bold');
    doc.text('Data de Emissão:', 130, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('pt-BR'), 162, 46);

    // --- BLOCO DE MÉTRICAS (TABELA) ---
    doc.setFillColor(249, 250, 251);
    doc.rect(20, 56, 170, 10, 'F');
    doc.setDrawColor(corLinha[0], corLinha[1], corLinha[2]);
    doc.rect(20, 56, 170, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text('Indicador Financeiro / Operacional', 25, 62.5);
    doc.text('Valor Consolidado', 140, 62.5);

    const formatarMoeda = (valor: number) =>
      `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const dadosTabela = [
      { label: 'Faturamento Bruto', valor: formatarMoeda(this.faturamentoBruto()), isLucro: false },
      {
        label: 'Gasto com Combustível',
        valor: formatarMoeda(this.gastoCombustivel()),
        isLucro: false,
      },
      { label: 'Lucro Líquido Real', valor: formatarMoeda(this.lucroLiquido()), isLucro: true },
      { label: 'Quilometragem Total Rodada', valor: `${this.kmTotalRodado()} km`, isLucro: false },
    ];

    let yAtual = 66;
    dadosTabela.forEach((item) => {
      doc.rect(20, yAtual, 170, 12, 'S');
      doc.setFont('helvetica', item.isLucro ? 'bold' : 'normal');
      doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
      doc.text(item.label, 25, yAtual + 7.5);

      if (item.isLucro) {
        doc.setTextColor(corSucesso[0], corSucesso[1], corSucesso[2]);
      }
      doc.text(item.valor, 140, yAtual + 7.5);
      yAtual += 12;
    });

    // --- RODAPÉ ---
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'Este documento foi gerado automaticamente pelo LogiTrack de forma criptografada.',
      20,
      275,
    );
    doc.text('Origem dos dados: Servidor Relacional Oracle DB (VPS).', 20, 279);

    doc.save(`Relatorio_Financeiro_${mesExtenso}_${ano}.pdf`);
  }

  exportarCSV(): void {
    const nomesMeses: { [key: string]: string } = {
      '1': 'Janeiro',
      '2': 'Fevereiro',
      '3': 'Março',
      '4': 'Abril',
      '5': 'Maio',
      '6': 'Junho',
      '7': 'Julho',
      '8': 'Agosto',
      '9': 'Setembro',
      '10': 'Outubro',
      '11': 'Novembro',
      '12': 'Dezembro',
    };

    const mesExtenso = nomesMeses[this.mesSelecionado()] || this.mesSelecionado();
    const ano = this.anoSelecionado();

    // 1. Definição do cabeçalho e das linhas do arquivo CSV
    // Usamos o ponto e vírgula (;) como separador para o Excel em português reconhecer as colunas automaticamente
    const linhas = [
      ['Indicador Financeiro / Operacional', 'Valor Consolidado'],
      ['Periodo de Referencia', `${mesExtenso} / ${ano}`],
      ['Data de Emissao', new Date().toLocaleDateString('pt-BR')],
      [''], // Linha em branco para separar o cabeçalho dos dados
      ['Faturamento Bruto', this.faturamentoBruto().toFixed(2).replace('.', ',')],
      ['Gasto com Combustivel', this.gastoCombustivel().toFixed(2).replace('.', ',')],
      ['Lucro Liquido Real', this.lucroLiquido().toFixed(2).replace('.', ',')],
      ['Quilometragem Total Rodada (km)', this.kmTotalRodado()],
    ];

    // 2. Converte a matriz de strings em texto formatado CSV
    const conteudoCsv = linhas.map((e) => e.join(';')).join('\n');

    // 3. Adiciona o BOM (Byte Order Mark) para forçar o Excel a ler os acentos em UTF-8 corretamente
    const blob = new Blob(['\ufeff' + conteudoCsv], { type: 'text/csv;charset=utf-8;' });

    // 4. Cria o link invisível de download e dispara no navegador
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `Relatorio_Financeiro_${mesExtenso}_${ano}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
