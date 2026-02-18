import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Client, Loan, Payment } from '../../models/interfaces';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-700">
      <!-- Welcome Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-4xl font-black text-slate-800 tracking-tight">Panel de Visión General</h2>
          <p class="text-slate-500 mt-2 font-medium italic">Resumen consolidado del sistema de préstamos Elite.</p>
        </div>
        <div class="hidden md:flex items-center gap-4">
          <input type="file" #dbFileInput accept=".db" (change)="onFileSelected($event)" style="display:none">
          <button (click)="dbFileInput.click()" [disabled]="importing" title="Importar Base de Datos SQLite"
                  class="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
             <svg *ngIf="!importing" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
             </svg>
             <svg *ngIf="importing" class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
             </svg>
          </button>
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

      <!-- Row 1: Primary Financial KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <!-- Capital en la Calle -->
        <div class="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Capital en la Calle</p>
            <h3 class="text-xl sm:text-2xl font-black text-slate-800 mt-2 leading-none tracking-tight">{{ capitalEnLaCalle | currency:'USD':'symbol':'1.0-0' }}</h3>
            <p class="text-[10px] text-slate-400 mt-1">Saldo pendiente total</p>
          </div>
        </div>

        <!-- Total Cobrado -->
        <div class="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Cobrado</p>
            <h3 class="text-xl sm:text-2xl font-black text-emerald-600 mt-2 leading-none tracking-tight">{{ totalCollected | currency:'USD':'symbol':'1.0-0' }}</h3>
            <p class="text-[10px] text-slate-400 mt-1">Pagos recibidos</p>
          </div>
        </div>

        <!-- Mi Capital Invertido -->
        <div class="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mi Capital Invertido</p>
            <h3 class="text-xl sm:text-2xl font-black text-slate-800 mt-2 leading-none tracking-tight">{{ totalCapital | currency:'USD':'symbol':'1.0-0' }}</h3>
            <p class="text-[10px] text-slate-400 mt-1">{{ totalLoansCount }} préstamos activos</p>
          </div>
        </div>

        <!-- Ganancias Proyectadas -->
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-blue-500/30 flex flex-col justify-between group transform hover:-translate-y-1 transition-all duration-300">
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
            <h3 class="text-xl sm:text-2xl font-black text-white mt-2 leading-none tracking-tight">{{ totalInterests | currency:'USD':'symbol':'1.0-0' }}</h3>
            <p class="text-[10px] text-white/50 mt-1">{{ avgInterestRate | number:'1.1-1' }}% tasa promedio</p>
          </div>
        </div>
      </div>

      <!-- Row 2: Status Counters -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-800 leading-none">{{ clients ? clients.length : 0 }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clientes</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-800 leading-none">{{ pendingCount }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendientes</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4"
             [ngClass]="overdueCount > 0 ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               [ngClass]="overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-black leading-none" [ngClass]="overdueCount > 0 ? 'text-rose-600' : 'text-slate-800'">{{ overdueCount }}</p>
            <p class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="overdueCount > 0 ? 'text-rose-500' : 'text-slate-400'">Vencidos</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-800 leading-none">{{ paidCount }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cobrados</p>
          </div>
        </div>
      </div>

      <!-- Row 3: Three Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        
        <!-- Recent Clients -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-black text-slate-800 tracking-tight">Últimos Ingresos</h4>
            <a routerLink="/clients" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest leading-none">Ver Todos</a>
          </div>
          <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
            <div *ngFor="let client of recentClients" class="flex items-center gap-3 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: client.id}">
              <div class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                {{ client.nombre ? client.nombre[0] : '?' }}{{ client.apellido ? client.apellido[0] : '?' }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate">{{ client.nombre }} {{ client.apellido }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">{{ client.telefono || 'Sin teléfono' }}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div *ngIf="!recentClients || recentClients.length === 0" class="py-10 text-center">
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin Actividad</p>
            </div>
          </div>
        </div>

        <!-- Recent Payments -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-black text-slate-800 tracking-tight">Últimos Pagos</h4>
            <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{{ recentPayments.length }} recientes</span>
          </div>
          <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
            <div *ngFor="let rp of recentPayments" class="flex items-center gap-3 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: rp.clientId}">
              <div class="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-black text-slate-800 truncate">{{ rp.clientName }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ rp.fecha }}</p>
              </div>
              <span class="text-sm font-black text-emerald-600 shrink-0">{{ rp.monto | currency }}</span>
            </div>
            <div *ngIf="recentPayments.length === 0" class="py-10 text-center">
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin Pagos Registrados</p>
            </div>
          </div>
        </div>

        <!-- Top Debtors -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-black text-slate-800 tracking-tight">Saldos Más Altos</h4>
            <a routerLink="/loans" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest leading-none">Ver Préstamos</a>
          </div>
          <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
            <div *ngFor="let td of topDebtors; let i = index" class="flex items-center gap-3 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: td.clientId}">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                   [ngClass]="i === 0 ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-slate-50 text-slate-400 border border-slate-100'">
                #{{ i + 1 }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-black text-slate-800 truncate">{{ td.clientName }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ td.loanCount }} préstamo{{ td.loanCount > 1 ? 's' : '' }}</p>
              </div>
              <span class="text-sm font-black text-rose-600 shrink-0">{{ td.totalOwed | currency }}</span>
            </div>
            <div *ngIf="topDebtors.length === 0" class="py-10 text-center">
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin Datos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 4: Portfolio Performance -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sm:p-10">
        <h4 class="text-lg font-black text-slate-800 tracking-tight mb-8">Rendimiento de Cartera</h4>
        <div class="flex flex-col md:flex-row items-center gap-10">
          <!-- Donut Chart -->
          <div class="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 transform hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 rounded-full border-[14px] border-slate-50"></div>
              <div class="absolute inset-0 rounded-full border-[14px] border-blue-600 border-t-transparent border-r-transparent transform"
                   [style.transform]="'rotate(' + (percentPaid * 3.6 - 45) + 'deg)'"
                   style="transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                 <span class="text-5xl font-black text-slate-800 tracking-tighter">{{ percentPaid }}%</span>
                 <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recuperado</span>
              </div>
          </div>
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-grow w-full">
            <div class="text-center p-4 bg-slate-50 rounded-2xl">
              <div class="flex items-center justify-center gap-2 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
              </div>
              <span class="text-2xl font-black text-slate-800">{{ pendingCount }}</span>
            </div>
            <div class="text-center p-4 bg-slate-50 rounded-2xl">
              <div class="flex items-center justify-center gap-2 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cobrados</p>
              </div>
              <span class="text-2xl font-black text-slate-800">{{ paidCount }}</span>
            </div>
            <div class="text-center p-4 bg-slate-50 rounded-2xl">
              <div class="flex items-center justify-center gap-2 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suspendidos</p>
              </div>
              <span class="text-2xl font-black text-slate-800">{{ suspendedCount }}</span>
            </div>
            <div class="text-center p-4 bg-emerald-50 rounded-2xl">
              <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Capital Prestado</p>
              <span class="text-lg font-black text-emerald-700">{{ totalLentAmount | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-2xl">
              <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Capital Recuperado</p>
              <span class="text-lg font-black text-blue-700">{{ totalCollected | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="text-center p-4 bg-rose-50 rounded-2xl">
              <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Por Cobrar</p>
              <span class="text-lg font-black text-rose-700">{{ capitalEnLaCalle | currency:'USD':'symbol':'1.0-0' }}</span>
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
  importing: boolean = false;

  // New metrics
  capitalEnLaCalle: number = 0;
  totalCollected: number = 0;
  totalLentAmount: number = 0;
  overdueCount: number = 0;
  avgInterestRate: number = 0;
  recentPayments: { clientName: string; clientId: number; monto: number; fecha: string }[] = [];
  topDebtors: { clientName: string; clientId: number; totalOwed: number; loanCount: number }[] = [];

  // Payment cache
  allPayments: { payment: Payment; clientId: number; clientName: string }[] = [];

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
      this.clients = await this.dataService.getClients() || [];
      this.recentClients = (this.clients || []).slice(-5).reverse();
      
      let allLoans: Loan[] = [];
      const clientLoanMap: { clientId: number; clientName: string; loans: Loan[] }[] = [];

      for (const client of this.clients) {
        if (client.id) {
          const clientLoans = await this.dataService.getLoans(client.id);
          allLoans = [...allLoans, ...clientLoans];
          clientLoanMap.push({
            clientId: client.id,
            clientName: `${client.nombre} ${client.apellido}`,
            loans: clientLoans
          });
        }
      }

      this.loans = allLoans;

      // Fetch all payments
      this.allPayments = [];
      for (const entry of clientLoanMap) {
        for (const loan of entry.loans) {
          if (loan.id) {
            const payments = await this.dataService.getPayments(loan.id);
            for (const p of payments) {
              this.allPayments.push({
                payment: p,
                clientId: entry.clientId,
                clientName: entry.clientName
              });
            }
          }
        }
      }

      this.calculateStats(clientLoanMap);
    } catch (error) {
      console.error('Dashboard: Data cycle failed', error);
    } finally {
      this.cdr.detectChanges();
    }
  }

  calculateStats(clientLoanMap: { clientId: number; clientName: string; loans: Loan[] }[]) {
    if (!this.loans) return;
    
    const activeLoans = this.loans.filter(l => l.active !== 0);
    const pendingLoans = activeLoans.filter(l => l.status === 'pendiente');

    this.totalLoansCount = activeLoans.length;
    
    // My Capital (original loans only, minus partner capital)
    this.totalCapital = this.loans
      .filter(l => !l.parentId && l.active !== 0)
      .reduce((acc, l) => {
        const partnerCap = l.partnerCapital || 0;
        return acc + ((l.monto || 0) - partnerCap);
      }, 0);
    
    // My Interests
    this.totalInterests = activeLoans.reduce((acc, l) => {
      const interest = (l.total || 0) - (l.monto || 0);
      const partnerProfit = (l.monto || 0) * ((l.partnerPercentage || 0) / 100);
      return acc + (interest - partnerProfit);
    }, 0);
    
    this.paidCount = activeLoans.filter(l => l.status === 'pagado').length;
    this.pendingCount = pendingLoans.length;
    this.suspendedCount = this.loans.filter(l => l.active === 0).length;
    
    if (this.totalLoansCount > 0) {
      this.percentPaid = Math.round((this.paidCount / this.totalLoansCount) * 100);
    } else {
      this.percentPaid = 0;
    }

    // === NEW METRICS ===
    
    // Total amount lent (all active loans original amounts)
    this.totalLentAmount = activeLoans.reduce((acc, l) => acc + (l.monto || 0), 0);

    // Total collected (sum of all payments)
    this.totalCollected = this.allPayments.reduce((acc, ap) => acc + ap.payment.monto, 0);

    // Capital en la calle: remaining balance on pending loans
    // Use last payment's saldoNuevo, or original monto if no payments
    this.capitalEnLaCalle = 0;
    for (const loan of pendingLoans) {
      const loanPayments = this.allPayments
        .filter(ap => ap.payment.loan_id === loan.id)
        .sort((a, b) => (a.payment.id || 0) - (b.payment.id || 0));
      if (loanPayments.length > 0) {
        const last = loanPayments[loanPayments.length - 1];
        this.capitalEnLaCalle += (last.payment.saldoNuevo ?? loan.monto);
      } else {
        this.capitalEnLaCalle += loan.monto;
      }
    }

    // Average interest rate
    if (pendingLoans.length > 0) {
      this.avgInterestRate = pendingLoans.reduce((acc, l) => acc + l.porcentaje, 0) / pendingLoans.length;
    } else {
      this.avgInterestRate = 0;
    }

    // Overdue count
    const today = new Date(); today.setHours(0, 0, 0, 0);
    this.overdueCount = pendingLoans.filter(l => {
      if (!l.fechaFin) return false;
      const parts = l.fechaFin.split('-');
      if (parts.length !== 3) return false;
      const dueDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      return dueDate < today;
    }).length;

    // Recent payments (last 5)
    this.recentPayments = this.allPayments
      .sort((a, b) => (b.payment.id || 0) - (a.payment.id || 0))
      .slice(0, 5)
      .map(ap => ({
        clientName: ap.clientName,
        clientId: ap.clientId,
        monto: ap.payment.monto,
        fecha: ap.payment.fecha
      }));

    // Top debtors (clients with highest outstanding balance)
    const debtorMap = new Map<number, { clientName: string; clientId: number; totalOwed: number; loanCount: number }>();
    for (const entry of clientLoanMap) {
      const clientPendingLoans = entry.loans.filter(l => l.status === 'pendiente' && l.active !== 0);
      if (clientPendingLoans.length === 0) continue;
      let clientOwed = 0;
      for (const loan of clientPendingLoans) {
        const loanPayments = this.allPayments
          .filter(ap => ap.payment.loan_id === loan.id)
          .sort((a, b) => (a.payment.id || 0) - (b.payment.id || 0));
        if (loanPayments.length > 0) {
          const last = loanPayments[loanPayments.length - 1];
          clientOwed += (last.payment.saldoNuevo ?? loan.monto);
        } else {
          clientOwed += loan.monto;
        }
      }
      debtorMap.set(entry.clientId, {
        clientName: entry.clientName,
        clientId: entry.clientId,
        totalOwed: clientOwed,
        loanCount: clientPendingLoans.length
      });
    }
    this.topDebtors = Array.from(debtorMap.values())
      .sort((a, b) => b.totalOwed - a.totalOwed)
      .slice(0, 5);
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

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
      alert('Por favor selecciona un archivo .db válido');
      return;
    }

    const confirmImport = confirm(
      `¿Estás seguro de importar "${file.name}"?\n\nEsto reemplazará TODOS los datos actuales en la base de datos.`
    );
    if (!confirmImport) {
      event.target.value = '';
      return;
    }

    this.importing = true;
    try {
      const result = await this.dataService.importDatabase(file);
      const counts = result.imported;
      alert(
        `✅ Importación exitosa:\n\n` +
        `• Clientes: ${counts.clients}\n` +
        `• Socios: ${counts.partners}\n` +
        `• Préstamos: ${counts.loans}\n` +
        `• Pagos: ${counts.payments}`
      );
      await this.refreshData();
    } catch (e) {
      console.error('Error importing database', e);
      alert('❌ Error al importar la base de datos. Revisa la consola para más detalles.');
    } finally {
      this.importing = false;
      event.target.value = '';
    }
  }
}
