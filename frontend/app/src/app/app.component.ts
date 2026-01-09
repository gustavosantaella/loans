import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      <!-- Premium Navbar -->
      <nav class="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <!-- Logo Section -->
          <div class="flex items-center space-x-4 group cursor-pointer" routerLink="/">
            <div class="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-extrabold tracking-tight text-slate-800 leading-none">Prestamos<span class="text-blue-600">Elite</span></h1>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Financial Suite v1.0</p>
            </div>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <a routerLink="/dashboard" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Dashboard
            </a>
            <a routerLink="/loans" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Panel de Préstamos
            </a>
            <a routerLink="/clients" 
               routerLinkActive="bg-white text-blue-600 shadow-sm border-slate-200" 
               class="px-8 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all duration-200 border border-transparent">
              Gestión de Clientes
            </a>
          </div>

          <!-- Profile Section -->
          <div class="flex items-center space-x-4">
            <div class="text-right hidden sm:block">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Administrator</p>
              <p class="text-xs font-bold text-slate-700">Sistema Activo</p>
            </div>
            <div class="relative group">
              <div class="w-11 h-11 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-2xl p-0.5 shadow-inner group-hover:shadow-blue-500/20 group-hover:shadow-lg transition-all duration-300">
                <img src="https://ui-avatars.com/api/?name=Admin&background=random&color=fff&bold=true" class="w-full h-full rounded-[14px] object-cover border-2 border-white shadow-sm" alt="Admin">
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Minimal Footer -->
      <footer class="bg-white border-t border-slate-100 py-8 mt-auto">
        <div class="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center space-x-2 text-slate-400">
            <span class="w-8 h-px bg-slate-200"></span>
            <p class="text-xs font-medium tracking-wide italic">© 2025 PrestamosElite • Impulsando tu crecimiento</p>
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
  title = 'PrestamosElite';
}
