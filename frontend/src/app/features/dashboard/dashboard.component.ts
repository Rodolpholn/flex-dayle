import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RotaService } from '../../core/services/rota.service';
import { DashboardData } from '../../core/models/rota.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  dashboard = signal<DashboardData | null>(null);
  loading = signal(true);
  selectedMes = signal(new Date().getMonth() + 1);
  selectedAno = signal(new Date().getFullYear());

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(private rotaService: RotaService) {}

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
      error: () => this.loading.set(false)
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
    return [current - 1, current, current + 1];
  }
}
