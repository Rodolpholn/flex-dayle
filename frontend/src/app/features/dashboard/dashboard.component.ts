import {
  Component,
  OnInit,
  signal,
  effect,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { RotaService, GraficoMensal } from '../../core/services/rota.service';
import { DashboardData } from '../../core/models/rota.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  dashboard = signal<DashboardData | null>(null);
  loading = signal(true);
  selectedMes = signal(new Date().getMonth() + 1);
  selectedAno = signal(new Date().getFullYear());

  dadosGrafico = signal<GraficoMensal[]>([]);
  loadingGrafico = signal(true);

  meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  constructor(
    private rotaService: RotaService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // Effect para atualizar o gráfico quando os dados mudarem
    effect(() => {
      const dados = this.dadosGrafico();
      if (dados.length > 0 && isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.renderChart(dados), 0);
      }
    });

    // Effect para buscar dados novos quando o ano mudar
    effect(() => {
      this.loadGrafico();
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.rotaService.getDashboard(this.selectedMes(), this.selectedAno()).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadGrafico(): void {
    this.loadingGrafico.set(true);
    this.rotaService.getGraficoAnual(this.selectedAno()).subscribe({
      next: (dados) => {
        this.dadosGrafico.set(dados);
        this.loadingGrafico.set(false);
      },
      error: () => this.loadingGrafico.set(false),
    });
  }

  renderChart(dados: GraficoMensal[]): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // Criando o Gradiente para as Barras
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 1)'); // Azul Topo
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)'); // Transparente Base

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dados.map((d) => d.mes),
        datasets: [
          {
            // Camada de Linha de Tendência (Moderna)
            type: 'line',
            label: 'Tendência',
            data: dados.map((d) => d.ganho),
            borderColor: '#10b981', // Verde
            borderWidth: 3,
            tension: 0.4, // Suaviza a curva
            pointRadius: 0,
            pointHoverRadius: 6,
            fill: false,
            order: 1,
          },
          {
            // Camada de Barras (Gradiente)
            label: 'Receita Real',
            data: dados.map((d) => d.ganho),
            backgroundColor: gradient,
            borderRadius: 12,
            borderSkipped: false,
            barPercentage: 0.5, // Deixa as barras mais finas e elegantes
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#94a3b8',
              usePointStyle: true,
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: {
              color: '#64748b',
              callback: (value) => 'R$ ' + value,
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' },
          },
        },
      },
    });
  }

  changeMes(mes: number): void {
    this.selectedMes.set(mes);
    this.loadDashboard();
  }

  changeAno(ano: number): void {
    this.selectedAno.set(ano);
    this.loadDashboard();
  }

  get mesNome(): string {
    return this.meses[this.selectedMes() - 1];
  }

  get anos(): number[] {
    const current = new Date().getFullYear();
    return [current - 2, current - 1, current];
  }
}
