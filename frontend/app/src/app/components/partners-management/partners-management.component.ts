import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Partner } from '../../models/interfaces';

@Component({
  selector: 'app-partners-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row bg-[#f8fafc]">
      <!-- Sidebar de Socios -->
      <aside class="w-full md:w-[380px] bg-white border-r border-slate-200/60 flex flex-col shadow-2xl shadow-slate-100 z-10">
        <div class="p-8 pb-4">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-black text-slate-800 tracking-tight">Socios</h3>
            <span class="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              {{ partners ? partners.length : 0 }} Registrados
            </span>
          </div>
          <button (click)="resetForm()" 
                  class="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl shadow-purple-500/20 font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Socio
          </button>
        </div>

        <div class="flex-grow overflow-y-auto px-4 pb-8 mt-2 custom-scrollbar">
          <div class="space-y-2">
            <div *ngFor="let partner of partners" 
                 class="group relative p-5 rounded-3xl cursor-pointer transition-all duration-300 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-200/40"
                 [class.bg-purple-50]="selectedPartner?.id === partner.id"
                 [class.border-l-4]="selectedPartner?.id === partner.id"
                 [class.border-purple-500]="selectedPartner?.id === partner.id"
                 (click)="selectPartner(partner)">
              
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                {{ partner.nombre ? partner.nombre[0].toUpperCase() : '?' }}
              </div>

              <div class="flex-grow">
                <p class="font-bold text-slate-800">{{ partner.nombre }}</p>
                <p class="text-xs text-slate-400" *ngIf="partner.nota">{{ partner.nota }}</p>
              </div>

              <button (click)="deletePartner(partner, $event)" class="text-slate-300 hover:text-rose-500 transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-grow bg-slate-50/50 overflow-y-auto custom-scrollbar">
        <!-- DETAIL VIEW -->
        <div *ngIf="selectedPartner" class="p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full">Socio Inversionista</span>
              </div>
              <h2 class="text-4xl font-black text-slate-800 tracking-tighter">{{ selectedPartner.nombre }}</h2>
              <p class="text-slate-400 font-medium mt-2">{{ selectedPartner.nota || 'Sin observaciones adicionales' }}</p>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Total Invested -->
            <div class="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Capital Invertido</p>
              <p class="text-3xl font-black text-slate-800 mt-2 relative z-10">{{ stats.totalInvested | currency }}</p>
            </div>

            <!-- Expected Earnings -->
            <div class="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Ganancia Estimada</p>
              <p class="text-3xl font-black text-emerald-600 mt-2 relative z-10">{{ stats.totalEarnings | currency }}</p>
              <p class="text-xs text-emerald-400 font-bold mt-1 relative z-10">+{{ stats.roi | number:'1.0-1' }}% Retorno</p>
            </div>

            <!-- Active Loans Count -->
            <div class="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Préstamos Activos</p>
              <p class="text-3xl font-black text-purple-600 mt-2 relative z-10">{{ stats.activeLoans }}</p>
              <div class="flex gap-2 mt-2 relative z-10">
                 <span class="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg">{{ stats.pendingLoans }} Pendientes</span>
                 <span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg">{{ stats.paidLoans }} Pagados</span>
              </div>
            </div>
          </div>

          <!-- Loans Table -->
          <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-8 border-b border-slate-100 flex items-center justify-between">
              <h4 class="text-xl font-black text-slate-800">Historial de Inversiones</h4>
            </div>
            <div class="overflow-x-auto">
              <table *ngIf="partnerLoans.length > 0; else noLoans" class="w-full text-left">
                <thead class="bg-slate-50/50">
                  <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th class="px-8 py-5">Cliente / Ref.</th>
                    <th class="px-8 py-5">Fecha</th>
                    <th class="px-8 py-5 text-right">Inversión</th>
                    <th class="px-8 py-5 text-right">Tasas (Total / Socio)</th>
                    <th class="px-8 py-5 text-right">Ganancia</th>
                    <th class="px-8 py-5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr *ngFor="let loan of partnerLoans" class="group hover:bg-slate-50/80 transition-all duration-200">
                    <td class="px-8 py-6">
                      <p class="font-bold text-slate-700">{{ loan.clientName }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID #{{ loan.id }}</p>
                    </td>
                    <td class="px-8 py-6">
                      <p class="font-bold text-slate-600">{{ loan.fecha }}</p>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <span class="font-black text-slate-800">{{ loan.partnerCapital | currency }}</span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <div class="flex flex-col items-end">
                        <span class="text-xs font-bold text-slate-400">Total: {{ loan.porcentaje }}%</span>
                        <span class="font-black text-blue-600">Socio: {{ loan.partnerPercentage }}%</span>
                      </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                       <span class="font-black text-emerald-600">{{ calculateLoanRunningProfit(loan) | currency }}</span>
                    </td>
                    <td class="px-8 py-6 text-center">
                      <span class="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                            [ngClass]="loan.status === 'pagado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'">
                        {{ loan.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noLoans>
                <div class="py-24 flex flex-col items-center justify-center text-slate-300">
                  <p class="text-lg font-bold">No hay inversiones registradas para este socio</p>
                </div>
              </ng-template>
            </div>
          </div>

        </div>

        <!-- CREATE FORM VIEW (Default) -->
        <div *ngIf="!selectedPartner" class="h-full flex items-center justify-center p-6">
          <div class="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
              </div>
              <div>
                <h2 class="text-3xl font-black text-slate-800">Registrar Socio</h2>
                <p class="text-slate-400 font-medium">Añade un nuevo socio inversionista.</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input type="text" [(ngModel)]="newPartner.nombre" placeholder="Ej. Juan Pérez" 
                       class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all font-bold text-lg text-slate-700">
              </div>
              
              <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota / Observación</label>
                 <textarea [(ngModel)]="newPartner.nota" rows="3" placeholder="Información adicional..."
                           class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all font-medium text-slate-600 resize-none"></textarea>
              </div>

              <button (click)="addPartner()" 
                      [disabled]="!newPartner.nombre"
                      class="w-full py-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl shadow-xl shadow-purple-500/20 font-black tracking-wide transition-all active:scale-95 mt-4">
                GUARDAR SOCIO
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class PartnersManagementComponent implements OnInit {
  partners: Partner[] = [];
  selectedPartner: Partner | null = null;
  newPartner: Partner = { nombre: '', nota: '' };
  
  // Stats & Loans
  partnerLoans: any[] = [];
  stats = {
    totalInvested: 0,
    totalEarnings: 0,
    roi: 0,
    activeLoans: 0,
    pendingLoans: 0,
    paidLoans: 0
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadPartners();
  }

  async loadPartners() {
    try {
      this.partners = await this.dataService.getPartners();
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
    }
  }

  async addPartner() {
    if (this.newPartner.nombre.trim()) {
      try {
        await this.dataService.addPartner(this.newPartner);
        this.newPartner = { nombre: '', nota: '' };
        await this.loadPartners();
      } catch (e) {
        console.error(e);
      }
    }
  }

  async deletePartner(partner: Partner, event: Event) {
    event.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este socio?')) {
      try {
        await this.dataService.deletePartner(partner.id!);
        // If selected was deleted, reset
        if (this.selectedPartner?.id === partner.id) {
          this.resetForm();
        }
        await this.loadPartners();
      } catch (e) {
        console.error(e);
      }
    }
  }

  async selectPartner(partner: Partner) {
    this.selectedPartner = partner;
    await this.loadPartnerStats();
    this.cdr.detectChanges();
  }

  async loadPartnerStats() {
    if (!this.selectedPartner) return;
    
    try {
      this.partnerLoans = await this.dataService.getPartnerLoans(this.selectedPartner.id!);
      
      // Calculate Stats
      let invested = 0;
      let earnings = 0;
      let pending = 0;
      let paid = 0;

      for (const loan of this.partnerLoans) {
        const capital = loan.partnerCapital || 0;
        const profit = this.calculateLoanRunningProfit(loan);
        
        invested += capital;
        earnings += profit;

        if (loan.status === 'pagado') paid++;
        else pending++;
      }

      this.stats = {
        totalInvested: invested,
        totalEarnings: earnings,
        roi: invested > 0 ? (earnings / invested) * 100 : 0,
        activeLoans: this.partnerLoans.length,
        pendingLoans: pending,
        paidLoans: paid
      };

    } catch (e) {
      console.error(e);
      this.partnerLoans = [];
    }
  }

  resetForm() {
    this.selectedPartner = null;
    this.newPartner = { nombre: '', nota: '' };
    this.partnerLoans = [];
    this.cdr.detectChanges();
  }

  // Calculate profit specifically for the partner
  calculateLoanRunningProfit(loan: any): number {
    // Correct Formula based on User Request:
    // Profit = Partner Capital * (Partner Percentage / 100)
    // Example: 407.76 * 8% = 32.62
    const capital = loan.partnerCapital || 0;
    const rate = loan.partnerPercentage || 0;
    return capital * (rate / 100);
  }
}
