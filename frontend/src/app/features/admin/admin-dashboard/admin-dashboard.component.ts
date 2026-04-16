import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboard } from '../../../core/models/rota.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Global</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Visão consolidada de todos os usuários</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card animate-pulse">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (data()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="metric-card">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Usuários</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ data()!.totalUsuarios }}</p>
            <p class="text-xs text-gray-400 mt-1">Cadastrados na plataforma</p>
          </div>
          <div class="metric-card">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Volume Total de Ganhos</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{{ data()!.volumeGanhosTotal | currency:'BRL':'symbol':'1.2-2' }}</p>
            <p class="text-xs text-gray-400 mt-1">Soma de todos os motoristas</p>
          </div>
          <div class="metric-card">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">KM Total no Sistema</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{{ data()!.kmTotalSistema | number:'1.0-0' }} km</p>
            <p class="text-xs text-gray-400 mt-1">Quilometragem registrada</p>
          </div>
          <div class="metric-card">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Médio por KM</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">R$ {{ data()!.ticketMedioPorKm | number:'1.2-2' }}/km</p>
            <p class="text-xs text-gray-400 mt-1">Média da base de usuários</p>
          </div>
        </div>

        <!-- Cadastros por Mês -->
        @if (data()!.cadastrosPorMes?.length) {
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Novos Cadastros por Mês</h2>
            <div class="space-y-2">
              @for (item of data()!.cadastrosPorMes; track item.mes) {
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600 dark:text-gray-400 w-24">{{ item.mes }}</span>
                  <div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-primary-600 h-2 rounded-full" [style.width.%]="(item.total / maxCadastros) * 100"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{{ item.total }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  data = signal<AdminDashboard | null>(null);
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  get maxCadastros(): number {
    const items = this.data()?.cadastrosPorMes || [];
    return Math.max(...items.map(i => i.total), 1);
  }
}
