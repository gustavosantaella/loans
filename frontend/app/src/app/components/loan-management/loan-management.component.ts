import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Client, Loan, Payment, Partner } from '../../models/interfaces';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row bg-[#f8fafc]">
      <!-- Sidebar de Clientes (Premium Glass) -->
      <aside class="bg-white border-r border-slate-200/60 flex flex-col shadow-2xl shadow-slate-100 z-10"
             [class.hidden]="mobileShowDetail"
             [class.md:flex]="true"
             [ngClass]="mobileShowDetail ? 'hidden md:flex md:w-[380px]' : 'w-full md:w-[380px] flex'">
        <div class="p-4 sm:p-8 pb-4">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h3 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Directorio</h3>
            <span class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              {{ clients ? clients.length : 0 }} Clientes
            </span>
          </div>
          <div class="relative group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Buscar por nombre..." [(ngModel)]="searchTerm" (ngModelChange)="filterClients()"
                   class="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 placeholder:text-slate-300 font-medium">
          </div>
        </div>

        <div class="flex-grow overflow-y-auto px-4 pb-8 mt-4 custom-scrollbar">
          <div class="space-y-2">
            <div *ngFor="let client of filteredClients" 
                class="group relative p-5 rounded-3xl cursor-pointer transition-all duration-300 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-200/40"
                [class.bg-gradient-to-br]="selectedClient?.id === client.id"
                [class.from-blue-600]="selectedClient?.id === client.id"
                [class.to-indigo-700]="selectedClient?.id === client.id"
                [class.shadow-blue-500/20]="selectedClient?.id === client.id"
                [class.shadow-lg]="selectedClient?.id === client.id"
                [class.hover:bg-slate-50]="selectedClient?.id !== client.id"
                (click)="selectClient(client)">
              
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300"
                   [class.bg-white]="selectedClient?.id === client.id"
                   [class.text-blue-600]="selectedClient?.id === client.id"
                   [class.bg-slate-100]="selectedClient?.id !== client.id"
                   [class.text-slate-400]="selectedClient?.id !== client.id"
                   [class.group-hover:bg-blue-50]="selectedClient?.id !== client.id"
                   [class.group-hover:text-blue-600]="selectedClient?.id !== client.id">
                {{ client.nombre ? client.nombre[0] : '?' }}{{ client.apellido ? client.apellido[0] : '?' }}
              </div>

              <div class="flex-grow">
                <div class="flex items-center gap-2">
                  <p class="font-bold transition-all duration-300"
                     [class.text-white]="selectedClient?.id === client.id"
                     [class.text-slate-800]="selectedClient?.id !== client.id">
                    {{ client.nombre }} {{ client.apellido }}
                  </p>
                  <span *ngIf="clientHasOverdueLoans[client.id!]" 
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0"
                        [ngClass]="selectedClient?.id === client.id ? 'bg-rose-400/30 text-white' : 'bg-rose-100 text-rose-600'">
                    <span class="w-1.5 h-1.5 rounded-full animate-pulse"
                          [ngClass]="selectedClient?.id === client.id ? 'bg-white' : 'bg-rose-500'"></span>
                    Vencido
                  </span>
                  <span *ngIf="clientHasPendingLoans[client.id!] && !clientHasOverdueLoans[client.id!]" 
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0"
                        [ngClass]="selectedClient?.id === client.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'">
                    <span class="w-1.5 h-1.5 rounded-full animate-pulse"
                          [ngClass]="selectedClient?.id === client.id ? 'bg-white' : 'bg-amber-500'"></span>
                    Activo
                  </span>
                </div>
                <p class="text-xs transition-all duration-300"
                   [class.text-blue-100]="selectedClient?.id === client.id"
                   [class.text-slate-400]="selectedClient?.id !== client.id">
                  {{ client.telefono || 'Sin teléfono' }}
                </p>
              </div>

              <div *ngIf="selectedClient?.id === client.id" class="text-white opacity-80 animate-in fade-in slide-in-from-right-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Panel (Details) -->
      <main class="flex-grow overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar relative"
            [ngClass]="!mobileShowDetail ? 'hidden md:block' : 'block'">
        <div *ngIf="selectedClient" class="max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <!-- Mobile Back Button -->
          <button (click)="goBackToList()" class="md:hidden flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Directorio
          </button>

          <!-- Header del Cliente -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <span class="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">Expediente #CLI-{{selectedClient.id}}</span>
                <span *ngIf="loans && loans.length > 0" class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Activo</span>
              </div>
              <h2 class="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">{{ selectedClient.nombre }} {{ selectedClient.apellido }}</h2>
            </div>
            <button (click)="toggleLoanForm()" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-xl shadow-blue-500/20 font-bold flex items-center gap-2 sm:gap-3 transition-all duration-300 active:scale-95 leading-none text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Préstamo
            </button>
            <div class="flex gap-2">
              <button (click)="sendWhatsAppReminder()" title="Recordatorio WhatsApp" 
                      class="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl shadow-xl shadow-green-500/20 font-bold flex items-center justify-center transition-all duration-300 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
              </button>
              <button (click)="downloadReport('pdf')" title="Descargar PDF" 
                      class="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-2xl shadow-xl shadow-rose-500/20 font-bold flex items-center justify-center transition-all duration-300 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
              </button>
              <button (click)="downloadReport('excel')" title="Descargar Excel" 
                      class="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/20 font-bold flex items-center justify-center transition-all duration-300 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
              </button>
            </div>
          </div>

          <!-- Client Summary KPI Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Prestado</p>
              <p class="text-xl font-black text-slate-800 mt-1">{{ clientStats.capitalPrestado | currency }}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cobrado</p>
              <p class="text-xl font-black text-emerald-600 mt-1">{{ clientStats.totalCobrado | currency }}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Pendiente</p>
              <p class="text-xl font-black text-rose-600 mt-1">{{ clientStats.saldoPendiente | currency }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg shadow-blue-500/20">
              <p class="text-[10px] font-black text-white/60 uppercase tracking-widest">Ganancia Proyectada</p>
              <p class="text-xl font-black text-white mt-1">{{ clientStats.gananciaProyectada | currency }}</p>
            </div>
          </div>

          <!-- Formulario de Nuevo Préstamo -->
          <div *ngIf="showLoanForm" class="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-5 sm:p-10 border-2 border-blue-500/20 animate-in zoom-in-95 duration-300 space-y-6 sm:space-y-8">
            <h4 class="text-xl sm:text-2xl font-black text-slate-800">Parámetros del Crédito</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto del Préstamo</label>
                <input type="number" [(ngModel)]="newLoan.monto" (ngModelChange)="calculateMyShare()" placeholder="0.00" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 font-bold text-lg">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tasa Total (%)</label>
                <input type="number" [(ngModel)]="newLoan.porcentaje" (ngModelChange)="calculateMyShare()" placeholder="%" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 font-bold text-lg text-blue-600">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimiento</label>
                <input type="date" [(ngModel)]="newLoan.fechaFin" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 font-bold">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estatus</label>
                <select [(ngModel)]="newLoan.status" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 font-bold">
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>
            </div>

            <!-- Socio / Inversionista Section -->
            <div class="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-6">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                <label class="text-xs font-black text-purple-600 uppercase tracking-widest">Participación de Socio</label>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="space-y-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Socio Inversionista</label>
                   <select [(ngModel)]="newLoan.partnerId" (ngModelChange)="calculateMyShare()" class="w-full px-5 py-4 bg-white border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 font-bold text-slate-700">
                     <option [ngValue]="null">-- Ninguno --</option>
                     <option *ngFor="let p of partners" [value]="p.id">{{ p.nombre }}</option>
                   </select>
                </div>

                <div *ngIf="newLoan.partnerId" class="space-y-2 animate-in fade-in slide-in-from-left-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ganancia del Socio (%)</label>
                   <div class="relative">
                     <input type="number" [(ngModel)]="newLoan.partnerPercentage" (ngModelChange)="calculateMyShare()" placeholder="0" class="w-full px-5 py-4 bg-white border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 font-bold text-purple-600 mb-2">
                     <span class="absolute right-5 top-5 -translate-y-1/2 font-bold text-slate-300">%</span>
                   </div>

                   <!-- Math Visualization -->
                   <div *ngIf="partnerProfitAmount > 0" class="px-4 py-3 bg-purple-100/50 rounded-xl font-mono text-xs">
                       <div class="flex flex-col items-end">
                           <div class="text-slate-500 font-bold">{{ newLoan.monto | currency }}</div>
                           <div class="w-full border-b border-purple-200 pb-1 mb-1 flex justify-between items-end">
                               <span class="text-purple-300 font-bold pl-1">x</span>
                               <span class="text-slate-500 font-bold">{{ newLoan.partnerPercentage }}%</span>
                           </div>
                           <div class="font-black text-purple-600 text-sm">{{ partnerProfitAmount | currency }}</div>
                       </div>
                   </div>
                </div>

                <div *ngIf="newLoan.partnerId" class="space-y-2 animate-in fade-in slide-in-from-left-2 delay-75">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capital del Socio</label>
                   <div class="relative">
                     <span class="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-300">$</span>
                     <input type="number" [(ngModel)]="newLoan.partnerCapital" (ngModelChange)="calculateMyShare()" placeholder="0.00" class="w-full pl-9 pr-5 py-4 bg-white border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 font-bold text-purple-600">
                   </div>
                </div>

                <!-- Fields for "My Share" -->
                <div *ngIf="newLoan.partnerId" class="space-y-2 animate-in fade-in slide-in-from-left-2 delay-100">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mi Ganancia / Capital</label>
                    <div class="flex flex-col gap-2">
                         <!-- Profit Math -->
                         <div class="px-4 py-3 bg-blue-50/50 rounded-xl font-mono text-xs">
                             <div class="flex justify-between items-center mb-2">
                                <span class="text-[10px] font-bold text-blue-400 font-sans uppercase">Ganancia</span>
                             </div>
                             <div class="flex flex-col items-end">
                                <div class="text-slate-500 font-bold">{{ newLoan.monto | currency }}</div>
                                <div class="w-full border-b border-blue-200 pb-1 mb-1 flex justify-between items-end">
                                    <span class="text-blue-300 font-bold pl-1">x</span>
                                    <span class="text-slate-500 font-bold">{{ myShare.percentage | number:'1.0-2' }}%</span>
                                </div>
                                <div class="font-black text-blue-600 text-sm">{{ myShare.profit | currency }}</div>
                             </div>
                         </div>
                         <!-- Capital (Simple) -->
                         <div class="flex justify-between items-center px-4 py-3 bg-blue-50/50 rounded-xl">
                             <span class="text-[10px] font-bold text-slate-400 uppercase">Mi Capital</span>
                             <span class="font-black text-blue-600">{{ myShare.capital | currency }}</span>
                         </div>
                     </div>

                 </div>
              </div>
            </div>

            <div class="flex gap-4">
               <button (click)="showLoanForm = false" class="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600">Descartar</button>
               <button (click)="addLoan()" class="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95">GENERAR PRÉSTAMO</button>
            </div>
          </div>

          <!-- Historial de Préstamos -->
          <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-8 border-b border-slate-100 flex items-center justify-between">
              <h4 class="text-xl font-black text-slate-800">Cartera de Préstamos</h4>
            </div>
            <div class="overflow-x-auto">
              <table *ngIf="loans && loans.length > 0; else noLoans" class="w-full text-left">
                <thead class="bg-slate-50/50">
                  <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th class="px-8 py-5">Emisión / Venc. / Ref.</th>
                    <th class="px-8 py-5">Capital original</th>
                    <th class="px-8 py-5 text-right">Total a Pagar</th>
                    <th class="px-8 py-5 text-right">Saldo Pendiente</th>
                    <th class="px-8 py-5 text-right">Total Pendiente</th>
                    <th class="px-8 py-5 text-center">Estado</th>
                    <th class="px-8 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50" *ngFor="let loan of loans">
                  <tr class="group hover:bg-slate-50/80 transition-all duration-200" [class.opacity-50]="loan.active === 0" [class.grayscale]="loan.active === 0">
                    <td class="px-8 py-6">
                      <p class="text-sm font-bold text-slate-700">{{ loan.fecha }}</p>
                      <p class="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1" *ngIf="loan.fechaFin">VENCE: {{ loan.fechaFin }}</p>
                      <span *ngIf="isOverdue(loan)" class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        VENCIDO · {{ daysOverdue(loan) }} días
                      </span>
                      <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1" *ngIf="loan.parentId">REF: #{{ loan.parentId }}</p>
                      <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1" *ngIf="loan.active === 0">(DESACTIVADO)</p>
                    </td>
                    <td class="px-8 py-6">
                      <p class="font-black text-slate-800">{{ loan.monto | currency }}</p>
                      <div class="flex flex-col gap-0.5 mt-1">
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ loan.porcentaje }}% Int.</p>
                        <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                          Ganancia: {{ (loan.monto * (loan.porcentaje / 100)) | currency }}
                        </p>
                      </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <span class="text-lg font-black text-blue-600">{{ loan.total | currency }}</span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <span class="text-lg font-black" [class.text-rose-600]="getRemainingCapital(loan) > 0" [class.text-emerald-600]="getRemainingCapital(loan) <= 0">
                        {{ getRemainingCapital(loan) | currency }}
                      </span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <span class="text-lg font-black text-purple-600">
                        {{ getRemainingBalance(loan) | currency }}
                      </span>
                    </td>

                    <td class="px-8 py-6 text-center">
                      <span class="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                            [ngClass]="loan.status === 'pagado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'">
                        {{ loan.status }}
                      </span>
                    </td>
                    <td class="px-8 py-6 text-right flex items-center justify-end gap-2">
                      <ng-container *ngIf="loan.active !== 0">
                        <button *ngIf="loan.status === 'pendiente'" (click)="openPaymentModal(loan)" title="Abonar"
                                class="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button *ngIf="loan.status === 'pendiente'" (click)="corteLoan(loan)" title="Corte (Refinanciar)"
                                class="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/10 hover:bg-orange-600 transition-all active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243zm0-5.758a3 3 0 11-4.243-4.243 3 3 0 014.243-4.243z" />
                          </svg>
                        </button>
                        <button (click)="openHistoryModal(loan)" title="Ver Historial"
                                class="p-2.5 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-600 transition-all active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button (click)="deleteLoan(loan)" title="Eliminar"
                                class="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button (click)="toggleLoanActive(loan)" title="Desactivar"
                                class="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-500 hover:text-white transition-all active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </ng-container>

                      <button *ngIf="loan.active === 0" (click)="toggleLoanActive(loan)" title="Reanudar"
                              class="px-4 py-2 bg-slate-800 text-white rounded-xl shadow-lg hover:bg-slate-700 transition-all active:scale-95 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reanudar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noLoans>
                <div class="py-24 flex flex-col items-center justify-center text-slate-300">
                  <p class="text-lg font-bold">No hay créditos registrados para este cliente</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Placeholder Inicial -->
        <div *ngIf="!selectedClient" class="h-full flex items-center justify-center">
          <div class="max-w-md w-full p-12 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
             <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
             </div>
             <h3 class="text-2xl font-black text-slate-800 tracking-tight">Selecciona un Perfil</h3>
             <p class="text-slate-400 font-medium mt-4">Haz clic en un cliente de la lista para gestionar su cartera de créditos.</p>
          </div>
        </div>

        <!-- MODAL: Registrar Abono -->
        <div *ngIf="showPaymentModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="closePaymentModal()"></div>
          <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="bg-emerald-600 p-8 text-white shrink-0">
              <h3 class="text-2xl font-black">Nuevo Abono</h3>
              <p class="text-emerald-100 text-sm opacity-80 mt-1">Préstamo #{{selectedLoanForPayment?.id}}</p>
            </div>
            
            <!-- Scrollable Content -->
            <div class="p-8 space-y-8 overflow-y-auto custom-scrollbar">

              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto a abonar (USD)</label>
                  <input type="number" [(ngModel)]="newPaymentAmount" (ngModelChange)="calculatePaymentDistribution()" class="w-full px-5 py-6 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all font-black text-3xl text-emerald-600" placeholder="0.00">
                  
                  <!-- Commission Coverage Alert -->
                  <div *ngIf="commissionCoverageMessage" class="mt-2 text-center">
                    <span class="text-xs font-bold px-3 py-1 rounded-lg inline-block"
                          [ngClass]="isCommissionCovered ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600 animate-pulse'">
                      {{ commissionCoverageMessage }}
                    </span>
                  </div>
                </div>

                <!-- Detailed Balance Derivation -->
                 <div class="bg-rose-50 p-6 rounded-3xl space-y-3">
                    <div class="text-sm font-mono text-rose-800">
                        <!-- Capital -->
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-bold text-rose-400">Capital</span>
                            <span class="font-bold">{{ selectedLoanForPayment?.monto | currency }}</span>
                        </div>

                        <!-- Interest Math -->
                        <div class="flex justify-between items-end mb-1">
                             <span class="text-xs font-bold text-rose-400 pb-1">Interés</span>
                             <div class="flex flex-col items-end">
                                 <div class="border-b border-rose-300 flex items-center gap-2">
                                     <span class="text-xs text-rose-400">{{ selectedLoanForPayment?.monto | currency }}</span>
                                     <span class="text-[10px] text-rose-400">x</span>
                                     <span class="text-xs text-rose-400">{{ selectedLoanForPayment?.porcentaje }}%</span>
                                 </div>
                                 <span class="font-bold text-emerald-600">+ {{ (selectedLoanForPayment!.monto * (selectedLoanForPayment!.porcentaje / 100)) | currency }}</span>
                             </div>
                        </div>

                        <!-- Subtotal -->
                        <div class="flex justify-between items-center mb-1 pt-1 border-t border-rose-200/50 border-dashed">
                            <span class="text-xs font-bold text-rose-400">Total Deuda</span>
                            <span class="font-bold">{{ selectedLoanForPayment?.total | currency }}</span>
                        </div>

                        <!-- Paid Previous -->
                        <div *ngIf="totalPaidSoFar > 0" class="flex justify-between items-center mb-1">
                            <span class="text-xs font-bold text-slate-400">Pagado (Anterior)</span>
                            <span class="font-bold text-slate-400">- {{ totalPaidSoFar | currency }}</span>
                        </div>

                        <!-- New Payment (Abono) -->
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-rose-500">Abono (Actual)</span>
                            <span class="font-bold text-rose-500">- {{ newPaymentAmount || 0 | currency }}</span>
                        </div>

                        <!-- Interest Toggle -->
                        <div class="flex items-center justify-between py-2 border-b border-rose-100 mb-2">
                             <div class="flex items-center gap-2">
                                <input type="checkbox" id="genInterest" [(ngModel)]="generateInterest" (change)="toggleInterest()" class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300">
                                <label for="genInterest" class="text-xs font-bold text-slate-500 uppercase">Generar Interés ({{ selectedLoanForPayment?.porcentaje }}%)</label>
                             </div>
                             <span *ngIf="generateInterest" class="text-sm font-black text-purple-500 animate-in fade-in">+ {{ calculatedInterest | currency }}</span>
                        </div>

                        <!-- Final Result: Restante -->
                        <div class="flex justify-between items-center pt-2 border-t-2 border-rose-200">
                            <span class="text-md font-black text-rose-500 uppercase">Restante</span>
                            <span class="text-2xl font-black text-rose-600">
                                {{ ((currentBalance + (generateInterest ? calculatedInterest : 0)) - (newPaymentAmount || 0)) | currency }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Payment Note -->
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota / Observación (opcional)</label>
                  <input type="text" [(ngModel)]="newPaymentNote" placeholder="Ej: Pago por transferencia bancaria..." 
                         class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all font-medium text-sm text-slate-600 placeholder:text-slate-300">
                </div>

                <!-- Total Profit Breakdown (Arithmetic Style) -->
                <div *ngIf="selectedLoanForPayment?.partnerId" class="flex gap-8 p-6 bg-slate-50/80 border border-slate-100 rounded-2xl font-mono text-sm">
                    <!-- Partner Math -->
                    <div class="flex-1 flex flex-col items-end">
                        <div class="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">Ganancia Socio</div>
                        <div class="text-slate-500 font-bold">{{ selectedLoanForPayment?.monto | currency }}</div>
                        <div class="w-full border-b-2 border-slate-300 pb-1 mb-1 flex justify-between items-end">
                            <span class="text-slate-400 font-bold pl-2">x</span>
                            <span class="text-slate-500 font-bold">{{ selectedLoanForPayment?.partnerPercentage }}%</span>
                        </div>
                        <div class="font-black text-emerald-600 text-lg">{{ totalProfitBreakdown.partner | currency }}</div>
                    </div>

                    <!-- Divider -->
                    <div class="w-px bg-slate-200"></div>

                    <!-- Me Math -->
                    <div class="flex-1 flex flex-col items-end">
                        <div class="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">Mi Ganancia</div>
                        <div class="text-slate-500 font-bold">{{ selectedLoanForPayment?.monto | currency }}</div>
                        <div class="w-full border-b-2 border-slate-300 pb-1 mb-1 flex justify-between items-end">
                            <span class="text-slate-400 font-bold pl-2">x</span>
                            <span class="text-slate-500 font-bold">{{ ((selectedLoanForPayment?.porcentaje || 0) - (selectedLoanForPayment?.partnerPercentage || 0)) | number:'1.0-2' }}%</span>
                        </div>
                        <div class="font-black text-emerald-600 text-lg">{{ totalProfitBreakdown.me | currency }}</div>
                    </div>
                </div>
                </div>
              </div>
            
            <!-- Footer (Fixed) -->
            <div class="p-8 border-t border-slate-100 bg-white rounded-b-[2.5rem] shrink-0">
               <div class="flex gap-4">
                 <button (click)="closePaymentModal()" class="px-8 py-5 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600">Cancelar</button>
                 <button (click)="submitPayment()"
                         [disabled]="!newPaymentAmount || (selectedLoanForPayment?.partnerId && !isCommissionCovered)"
                         [class.opacity-50]="!newPaymentAmount || (selectedLoanForPayment?.partnerId && !isCommissionCovered)"
                         class="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:cursor-not-allowed">CONFIRMAR ABONO</button>
               </div>
            </div>
          </div>
        </div>

        <!-- MODAL: Historial de Pagos -->
        <div *ngIf="showHistoryModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="closeHistoryModal()"></div>
          <div class="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col max-h-[85vh]">
            <div class="bg-blue-600 p-8 text-white rounded-t-[2.5rem]">
              <h3 class="text-2xl font-black">Historial de Abonos</h3>
              <p class="text-blue-100 text-sm opacity-80 mt-1">
                Crédito por {{ selectedLoanForHistory?.monto | currency }}
                <span *ngIf="selectedLoanForHistory?.parentId" class="ml-2 px-2 py-0.5 bg-blue-500 text-[10px] rounded-lg">Ref. de #{{selectedLoanForHistory?.parentId}}</span>
              </p>
            </div>
            <div class="p-8 overflow-y-auto flex-grow custom-scrollbar">
              <div *ngIf="selectedLoanForHistory?.parentId" class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl">
                <p class="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1 italic">Nota de Refinanciamiento</p>
                <p class="text-sm text-blue-600 leading-relaxed font-medium">Este crédito se originó de un corte realizado al préstamo #{{selectedLoanForHistory?.parentId}}.</p>
              </div>

              <table *ngIf="paymentHistory && paymentHistory.length > 0; else noHistory" class="w-full text-left">
                <thead class="border-b border-slate-100">
                  <tr class="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th class="py-4">Fecha</th>
                    <th class="py-4 text-right">Saldo Ant.</th>
                    <th class="py-4 text-right text-purple-500">+ Interés</th>
                    <th class="py-4 text-right text-emerald-600">- Abono</th>
                    <th class="py-4 text-right text-slate-700">Nuevo Saldo</th>
                    <th class="py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr *ngFor="let pay of paymentHistory" class="group hover:bg-slate-50 transition-all">
                    <td class="py-5">
                      <div class="text-sm font-bold text-slate-600">{{ pay.fecha }}</div>
                      <div *ngIf="pay.nota" class="text-[10px] text-slate-400 italic mt-0.5 max-w-[120px] truncate" [title]="pay.nota">{{ pay.nota }}</div>
                    </td>
                    <td class="py-5 text-right font-medium text-slate-400">
                      <span *ngIf="pay.saldoAnterior !== undefined">{{ pay.saldoAnterior | currency }}</span>
                      <span *ngIf="pay.saldoAnterior === undefined">-</span>
                    </td>
                    <td class="py-5 text-right font-bold text-purple-500">
                      <span *ngIf="pay.interes !== undefined">{{ pay.interes | currency }}</span>
                      <span *ngIf="pay.interes === undefined">-</span>
                    </td>
                    <td class="py-5 text-right font-black text-emerald-600">{{ pay.monto | currency }}</td>
                    <td class="py-5 text-right font-bold text-slate-700">
                      <span *ngIf="pay.saldoNuevo !== undefined">{{ pay.saldoNuevo | currency }}</span>
                      <span *ngIf="pay.saldoNuevo === undefined">-</span>
                    </td>
                    <td class="py-5 text-right">
                      <button (click)="deletePayment(pay)" class="p-2 text-rose-300 hover:text-rose-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noHistory>
                <div class="py-12 text-center text-slate-300 font-medium italic">No se han registrado abonos aún.</div>
              </ng-template>
            </div>
            <div class="p-8 border-t border-slate-100 flex justify-end">
              <button (click)="closeHistoryModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-3 rounded-2xl font-bold transition-all">Cerrar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class LoanManagementComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';
  loans: Loan[] = [];
  partners: Partner[] = [];
  selectedClient: Client | null = null;
  showLoanForm: boolean = false;
  mobileShowDetail: boolean = false;
  clientHasPendingLoans: { [clientId: number]: boolean } = {};
  clientHasOverdueLoans: { [clientId: number]: boolean } = {};
  clientStats = { capitalPrestado: 0, totalCobrado: 0, saldoPendiente: 0, gananciaProyectada: 0 };
  newPaymentNote: string = '';
  newLoan: any = {
    monto: 0,
    porcentaje: 0,
    fechaFin: '',
    status: 'pendiente',
    partnerId: null,
    partnerPercentage: 0,
    partnerCapital: 0
  };

  // State: Payment Modal
  showPaymentModal: boolean = false;
  selectedLoanForPayment: Loan | null = null;
  newPaymentAmount: number = 0;
  currentBalance: number = 0;

  // State: History Modal
  showHistoryModal: boolean = false;
  selectedLoanForHistory: Loan | null = null;
  paymentHistory: Payment[] = [];

  // Local calculation cache: payments per loan for balance calculations
  loanPaymentsMap: { [loanId: number]: Payment[] } = {};

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadInitialData();
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        const id = Number(params['id']);
        const client = this.clients.find(c => c.id === id);
        if (client) this.selectClient(client);
      }
    });
  }

  async loadInitialData() {
    try {
      this.clients = await this.dataService.getClients() || [];
      this.filteredClients = [...this.clients];
      this.partners = await this.dataService.getPartners() || [];
      // Check which clients have pending / overdue loans
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (const client of this.clients) {
        const loans = await this.dataService.getLoans(client.id!);
        const activeLoans = loans.filter(l => l.status === 'pendiente' && l.active !== 0);
        this.clientHasPendingLoans[client.id!] = activeLoans.length > 0;
        this.clientHasOverdueLoans[client.id!] = activeLoans.some(l => {
          if (!l.fechaFin) return false;
          const parts = l.fechaFin.split('-');
          if (parts.length !== 3) return false;
          const dueDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
          return dueDate < today;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async selectClient(client: Client) {
    try {
      this.selectedClient = client;
      this.mobileShowDetail = true;
      this.loans = await this.dataService.getLoans(client.id!) || [];
      this.showLoanForm = false;
      // Update pending & overdue loan status for sidebar badge
      const activeLoans = this.loans.filter(l => l.status === 'pendiente' && l.active !== 0);
      this.clientHasPendingLoans[client.id!] = activeLoans.length > 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      this.clientHasOverdueLoans[client.id!] = activeLoans.some(l => {
        if (!l.fechaFin) return false;
        const parts = l.fechaFin.split('-');
        if (parts.length !== 3) return false;
        const dueDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        return dueDate < today;
      });
      // Fetch all payments for cache to show balances
      this.loanPaymentsMap = {};
      for (const loan of this.loans) {
        const payments = await this.dataService.getPayments(loan.id!);
        this.loanPaymentsMap[loan.id!] = payments;
      }
      // Calculate client stats
      this.calculateClientStats();
    } catch (e) {
      console.error(e);
      this.loans = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  goBackToList() {
    this.mobileShowDetail = false;
    this.selectedClient = null;
    this.cdr.detectChanges();
  }

  toggleLoanForm() {
    this.showLoanForm = !this.showLoanForm;
    this.cdr.detectChanges();
  }

  filterClients() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(c =>
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(term) ||
        (c.telefono && c.telefono.toLowerCase().includes(term))
      );
    }
    this.cdr.detectChanges();
  }

  isOverdue(loan: Loan): boolean {
    if (loan.status !== 'pendiente' || loan.active === 0 || !loan.fechaFin) return false;
    const parts = loan.fechaFin.split('-');
    if (parts.length !== 3) return false;
    const dueDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  daysOverdue(loan: Loan): number {
    if (!loan.fechaFin) return 0;
    const parts = loan.fechaFin.split('-');
    if (parts.length !== 3) return 0;
    const dueDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - dueDate.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  calculateClientStats() {
    const activeLoans = this.loans.filter(l => l.active !== 0 && l.status === 'pendiente');
    this.clientStats.capitalPrestado = activeLoans.reduce((acc, l) => acc + l.monto, 0);
    let totalCobrado = 0;
    let saldoPendiente = 0;
    for (const loan of activeLoans) {
      const payments = this.loanPaymentsMap[loan.id!] || [];
      totalCobrado += payments.reduce((acc, p) => acc + p.monto, 0);
      saldoPendiente += this.getRemainingCapital(loan);
    }
    this.clientStats.totalCobrado = totalCobrado;
    this.clientStats.saldoPendiente = saldoPendiente;
    this.clientStats.gananciaProyectada = activeLoans.reduce((acc, l) => acc + (l.monto * l.porcentaje / 100), 0);
  }

  sendWhatsAppReminder() {
    if (!this.selectedClient) return;
    const phone = (this.selectedClient.telefono || '').replace(/[^0-9]/g, '');
    if (!phone) {
      alert('Este cliente no tiene un número de teléfono registrado.');
      return;
    }
    const name = `${this.selectedClient.nombre} ${this.selectedClient.apellido}`;
    const pendingLoans = this.loans.filter(l => l.status === 'pendiente' && l.active !== 0);
    const totalPending = pendingLoans.reduce((acc, l) => acc + this.getRemainingBalance(l), 0);
    const message = `Hola ${name}, le recordamos que tiene un saldo pendiente de $${totalPending.toFixed(2)}. Quedo atento a su pago. Gracias.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // New property for displaying user's share
  myShare = { percentage: 0, capital: 0, profit: 0 };
  partnerProfitAmount: number = 0;

  /**
   * Saldo Pendiente: capital restante (monto original - pagos realizados).
   * Usa el saldoNuevo del último pago registrado, o el monto original si no hay pagos.
   */
  getRemainingCapital(loan: Loan): number {
    const payments = this.loanPaymentsMap[loan.id!] || [];
    if (payments.length === 0) return loan.monto;
    const lastPayment = payments[payments.length - 1];
    return lastPayment.saldoNuevo ?? loan.monto;
  }

  /**
   * Saldo Total Pendiente: capital restante + interés sobre ese capital.
   */
  getRemainingBalance(loan: Loan): number {
    const capital = this.getRemainingCapital(loan);
    return capital + (capital * loan.porcentaje / 100);
  }

  calculateMyShare() {
    if (this.newLoan.partnerId) {
      // Calculate My Percentage
      const totalRate = this.newLoan.porcentaje || 0;
      const partnerRate = this.newLoan.partnerPercentage || 0;
      this.myShare.percentage = Math.max(0, totalRate - partnerRate);

      // Calculate My Capital
      const totalAmount = this.newLoan.monto || 0;
      const partnerCapital = this.newLoan.partnerCapital || 0;
      this.myShare.capital = Math.max(0, totalAmount - partnerCapital);

      // Calculate Profit Amounts (assuming simple interest on the total amount or just sharing the total interest?)
      // Typically: Profit = Principal * Rate. 
      // User says: "If loan is 1000 at 12%, and partner gets 6%... partner gets 6% gain".
      // 1000 * 12% = 120 Total Interest.
      // Partner: 1000 * 6% = 60? OR is it proportional to capital?
      // User request implies strict percentage split: "me corresponde el 6%".
      // Let's assume Interest Amount = Loan Amount * (Rate/100).
      
      this.partnerProfitAmount = totalAmount * (partnerRate / 100);
      this.myShare.profit = totalAmount * (this.myShare.percentage / 100);
      
    } else {
      this.myShare = { percentage: 0, capital: 0, profit: 0 };
      this.partnerProfitAmount = 0;
    }
  }

  async addLoan() {
    if (this.selectedClient && this.newLoan.monto > 0) {
      try {
        const loan: Loan = {
          clientId: this.selectedClient.id!,
          fecha: new Date().toLocaleDateString('es-ES'),
          fechaFin: this.newLoan.fechaFin,
          monto: this.newLoan.monto,
          porcentaje: this.newLoan.porcentaje,
          total: this.newLoan.monto + (this.newLoan.monto * (this.newLoan.porcentaje / 100)),
          status: this.newLoan.status,
          partnerId: this.newLoan.partnerId,
          partnerPercentage: this.newLoan.partnerId ? this.newLoan.partnerPercentage : undefined,
          partnerCapital: this.newLoan.partnerId ? this.newLoan.partnerCapital : undefined
        };

        await this.dataService.addLoan(loan);
        await this.selectClient(this.selectedClient);
        this.newLoan = { 
          monto: 0, 
          porcentaje: 0, 
          fechaFin: '', 
          status: 'pendiente',
          partnerId: null,
          partnerPercentage: 0,
          partnerCapital: 0
        };
      } catch (e) {
        console.error(e);
      } finally {
        this.cdr.detectChanges();
      }
    }
  }

  async deleteLoan(loan: Loan) {
    if (confirm('¿Estás seguro de eliminar este préstamo? Se eliminarán también todos sus abonos.')) {
      try {
        await this.dataService.deleteLoan(loan.id!);
        if (this.selectedClient) await this.selectClient(this.selectedClient);
      } catch (e) {
        console.error(e);
      } finally {
        this.cdr.detectChanges();
      }
    }
  }

  async toggleLoanActive(loan: Loan) {
    if (!loan.id) return;
    try {
      const newActiveStatus = (loan.active === undefined || loan.active === 1) ? 0 : 1;
      const updatedLoan = { ...loan, active: newActiveStatus };
      await this.dataService.updateLoan(updatedLoan);
      if (this.selectedClient) await this.selectClient(this.selectedClient);
    } catch (e) {
      console.error('Error toggling loan active status', e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async downloadReport(type: 'pdf' | 'excel') {
    if (!this.selectedClient) return;
    try {
      const blob = await this.dataService.downloadReport(this.selectedClient.id!, type);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${this.selectedClient.nombre}_${this.selectedClient.apellido}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading report', e);
      alert('Error al descargar el reporte');
    }
  }

  // LOGICA: CORTE (REFINANCIAR)
  async corteLoan(loan: Loan) {
    if (!this.selectedClient) return;
    
    const balance = this.getRemainingCapital(loan);
    if (balance <= 0) {
      alert('El préstamo ya no tiene saldo pendiente.');
      return;
    }

    if (confirm(`¿Realizar CORTE? Se liquidará el préstamo actual (${loan.id}) con un abono por el saldo restante (${balance.toFixed(2)}) y se creará uno nuevo por ese mismo capital.`)) {
      try {
        // 1. Liquidar el actual
        const finalPayment: Payment = {
          loan_id: loan.id!,
          monto: balance,
          fecha: new Date().toLocaleDateString('es-ES')
        };
        await this.dataService.addPayment(loan.id!, finalPayment);

        // 2. Crear el nuevo con el mismo % y el balance como nuevo capital, relacionado al anterior
        const newLoan: Loan = {
          clientId: this.selectedClient.id!,
          fecha: new Date().toLocaleDateString('es-ES'),
          fechaFin: '', 
          monto: balance,
          porcentaje: loan.porcentaje,
          total: balance + (balance * (loan.porcentaje / 100)),
          status: 'pendiente',
          parentId: loan.id // Relación establecida
        };
        await this.dataService.addLoan(newLoan);

        // 3. Refrescar
        await this.selectClient(this.selectedClient);
        alert('Corte realizado con éxito.');
      } catch (e) {
        console.error('Error durante el corte:', e);
        alert('Ocurrió un error al realizar el corte.');
      } finally {
        this.cdr.detectChanges();
      }
    }
  }

  // LOGICA: ABONOS
  paymentBreakdown = { partner: 0, me: 0 }; // Breakdown of total balance
  totalProfitBreakdown = { partner: 0, me: 0 }; // Total Profit for the Loan (Loan Amount * Rate)
  commissionCoverageMessage: string = '';
  isCommissionCovered: boolean = false;
  totalPaidSoFar: number = 0;

  // Optional Interest Toggle
  generateInterest: boolean = false;
  calculatedInterest: number = 0;

  async openPaymentModal(loan: Loan) {
    this.selectedLoanForPayment = loan;
    this.newPaymentAmount = 0;
    this.newPaymentNote = '';
    this.currentBalance = this.getRemainingCapital(loan);

    // Reset Interest Toggle
    this.generateInterest = false;
    this.calculatedInterest = this.currentBalance * ((loan.porcentaje || 0) / 100);

    // Calculate Total Profit Breakdown (Loan Amount * Percentage)
    if (loan.partnerId && loan.monto > 0) {
      const partnerRate = loan.partnerPercentage || 0;
      const myRate = (loan.porcentaje - partnerRate);

      this.totalProfitBreakdown.partner = loan.monto * (partnerRate / 100);
      this.totalProfitBreakdown.me = loan.monto * (myRate / 100);
    } else {
      this.totalProfitBreakdown = { partner: 0, me: 0 };
    }
    
    this.checkCommissionCoverage();
    const paidPayments = this.loanPaymentsMap[loan.id!] || [];
    this.totalPaidSoFar = paidPayments.reduce((acc, p) => acc + p.monto, 0);

    this.showPaymentModal = true;
    this.cdr.detectChanges();
  }

  checkCommissionCoverage() {
    const loan = this.selectedLoanForPayment;
    // If no loan or amount, or NO PARTNER, validation counts as passed (or irrelevant)
    if (!loan || !this.newPaymentAmount || !loan.partnerId) {
      this.commissionCoverageMessage = '';
      this.isCommissionCovered = true; 
      return;
    }
    
    // Total Commission (Profit) = Loan Amount * (Total Rate / 100)
    // We use the same basis as the TotalProfitBreakdown logic.
    // However, user specifically asked about "comision" which is usually the Interest.
    let totalCommission = 0;
    if (loan.monto > 0) {
        totalCommission = loan.monto * (loan.porcentaje / 100);
    }
    
    // Check coverage
    // "si es igual tambien deberia de quitarse la alerta" -> Hide message if >=
    // "si no cumple el abono, el boton de confirmar debe estar desahabilitado"
    
    // Allow a small epsilon for float comparison errors if needed, but strict >= is usually fine for currency here 
    // provided we format consistent. Let's stick to simple >=.
    if (this.newPaymentAmount >= totalCommission) {
      this.isCommissionCovered = true;
      this.commissionCoverageMessage = ''; // Remove alert if covered
    } else {
      this.isCommissionCovered = false;
      // Format simply for the message
      const formattedCommission = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCommission);
      this.commissionCoverageMessage = `El abono NO cubre la comisión total (${formattedCommission}).`;
    }
  }

  // Removing unused dynamic calc method if present, or keeping empty if bound
  calculatePaymentDistribution() {
    this.checkCommissionCoverage();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedLoanForPayment = null;
    this.newPaymentNote = '';
    this.cdr.detectChanges();
  }

  // Calculate interest preview for toggle
  toggleInterest() {
    if (this.selectedLoanForPayment) {
        this.calculatedInterest = this.currentBalance * ((this.selectedLoanForPayment.porcentaje || 0) / 100);
    }
  }

  async submitPayment() {
    if (this.selectedLoanForPayment && this.newPaymentAmount > 0) {
      try {
        const loan = this.selectedLoanForPayment;
        const currentBal = this.currentBalance;
        let interestToAdd = 0;

        // Apply Interest if Toggle is Checked
        if (this.generateInterest) {
            interestToAdd = currentBal * ((loan.porcentaje || 0) / 100);
            
            // Update Loan Total
            const newTotal = loan.total + interestToAdd;
            const updatedLoanForTotal: Loan = { ...loan, total: newTotal };
            await this.dataService.updateLoan(updatedLoanForTotal);
            this.selectedLoanForPayment = updatedLoanForTotal;
        }
        
        // 3. Add Payment
        const newBalance = (currentBal + interestToAdd) - this.newPaymentAmount;

        const payment: Payment = {
          loan_id: loan.id!,
          monto: this.newPaymentAmount,
          fecha: new Date().toLocaleDateString('es-ES'),
          saldoAnterior: currentBal,
          interes: interestToAdd,
          saldoNuevo: newBalance,
          nota: this.newPaymentNote || undefined
        };
        await this.dataService.addPayment(loan.id!, payment);

        // Check if fully paid (using new total logic)
        if (newBalance <= 0.01) { 
             const completedLoan: Loan = { ...this.selectedLoanForPayment, status: 'pagado' };
             await this.dataService.updateLoan(completedLoan);
        }

        if (this.selectedClient) await this.selectClient(this.selectedClient);
        this.closePaymentModal();
      } catch (e) {
        console.error(e);
      } finally {
        this.cdr.detectChanges();
      }
    }
  }

  // LOGICA: HISTORIAL
  async openHistoryModal(loan: Loan) {
    this.selectedLoanForHistory = loan;
    this.paymentHistory = await this.dataService.getPayments(loan.id!);
    this.showHistoryModal = true;
    this.cdr.detectChanges();
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
    this.selectedLoanForHistory = null;
    this.paymentHistory = [];
    this.cdr.detectChanges();
  }

  async deletePayment(payment: Payment) {
    if (confirm('¿Eliminar este abono?')) {
      try {
        await this.dataService.deletePayment(payment.id!);
        if (this.selectedLoanForHistory) {
          this.paymentHistory = await this.dataService.getPayments(this.selectedLoanForHistory.id!);
          if (this.selectedClient) await this.selectClient(this.selectedClient);
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.cdr.detectChanges();
      }
    }
  }
}
