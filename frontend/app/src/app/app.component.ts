import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      <!-- Premium Navbar (hidden on login) -->
      <nav *ngIf="authService.isLoggedIn()" class="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <!-- Logo Section -->
          <div class="flex items-center space-x-3 sm:space-x-4 group cursor-pointer" routerLink="/">
            <div class="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 leading-none">Préstamos <span class="text-blue-600">Personales</span></h1>
              <p class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Financial Suite v1.0</p>
            </div>
          </div>
          
          <!-- Desktop Navigation Links -->
          <div class="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <a routerLink="/dashboard" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Dashboard
            </a>
            <a routerLink="/loans" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Préstamos
            </a>
            <a routerLink="/clients" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Clientes
            </a>
            <a routerLink="/partners" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Socios
            </a>
            <a routerLink="/projection" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Simulador
            </a>
          </div>

          <!-- Right Section -->
          <div class="flex items-center space-x-3">
            <!-- Desktop Profile -->
            <div class="hidden sm:flex items-center space-x-3">
              <div class="text-right">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Administrator</p>
                <p class="text-xs font-bold text-slate-700">Sistema Activo</p>
              </div>
              <div class="relative group">
                <div class="w-11 h-11 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-2xl p-0.5 shadow-inner group-hover:shadow-blue-500/20 group-hover:shadow-lg transition-all duration-300">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=random&color=fff&bold=true" class="w-full h-full rounded-[14px] object-cover border-2 border-white shadow-sm" alt="Admin">
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
              </div>
              <!-- Desktop Logout -->
              <button (click)="logout()" title="Cerrar Sesión"
                      class="w-11 h-11 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all duration-300 border border-slate-200/50 hover:border-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            <!-- Mobile Hamburger Button -->
            <button (click)="toggleDrawer()" class="lg:hidden w-11 h-11 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-all duration-200 border border-slate-200/50">
              <svg *ngIf="!drawerOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="drawerOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Drawer Overlay -->
      <div *ngIf="drawerOpen && authService.isLoggedIn()"
           (click)="closeDrawer()"
           class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300">
      </div>

      <!-- Mobile Drawer -->
      <div *ngIf="authService.isLoggedIn()"
           class="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[70] lg:hidden transform transition-transform duration-300 ease-out"
           [class.translate-x-0]="drawerOpen"
           [class.translate-x-full]="!drawerOpen">
        
        <!-- Drawer Header -->
        <div class="p-6 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-extrabold text-white tracking-tight">Menú</h2>
            <button (click)="closeDrawer()" class="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- User Info -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/20 rounded-2xl p-0.5">
              <img src="https://ui-avatars.com/api/?name=Admin&background=random&color=fff&bold=true" class="w-full h-full rounded-[14px] object-cover" alt="Admin">
            </div>
            <div>
              <p class="text-sm font-bold text-white">Administrador</p>
              <p class="text-xs text-white/60 font-medium">Sistema Activo</p>
            </div>
          </div>
        </div>

        <!-- Drawer Navigation -->
        <div class="p-4 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-blue-50 text-blue-600 border-blue-100"
             (click)="closeDrawer()"
             class="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-200 border border-transparent font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/loans" routerLinkActive="bg-blue-50 text-blue-600 border-blue-100"
             (click)="closeDrawer()"
             class="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-200 border border-transparent font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Panel de Préstamos</span>
          </a>
          <a routerLink="/clients" routerLinkActive="bg-blue-50 text-blue-600 border-blue-100"
             (click)="closeDrawer()"
             class="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-200 border border-transparent font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Gestión de Clientes</span>
          </a>
          <a routerLink="/partners" routerLinkActive="bg-blue-50 text-blue-600 border-blue-100"
             (click)="closeDrawer()"
             class="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-200 border border-transparent font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
            <span>Socios</span>
          </a>
          <a routerLink="/projection" routerLinkActive="bg-blue-50 text-blue-600 border-blue-100"
             (click)="closeDrawer()"
             class="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-200 border border-transparent font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Simulador</span>
          </a>
        </div>

        <!-- Drawer Footer -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button (click)="logout()" 
                  class="w-full flex items-center justify-center space-x-3 px-5 py-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Minimal Footer (hidden on login) -->
      <footer *ngIf="authService.isLoggedIn()" class="bg-white border-t border-slate-100 py-6 sm:py-8 mt-auto">
        <div class="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center space-x-2 text-slate-400">
            <span class="w-8 h-px bg-slate-200"></span>
            <p class="text-xs font-medium tracking-wide italic">© 2026 Préstamos Personales • Impulsando tu crecimiento</p>
          </div>
          <div class="flex items-center space-x-8">
            <a href="#" class="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Soporte técnico</a>
            <a href="#" class="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Documentación</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Préstamos Personales';
  drawerOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  logout() {
    this.closeDrawer();
    this.authService.logout();
  }
}
