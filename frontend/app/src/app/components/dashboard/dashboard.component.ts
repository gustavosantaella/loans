import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Client, Loan } from '../../models/interfaces';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <!-- Welcome Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-4xl font-black text-slate-800 tracking-tight">Panel de Visión General</h2>
          <p class="text-slate-500 mt-2 font-medium italic">Resumen consolidado del sistema de préstamos Elite.</p>
        </div>
        <div class="hidden md:flex items-center gap-4">
          <button (click)="downloadGeneralReport()" title="Descargar Reporte General" 
                  class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
          </button>
          <div class="text-right">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fecha Actual</p>
            <p class="text-sm font-bold text-slate-700 leading-none">{{ today }}</p>
          </div>
          <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
        <!-- Clients Counter -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div *ngIf="clients && clients.length > 0" class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">En Línea</div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Clientes Totales</p>
            <h3 class="text-4xl font-black text-slate-800 mt-2 leading-none antialiased tracking-tighter">{{ clients ? clients.length : 0 }}</h3>
          </div>
        </div>

        <!-- Loans Counter -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Préstamos Totales</p>
            <h3 class="text-4xl font-black text-slate-800 mt-2 leading-none tracking-tighter">{{ totalLoansCount }}</h3>
          </div>
        </div>

        <!-- Suspended Loans Counter -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Préstamos Suspendidos</p>
            <h3 class="text-4xl font-black text-slate-800 mt-2 leading-none tracking-tighter">{{ suspendedCount }}</h3>
          </div>
        </div>

        <!-- Capital Display -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mi Capital Activo</p>
            <h3 class="text-2xl font-black text-slate-800 mt-2 leading-none tracking-tight">{{ totalCapital | currency:'USD':'symbol':'1.0-0' }}</h3>
          </div>
        </div>

        <!-- Interests Highlight -->
        <div class="bg-blue-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/30 flex flex-col justify-between group transform hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none">Proyección</span>
          </div>
          <div>
            <p class="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">Mis Ganancias</p>
            <h3 class="text-2xl font-black text-white mt-2 leading-none tracking-tight">{{ totalInterests | currency:'USD':'symbol':'1.0-0' }}</h3>
          </div>
        </div>
      </div>

      <!-- Secondary Info Rows -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Recent Clients (Card Style) -->
        <div class="lg:col-span-1 space-y-6">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xl font-black text-slate-800 tracking-tight">Últimos Ingresos</h4>
            <a routerLink="/clients" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest leading-none">Ver Todos</a>
          </div>
          <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
            <div *ngFor="let client of recentClients" class="flex items-center gap-4 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: client.id}">
              <div class="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                {{ client.nombre ? client.nombre[0] : '?' }}{{ client.apellido ? client.apellido[0] : '?' }}
              </div>
              <div class="flex-grow">
                <p class="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{{ client.nombre }} {{ client.apellido }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">{{ client.correo || 'No email set' }}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div *ngIf="!recentClients || recentClients.length === 0" class="py-14 text-center">
               <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                  </svg>
               </div>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin Actividad</p>
            </div>
          </div>
        </div>

        <!-- Global Performance Visualization -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xl font-black text-slate-800 tracking-tight">Rendimiento de Cartera</h4>
          </div>
          <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center">
            <div class="relative w-64 h-64 mb-12 transform hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 rounded-full border-[16px] border-slate-50"></div>
                <div class="absolute inset-0 rounded-full border-[16px] border-blue-600 border-t-transparent border-r-transparent transform"
                     [style.transform]="'rotate(' + (percentPaid * 3.6 - 45) + 'deg)'"
                     style="transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                   <span class="text-6xl font-black text-slate-800 tracking-tighter">{{ percentPaid }}%</span>
                   <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recuperado</span>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-16 w-full max-w-sm px-4">
              <div class="flex flex-col items-center group">
                <div class="flex items-center gap-3 mb-2">
                   <div class="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-200"></div>
                   <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
                </div>
                <span class="text-3xl font-black text-slate-800 group-hover:scale-110 transition-transform">{{ pendingCount }}</span>
              </div>
              <div class="flex flex-col items-center group">
                <div class="flex items-center gap-3 mb-2">
                   <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                   <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Cobrados</p>
                </div>
                <span class="text-3xl font-black text-slate-800 group-hover:scale-110 transition-transform">{{ paidCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  loans: Loan[] = [];
  today: string = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  totalLoansCount: number = 0;
  totalCapital: number = 0;
  totalInterests: number = 0;
  paidCount: number = 0;
  pendingCount: number = 0;
  suspendedCount: number = 0;
  percentPaid: number = 0;
  recentClients: Client[] = [];

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('Dashboard: Component Init');
    await this.refreshData();
  }

  async refreshData() {
    try {
      console.log('Dashboard: Starting data refresh cycle...');
      this.clients = await this.dataService.getClients() || [];
      this.recentClients = (this.clients || []).slice(-5).reverse();
      
      let allLoans: Loan[] = [];
      const loanPromises = (this.clients || []).map(async (client) => {
        if (client.id) {
          return await this.dataService.getLoans(client.id);
        }
        return [];
      });
      
      const results = await Promise.all(loanPromises);
      results.forEach(clientLoans => {
        allLoans = [...allLoans, ...clientLoans];
      });

      this.loans = allLoans;
      this.calculateStats();
      console.log('Dashboard: Data cycle complete');
    } catch (error) {
      console.error('Dashboard: Data cycle failed', error);
    } finally {
      this.cdr.detectChanges();
    }
  }

  calculateStats() {
    if (!this.loans) return;
    
    // Total Loans: All of them
    this.totalLoansCount = this.loans.filter(l => l.active !== 0).length;
    
    // Total Capital (MY SHARE): Only count original loans (no parentId)
    // Reduce: (Loan Amount - Partner Capital)
    this.totalCapital = this.loans
      .filter(l => !l.parentId && l.active !== 0)
      .reduce((acc, l) => {
        const partnerCap = l.partnerCapital || 0;
        const myCap = (l.monto || 0) - partnerCap;
        return acc + myCap;
      }, 0);
    
    // Total Interests (MY SHARE):
    // Interest = Total - Monto
    // PartnerProfit = Monto * (Partner% / 100)
    // MyProfit = Interest - PartnerProfit
    this.totalInterests = this.loans.filter(l => l.active !== 0).reduce((acc, l) => {
      const interest = (l.total || 0) - (l.monto || 0);
      const partnerProfit = (l.monto || 0) * ((l.partnerPercentage || 0) / 100);
      const myProfit = interest - partnerProfit;
      return acc + myProfit;
    }, 0);
    
    this.paidCount = this.loans.filter(l => l.status === 'pagado' && l.active !== 0).length;
    this.pendingCount = this.loans.filter(l => l.status === 'pendiente' && l.active !== 0).length;
    this.suspendedCount = this.loans.filter(l => l.active === 0).length;
    
    if (this.totalLoansCount > 0) {
      this.percentPaid = Math.round((this.paidCount / this.totalLoansCount) * 100);
    } else {
      this.percentPaid = 0;
    }
  }

  async downloadGeneralReport() {
    try {
      const blob = await this.dataService.downloadGeneralReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_general_prestamos_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading general report', e);
      alert('Error al descargar el reporte general');
    }
  }
}
