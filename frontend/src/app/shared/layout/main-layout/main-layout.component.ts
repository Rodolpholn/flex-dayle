import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  get user() {
    return this.authService.currentUser();
  }

  get userInitials(): string {
    const u = this.user;
    if (!u) return '?';
    return `${u.nome.charAt(0)}${u.sobrenome.charAt(0)}`.toUpperCase();
  }
}
