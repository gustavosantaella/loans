import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <!-- Login Card -->
      <div class="relative z-10 w-full max-w-md mx-4">
        <!-- Logo Section -->
        <div class="text-center mb-10">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-black text-white tracking-tight">Prestamos<span class="text-blue-400">Elite</span></h1>
          <p class="text-sm text-slate-400 mt-2 font-medium">Accede al panel de administración</p>
        </div>

        <!-- Card -->
        <div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-2xl">
          <form (ngSubmit)="onLogin()" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-widest block">Correo Electrónico</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  autocomplete="email"
                  placeholder="admin@ejemplo.com"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-widest block">Contraseña</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••••"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                />
                <button type="button" (click)="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe"
                         class="sr-only peer" />
                  <div class="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-blue-500 transition-all duration-300 border border-white/10 peer-checked:border-blue-400"></div>
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-slate-400 rounded-full peer-checked:translate-x-4 peer-checked:bg-white transition-all duration-300 shadow-sm"></div>
                </div>
                <span class="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors select-none">Recordar sesión</span>
              </label>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-300 font-medium">{{ errorMessage }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
            >
              <svg *ngIf="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span *ngIf="!loading">Iniciar Sesión</span>
              <span *ngIf="loading">Verificando...</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-500 mt-8 font-medium">
          © 2026 PrestamosElite • Panel de Administración
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password, this.rememberMe);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      console.error('Login error', e);
      if (e.status === 401) {
        this.errorMessage = 'Correo o contraseña incorrectos';
      } else {
        this.errorMessage = 'Error de conexión. Intenta de nuevo.';
      }
    } finally {
      this.loading = false;
    }
  }
}
