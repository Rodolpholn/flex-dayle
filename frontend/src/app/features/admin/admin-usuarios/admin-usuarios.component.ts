import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Usuários</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ usuarios().length }} usuários cadastrados</p>
        </div>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch($event)"
            placeholder="Buscar por nome ou email..."
            class="input-field pl-9 w-full sm:w-72">
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-16">
            <svg class="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="table-header">Usuário</th>
                  <th class="table-header">Telefone</th>
                  <th class="table-header">Cadastro</th>
                  <th class="table-header">Status</th>
                  <th class="table-header text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (user of usuarios(); track user.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="table-cell">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-sm font-semibold text-primary-700 dark:text-primary-400">
                            {{ user.nome.charAt(0) }}{{ user.sobrenome.charAt(0) }}
                          </span>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ user.nome }} {{ user.sobrenome }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="table-cell text-gray-500 dark:text-gray-400">{{ user.telefone || '-' }}</td>
                    <td class="table-cell text-gray-500 dark:text-gray-400">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td class="table-cell">
                      @if (user.ativo) {
                        <span class="badge-success">Ativo</span>
                      } @else {
                        <span class="badge-danger">Bloqueado</span>
                      }
                    </td>
                    <td class="table-cell text-right">
                      <div class="flex items-center justify-end gap-2">
                        <!-- Block/Unblock -->
                        <button
                          (click)="toggleBlock(user)"
                          [title]="user.ativo ? 'Bloquear' : 'Desbloquear'"
                          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          [class.text-yellow-600]="user.ativo"
                          [class.text-green-600]="!user.ativo">
                          @if (user.ativo) {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          }
                        </button>
                        <!-- Reset Password -->
                        <button
                          (click)="resetSenha(user)"
                          title="Resetar senha"
                          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                          </svg>
                        </button>
                        <!-- Delete -->
                        <button
                          (click)="deleteUser(user)"
                          title="Excluir usuário"
                          class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="table-cell text-center text-gray-500 dark:text-gray-400 py-12">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminUsuariosComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  searchTerm = '';
  private searchTimeout: any;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(search?: string): void {
    this.loading.set(true);
    this.adminService.getUsuarios(search).subscribe({
      next: (users) => { this.usuarios.set(users); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadUsuarios(term), 400);
  }

  toggleBlock(user: Usuario): void {
    const obs = user.ativo
      ? this.adminService.blockUsuario(user.id)
      : this.adminService.unblockUsuario(user.id);

    obs.subscribe(() => this.loadUsuarios(this.searchTerm));
  }

  resetSenha(user: Usuario): void {
    if (confirm(`Enviar link de reset de senha para ${user.email}?`)) {
      this.adminService.resetSenha(user.id).subscribe({
        next: () => alert('Link de reset enviado com sucesso!'),
        error: () => alert('Erro ao enviar link de reset.')
      });
    }
  }

  deleteUser(user: Usuario): void {
    if (confirm(`Tem certeza que deseja excluir ${user.nome} ${user.sobrenome}? Esta ação é irreversível.`)) {
      this.adminService.deleteUsuario(user.id).subscribe(() => this.loadUsuarios(this.searchTerm));
    }
  }
}
