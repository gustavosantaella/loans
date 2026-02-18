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
    <div class="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
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
        </div>
      </div>

      <!-- Row 1: Primary Financial KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital en la Calle</p>
          <h3 class="text-xl font-black text-slate-800 mt-1 tracking-tight">{{ capitalEnLaCalle | currency:'USD':'symbol':'1.0-0' }}</h3>
          <p class="text-[10px] text-slate-400 mt-0.5">Saldo pendiente de cobro</p>
        </div>

        <div class="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cobrado</p>
          <h3 class="text-xl font-black text-emerald-600 mt-1 tracking-tight">{{ totalCollected | currency:'USD':'symbol':'1.0-0' }}</h3>
          <p class="text-[10px] text-slate-400 mt-0.5">{{ totalPaymentsCount }} pagos recibidos</p>
        </div>

        <div class="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mi Capital Invertido</p>
          <h3 class="text-xl font-black text-slate-800 mt-1 tracking-tight">{{ totalCapital | currency:'USD':'symbol':'1.0-0' }}</h3>
          <p class="text-[10px] text-slate-400 mt-0.5">{{ totalLoansCount }} préstamos activos</p>
        </div>

        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[1.5rem] shadow-2xl shadow-blue-500/30 group transform hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <p class="text-[10px] font-black text-white/60 uppercase tracking-widest">Mis Ganancias</p>
          <h3 class="text-xl font-black text-white mt-1 tracking-tight">{{ totalInterests | currency:'USD':'symbol':'1.0-0' }}</h3>
          <p class="text-[10px] text-white/50 mt-0.5">Proyección total</p>
        </div>
      </div>

      <!-- Row 2: Status Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div class="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <p class="text-xl font-black text-slate-800 leading-none">{{ clients ? clients.length : 0 }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clientes</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div class="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-xl font-black text-slate-800 leading-none">{{ pendingCount }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pendientes</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3" [ngClass]="overdueCount > 0 ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" [ngClass]="overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <div>
            <p class="text-xl font-black leading-none" [ngClass]="overdueCount > 0 ? 'text-rose-600' : 'text-slate-800'">{{ overdueCount }}</p>
            <p class="text-[9px] font-bold uppercase tracking-widest" [ngClass]="overdueCount > 0 ? 'text-rose-500' : 'text-slate-400'">Vencidos</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div class="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <p class="text-xl font-black text-slate-800 leading-none">{{ paidCount }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cobrados</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div class="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <div>
            <p class="text-xl font-black text-slate-800 leading-none">{{ suspendedCount }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suspendidos</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3" [ngClass]="dueSoonCount > 0 ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100'">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" [ngClass]="dueSoonCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <div>
            <p class="text-xl font-black leading-none" [ngClass]="dueSoonCount > 0 ? 'text-amber-600' : 'text-slate-800'">{{ dueSoonCount }}</p>
            <p class="text-[9px] font-bold uppercase tracking-widest" [ngClass]="dueSoonCount > 0 ? 'text-amber-500' : 'text-slate-400'">Pronto a Vencer</p>
          </div>
        </div>
      </div>

      <!-- Row 3: Financial Health Indicators -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <h4 class="text-sm font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Indicadores de Salud Financiera
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ROI</p>
            <p class="text-xl font-black" [ngClass]="roi > 0 ? 'text-emerald-600' : 'text-slate-800'">{{ roi | number:'1.1-1' }}%</p>
            <p class="text-[9px] text-slate-400">Retorno inversión</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eficiencia</p>
            <p class="text-xl font-black" [ngClass]="collectionEfficiency >= 80 ? 'text-emerald-600' : collectionEfficiency >= 50 ? 'text-amber-600' : 'text-rose-600'">{{ collectionEfficiency | number:'1.0-0' }}%</p>
            <p class="text-[9px] text-slate-400">De cobranza</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Morosidad</p>
            <p class="text-xl font-black" [ngClass]="delinquencyRate > 20 ? 'text-rose-600' : delinquencyRate > 0 ? 'text-amber-600' : 'text-emerald-600'">{{ delinquencyRate | number:'1.0-0' }}%</p>
            <p class="text-[9px] text-slate-400">Préstamos vencidos</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasa Prom.</p>
            <p class="text-xl font-black text-blue-600">{{ avgInterestRate | number:'1.1-1' }}%</p>
            <p class="text-[9px] text-slate-400">Interés promedio</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gan. Realizada</p>
            <p class="text-xl font-black text-emerald-600">{{ realizedProfit | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-[9px] text-slate-400">Interés cobrado</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital Total</p>
            <p class="text-xl font-black text-slate-800">{{ totalLentAmount | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-[9px] text-slate-400">Préstado histórico</p>
          </div>
        </div>
      </div>

      <!-- Row 4: Portfolio Analysis -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <h4 class="text-sm font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          Análisis de Cartera
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Préstamo Prom.</p>
            <p class="text-lg font-black text-slate-800">{{ avgLoanAmount | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Más Grande</p>
            <p class="text-lg font-black text-blue-600">{{ largestLoan | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Más Pequeño</p>
            <p class="text-lg font-black text-slate-600">{{ smallestLoan | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pago Promedio</p>
            <p class="text-lg font-black text-emerald-600">{{ avgPaymentAmount | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pagos</p>
            <p class="text-lg font-black text-slate-800">{{ totalPaymentsCount }}</p>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prést. / Cliente</p>
            <p class="text-lg font-black text-slate-800">{{ avgLoansPerClient | number:'1.1-1' }}</p>
          </div>
        </div>
      </div>

      <!-- Row 5: Partner Analytics (only if partners exist) -->
      <div *ngIf="totalPartnerCapital > 0" class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] shadow-2xl shadow-slate-800/30 p-6 text-white">
        <h4 class="text-sm font-black text-white/80 tracking-tight mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Métricas de Socios
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p class="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Capital Socios</p>
            <p class="text-xl font-black text-amber-400">{{ totalPartnerCapital | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
          <div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p class="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Ganancia Socios</p>
            <p class="text-xl font-black text-amber-400">{{ totalPartnerProfit | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
          <div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p class="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Préstamos Socios</p>
            <p class="text-xl font-black text-white">{{ partnerLoanCount }}</p>
          </div>
          <div class="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p class="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Mi Parte</p>
            <p class="text-xl font-black text-emerald-400">{{ myShareFromPartnerLoans | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
        </div>
      </div>

      <!-- Row 6: Three Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Recent Clients -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-black text-slate-800 tracking-tight">Últimos Ingresos</h4>
            <a routerLink="/clients" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">Ver Todos</a>
          </div>
          <div class="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 space-y-3">
            <div *ngFor="let client of recentClients" class="flex items-center gap-3 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: client.id}">
              <div class="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                {{ client.nombre ? client.nombre[0] : '?' }}{{ client.apellido ? client.apellido[0] : '?' }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate">{{ client.nombre }} {{ client.apellido }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ client.telefono || 'Sin teléfono' }}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-slate-200 group-hover:text-slate-400 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </div>
            <div *ngIf="!recentClients || recentClients.length === 0" class="py-8 text-center">
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin Actividad</p>
            </div>
          </div>
        </div>

        <!-- Recent Payments -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-black text-slate-800 tracking-tight">Últimos Pagos</h4>
            <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{{ recentPayments.length }} recientes</span>
          </div>
          <div class="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 space-y-3">
            <div *ngFor="let rp of recentPayments" class="flex items-center gap-3 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: rp.clientId}">
              <div class="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-black text-slate-800 truncate">{{ rp.clientName }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ rp.fecha }}</p>
              </div>
              <span class="text-sm font-black text-emerald-600 shrink-0">{{ rp.monto | currency }}</span>
            </div>
            <div *ngIf="recentPayments.length === 0" class="py-8 text-center">
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin Pagos</p>
            </div>
          </div>
        </div>

        <!-- Top Debtors -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-black text-slate-800 tracking-tight">Saldos Más Altos</h4>
            <a routerLink="/loans" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">Ver Préstamos</a>
          </div>
          <div class="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 space-y-3">
            <div *ngFor="let td of topDebtors; let i = index" class="flex items-center gap-3 group cursor-pointer" [routerLink]="['/loans']" [queryParams]="{id: td.clientId}">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                   [ngClass]="i === 0 ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-slate-50 text-slate-400 border border-slate-100'">
                #{{ i + 1 }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-sm font-black text-slate-800 truncate">{{ td.clientName }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ td.loanCount }} préstamo{{ td.loanCount > 1 ? 's' : '' }}</p>
              </div>
              <span class="text-sm font-black text-rose-600 shrink-0">{{ td.totalOwed | currency }}</span>
            </div>
            <div *ngIf="topDebtors.length === 0" class="py-8 text-center">
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin Datos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 7: Portfolio Performance -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8">
        <h4 class="text-sm font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
          Rendimiento de Cartera
        </h4>
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="relative w-44 h-44 shrink-0 transform hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 rounded-full border-[12px] border-slate-50"></div>
              <div class="absolute inset-0 rounded-full border-[12px] border-blue-600 border-t-transparent border-r-transparent transform"
                   [style.transform]="'rotate(' + (percentPaid * 3.6 - 45) + 'deg)'"
                   style="transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                 <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ percentPaid }}%</span>
                 <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Recuperado</span>
              </div>
          </div>
          <div class="grid grid-cols-3 gap-4 flex-grow w-full">
            <div class="text-center p-3 bg-amber-50 rounded-xl">
              <div class="flex items-center justify-center gap-1.5 mb-1">
                <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                <p class="text-[9px] font-black text-amber-600 uppercase tracking-widest">Pendientes</p>
              </div>
              <span class="text-xl font-black text-amber-700">{{ pendingCount }}</span>
            </div>
            <div class="text-center p-3 bg-emerald-50 rounded-xl">
              <div class="flex items-center justify-center gap-1.5 mb-1">
                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                <p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Cobrados</p>
              </div>
              <span class="text-xl font-black text-emerald-700">{{ paidCount }}</span>
            </div>
            <div class="text-center p-3 bg-rose-50 rounded-xl">
              <div class="flex items-center justify-center gap-1.5 mb-1">
                <div class="w-2 h-2 rounded-full bg-rose-400"></div>
                <p class="text-[9px] font-black text-rose-600 uppercase tracking-widest">Vencidos</p>
              </div>
              <span class="text-xl font-black text-rose-700">{{ overdueCount }}</span>
            </div>
            <div class="text-center p-3 bg-blue-50 rounded-xl">
              <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Capital Prestado</p>
              <span class="text-lg font-black text-blue-700">{{ totalLentAmount | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="text-center p-3 bg-emerald-50 rounded-xl">
              <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Recuperado</p>
              <span class="text-lg font-black text-emerald-700">{{ totalCollected | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="text-center p-3 bg-rose-50 rounded-xl">
              <p class="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Por Cobrar</p>
              <span class="text-lg font-black text-rose-700">{{ capitalEnLaCalle | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 8: Loans Due Soon -->
      <div *ngIf="loansDueSoon.length > 0" class="bg-white rounded-[2rem] border border-amber-200 shadow-sm p-6">
        <h4 class="text-sm font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Préstamos Próximos a Vencer (7 días)
          <span class="ml-auto text-[10px] font-black text-amber-600 uppercase tracking-widest">{{ loansDueSoon.length }} préstamos</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div *ngFor="let lds of loansDueSoon" class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-all" [routerLink]="['/loans']" [queryParams]="{id: lds.clientId}">
            <div class="w-9 h-9 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
              {{ lds.daysLeft }}d
            </div>
            <div class="flex-grow min-w-0">
              <p class="text-sm font-bold text-slate-800 truncate">{{ lds.clientName }}</p>
              <p class="text-[9px] font-bold text-amber-600 uppercase tracking-tight">Vence: {{ lds.fechaFin }} · {{ lds.monto | currency }}</p>
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

  // Financial KPIs
  capitalEnLaCalle: number = 0;
  totalCollected: number = 0;
  totalLentAmount: number = 0;
  overdueCount: number = 0;
  avgInterestRate: number = 0;
  totalPaymentsCount: number = 0;

  // Health Indicators
  roi: number = 0;
  collectionEfficiency: number = 0;
  delinquencyRate: number = 0;
  realizedProfit: number = 0;

  // Portfolio Analysis
  avgLoanAmount: number = 0;
  largestLoan: number = 0;
  smallestLoan: number = 0;
  avgPaymentAmount: number = 0;
  avgLoansPerClient: number = 0;

  // Partner Metrics
  totalPartnerCapital: number = 0;
  totalPartnerProfit: number = 0;
  partnerLoanCount: number = 0;
  myShareFromPartnerLoans: number = 0;

  // Due Soon
  dueSoonCount: number = 0;
  loansDueSoon: { clientName: string; clientId: number; monto: number; fechaFin: string; daysLeft: number }[] = [];

  // Lists
  recentPayments: { clientName: string; clientId: number; monto: number; fecha: string }[] = [];
  topDebtors: { clientName: string; clientId: number; totalOwed: number; loanCount: number }[] = [];

  // Payment cache
  allPayments: { payment: Payment; clientId: number; clientName: string }[] = [];

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
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
              this.allPayments.push({ payment: p, clientId: entry.clientId, clientName: entry.clientName });
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
    const paidLoans = activeLoans.filter(l => l.status === 'pagado');
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // === BASIC COUNTS ===
    this.totalLoansCount = activeLoans.length;
    this.paidCount = paidLoans.length;
    this.pendingCount = pendingLoans.length;
    this.suspendedCount = this.loans.filter(l => l.active === 0).length;
    this.percentPaid = this.totalLoansCount > 0 ? Math.round((this.paidCount / this.totalLoansCount) * 100) : 0;

    // === MY CAPITAL (original loans only, minus partner capital) ===
    this.totalCapital = this.loans
      .filter(l => !l.parentId && l.active !== 0)
      .reduce((acc, l) => acc + ((l.monto || 0) - (l.partnerCapital || 0)), 0);
    
    // === MY INTERESTS ===
    this.totalInterests = activeLoans.reduce((acc, l) => {
      const interest = (l.total || 0) - (l.monto || 0);
      const partnerProfit = (l.monto || 0) * ((l.partnerPercentage || 0) / 100);
      return acc + (interest - partnerProfit);
    }, 0);

    // === TOTAL LENT ===
    this.totalLentAmount = activeLoans.reduce((acc, l) => acc + (l.monto || 0), 0);

    // === PAYMENTS ===
    this.totalPaymentsCount = this.allPayments.length;
    this.totalCollected = this.allPayments.reduce((acc, ap) => acc + ap.payment.monto, 0);

    // === CAPITAL EN LA CALLE ===
    this.capitalEnLaCalle = 0;
    for (const loan of pendingLoans) {
      const loanPayments = this.allPayments
        .filter(ap => ap.payment.loan_id === loan.id)
        .sort((a, b) => (a.payment.id || 0) - (b.payment.id || 0));
      if (loanPayments.length > 0) {
        this.capitalEnLaCalle += (loanPayments[loanPayments.length - 1].payment.saldoNuevo ?? loan.monto);
      } else {
        this.capitalEnLaCalle += loan.monto;
      }
    }

    // === AVERAGE INTEREST RATE ===
    this.avgInterestRate = pendingLoans.length > 0
      ? pendingLoans.reduce((acc, l) => acc + l.porcentaje, 0) / pendingLoans.length
      : 0;

    // === OVERDUE ===
    const overdueLoans = pendingLoans.filter(l => {
      if (!l.fechaFin) return false;
      const parts = l.fechaFin.split('-');
      if (parts.length !== 3) return false;
      return new Date(+parts[0], +parts[1] - 1, +parts[2]) < today;
    });
    this.overdueCount = overdueLoans.length;

    // === DUE SOON (next 7 days) ===
    const sevenDays = new Date(today); sevenDays.setDate(sevenDays.getDate() + 7);
    this.loansDueSoon = [];
    for (const entry of clientLoanMap) {
      for (const loan of entry.loans) {
        if (loan.status !== 'pendiente' || loan.active === 0 || !loan.fechaFin) continue;
        const parts = loan.fechaFin.split('-');
        if (parts.length !== 3) continue;
        const dueDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        if (dueDate >= today && dueDate <= sevenDays) {
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          this.loansDueSoon.push({
            clientName: entry.clientName,
            clientId: entry.clientId,
            monto: loan.monto,
            fechaFin: loan.fechaFin,
            daysLeft: diffDays
          });
        }
      }
    }
    this.loansDueSoon.sort((a, b) => a.daysLeft - b.daysLeft);
    this.dueSoonCount = this.loansDueSoon.length;

    // === HEALTH INDICATORS ===
    // ROI: (Total Collected / Total Capital Invested) * 100
    this.roi = this.totalCapital > 0 ? ((this.totalCollected - this.totalCapital) / this.totalCapital) * 100 : 0;
    
    // Collection Efficiency: Total Collected / Total Expected (all loan totals) * 100
    const totalExpected = activeLoans.reduce((acc, l) => acc + (l.total || 0), 0);
    this.collectionEfficiency = totalExpected > 0 ? (this.totalCollected / totalExpected) * 100 : 0;
    
    // Delinquency Rate: Overdue / Pending * 100
    this.delinquencyRate = pendingLoans.length > 0 ? (this.overdueCount / pendingLoans.length) * 100 : 0;
    
    // Realized Profit: Interest actually collected from paid loans
    this.realizedProfit = paidLoans.reduce((acc, l) => {
      const interest = (l.total || 0) - (l.monto || 0);
      const partnerProfit = (l.monto || 0) * ((l.partnerPercentage || 0) / 100);
      return acc + (interest - partnerProfit);
    }, 0);

    // === PORTFOLIO ANALYSIS ===
    this.avgLoanAmount = activeLoans.length > 0 ? this.totalLentAmount / activeLoans.length : 0;
    const amounts = activeLoans.map(l => l.monto);
    this.largestLoan = amounts.length > 0 ? Math.max(...amounts) : 0;
    this.smallestLoan = amounts.length > 0 ? Math.min(...amounts) : 0;
    this.avgPaymentAmount = this.totalPaymentsCount > 0 ? this.totalCollected / this.totalPaymentsCount : 0;
    const clientsWithLoans = clientLoanMap.filter(e => e.loans.filter(l => l.active !== 0).length > 0).length;
    this.avgLoansPerClient = clientsWithLoans > 0 ? activeLoans.length / clientsWithLoans : 0;

    // === PARTNER METRICS ===
    const partnerLoans = activeLoans.filter(l => l.partnerId);
    this.partnerLoanCount = partnerLoans.length;
    this.totalPartnerCapital = partnerLoans.reduce((acc, l) => acc + (l.partnerCapital || 0), 0);
    this.totalPartnerProfit = partnerLoans.reduce((acc, l) => acc + ((l.monto || 0) * ((l.partnerPercentage || 0) / 100)), 0);
    this.myShareFromPartnerLoans = partnerLoans.reduce((acc, l) => {
      const interest = (l.total || 0) - (l.monto || 0);
      const partnerProfit = (l.monto || 0) * ((l.partnerPercentage || 0) / 100);
      return acc + (interest - partnerProfit);
    }, 0);

    // === RECENT PAYMENTS ===
    this.recentPayments = this.allPayments
      .sort((a, b) => (b.payment.id || 0) - (a.payment.id || 0))
      .slice(0, 5)
      .map(ap => ({ clientName: ap.clientName, clientId: ap.clientId, monto: ap.payment.monto, fecha: ap.payment.fecha }));

    // === TOP DEBTORS ===
    const debtorMap = new Map<number, { clientName: string; clientId: number; totalOwed: number; loanCount: number }>();
    for (const entry of clientLoanMap) {
      const cpl = entry.loans.filter(l => l.status === 'pendiente' && l.active !== 0);
      if (cpl.length === 0) continue;
      let owed = 0;
      for (const loan of cpl) {
        const lp = this.allPayments.filter(ap => ap.payment.loan_id === loan.id).sort((a, b) => (a.payment.id || 0) - (b.payment.id || 0));
        owed += lp.length > 0 ? (lp[lp.length - 1].payment.saldoNuevo ?? loan.monto) : loan.monto;
      }
      debtorMap.set(entry.clientId, { clientName: entry.clientName, clientId: entry.clientId, totalOwed: owed, loanCount: cpl.length });
    }
    this.topDebtors = Array.from(debtorMap.values()).sort((a, b) => b.totalOwed - a.totalOwed).slice(0, 5);
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
    if (!file.name.endsWith('.db')) { alert('Por favor selecciona un archivo .db válido'); return; }
    const confirmImport = confirm(`¿Estás seguro de importar "${file.name}"?\n\nEsto reemplazará TODOS los datos actuales.`);
    if (!confirmImport) { event.target.value = ''; return; }

    this.importing = true;
    try {
      const result = await this.dataService.importDatabase(file);
      const c = result.imported;
      alert(`✅ Importación exitosa:\n\n• Clientes: ${c.clients}\n• Socios: ${c.partners}\n• Préstamos: ${c.loans}\n• Pagos: ${c.payments}`);
      await this.refreshData();
    } catch (e) {
      console.error('Error importing database', e);
      alert('❌ Error al importar la base de datos.');
    } finally {
      this.importing = false;
      event.target.value = '';
    }
  }
}
