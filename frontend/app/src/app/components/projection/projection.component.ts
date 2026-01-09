import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-80px)] bg-[#f8fafc] p-10 flex flex-col items-center animate-in fade-in duration-700">
      
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-black text-slate-800 tracking-tight">Simulador de Proyección</h2>
        <p class="text-slate-500 mt-2 font-medium italic">Calcula la rentabilidad estimada de una inversión o préstamo.</p>
      </div>

      <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <!-- Calculator Form -->
        <div class="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 flex flex-col justify-center h-full">
           <div class="space-y-8">
             
             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Quantity Input -->
                <div class="space-y-3">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                   <input type="number" [(ngModel)]="quantity" (ngModelChange)="calculate()" placeholder="1"
                          class="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-black text-3xl text-slate-800 placeholder-slate-300 text-center">
                </div>

                <!-- Capital Input -->
                <div class="space-y-3 md:col-span-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capital (C/U)</label>
                   <div class="relative group">
                     <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                       <span class="text-slate-400 font-bold text-xl">$</span>
                     </div>
                     <input type="number" [(ngModel)]="capital" (ngModelChange)="calculate()" placeholder="0.00"
                            class="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-black text-3xl text-slate-800 placeholder-slate-300">
                   </div>
                </div>
             </div>

             <div class="grid grid-cols-2 gap-6">
                <!-- Rate Input -->
                <div class="space-y-3">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tasa Interés (%)</label>
                   <div class="relative group">
                     <input type="number" [(ngModel)]="rate" (ngModelChange)="calculate()" placeholder="0"
                            class="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-black text-3xl text-slate-800 placeholder-slate-300 text-center">
                     <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">%</span>
                   </div>
                   <p class="text-xs text-center font-bold text-slate-400 uppercase tracking-widest">Mensual</p>
                </div>

                <!-- Duration Input -->
                <div class="space-y-3">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duración</label>
                   <div class="relative group">
                     <input type="number" [(ngModel)]="months" (ngModelChange)="calculate()" placeholder="0"
                            class="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-black text-3xl text-slate-800 placeholder-slate-300 text-center">
                   </div>
                   <p class="text-xs text-center font-bold text-slate-400 uppercase tracking-widest">Meses</p>
                </div>
             </div>

           </div>
        </div>

        <!-- Results Display -->
        <div class="bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-600/30 p-10 flex flex-col justify-between text-white relative overflow-hidden">
           <!-- Decorative BG -->
           <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div class="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

           <div class="relative z-10 space-y-8">
              <div class="flex items-center gap-4">
                 <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                 </div>
                 <h3 class="text-2xl font-black tracking-tight">Proyección Neta</h3>
              </div>

              <!-- Breakdown -->
              <div class="space-y-4">
                 <div class="flex justify-between items-center text-blue-100/60 font-medium text-sm">
                    <span>Fórmula Base</span>
                    <span class="font-mono">C * % * T</span>
                 </div>
                 <div class="flex justify-between items-center text-xl font-bold">
                    <span class="opacity-80">Ganancia Mensual</span>
                    <span>{{ (capital * (rate/100)) | currency }}</span>
                 </div>
                 <div class="w-full h-px bg-white/10"></div>
                 <div class="space-y-1">
                    <p class="text-xs font-black uppercase tracking-widest opacity-60">Ganancia Total (Interés)</p>
                    <p class="text-4xl font-black tracking-tighter">{{ profit | currency }}</p>
                 </div>
              </div>
           </div>

           <div class="relative z-10 pt-8 border-t border-white/10 mt-auto">
              <p class="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Monto Total a Recibir</p>
              <div class="flex items-baseline gap-2">
                 <h2 class="text-6xl font-black tracking-tighter">{{ total | currency }}</h2>
                 <span class="text-lg font-medium opacity-60">Neto</span>
              </div>
           </div>

        </div>

      </div>
    </div>
  `
})
export class ProjectionComponent {
  capital: number = 0;
  quantity: number = 1;
  rate: number = 0;
  months: number = 0;

  profit: number = 0;
  total: number = 0;

  calculate() {
    const qty = this.quantity || 1;
    // Profit = (Capital * (Rate/100) * Months) * Qty
    this.profit = ((this.capital || 0) * ((this.rate || 0) / 100) * (this.months || 0)) * qty;
    
    // Total = (Capital * Qty) + Profit
    const totalCapital = (this.capital || 0) * qty;
    this.total = totalCapital + this.profit;
  }
}
