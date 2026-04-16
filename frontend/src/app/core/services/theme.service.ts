import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'logitrack_theme';
  isDark = signal<boolean>(this.getStoredTheme());

  constructor() {
    this.applyTheme(this.isDark());
  }

  toggleTheme(): void {
    const newValue = !this.isDark();
    this.isDark.set(newValue);
    localStorage.setItem(this.THEME_KEY, newValue ? 'dark' : 'light');
    this.applyTheme(newValue);
  }

  private applyTheme(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
