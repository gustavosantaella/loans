import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Client } from '../../models/interfaces';

@Component({
  selector: 'app-client-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-10 space-y-10 animate-in fade-in duration-700">
      <!-- Header with Toggle -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-slate-800 tracking-tight">Gestión de Clientes</h2>
          <p class="text-slate-500 mt-2 font-medium italic">Visualiza, busca y registra nuevos perfiles en el sistema.</p>
        </div>
        <button (click)="toggleForm()" 
                [class.bg-blue-600]="!showForm" [class.hover:bg-blue-700]="!showForm"
                [class.bg-slate-800]="showForm" [class.hover:bg-slate-900]="showForm"
                class="px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/10 text-white font-bold flex items-center gap-3 transition-all duration-300 leading-none active:scale-95">
          <svg *ngIf="!showForm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <svg *ngIf="showForm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ showForm ? 'Cerrar Registro' : 'Nuevo Cliente' }}
        </button>
      </div>

      <!-- Registration Form (Hidden by default) -->
      <div *ngIf="showForm" class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="relative z-10 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Personal</label>
              <input type="text" formControlName="nombre" 
                     placeholder="Ej. Juan"
                     class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 placeholder:text-slate-300 font-medium">
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Apellido Familiar</label>
              <input type="text" formControlName="apellido" 
                     placeholder="Ej. Pérez"
                     class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 placeholder:text-slate-300 font-medium">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Móvil</label>
              <input type="text" formControlName="telefono" 
                     placeholder="+1 234 567 890"
                     class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 placeholder:text-slate-300 font-medium font-mono text-sm">
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <input type="email" formControlName="correo" 
                     placeholder="juan.perez@ejemplo.com"
                     class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 placeholder:text-slate-300 font-medium">
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Notas Adicionales</label>
            <textarea formControlName="nota" rows="4" 
                      placeholder="Algún detalle importante sobre el cliente..."
                      class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 placeholder:text-slate-300 font-medium resize-none"></textarea>
          </div>

          <div class="pt-4 flex items-center justify-between gap-6">
            <button type="button" (click)="showForm = false" class="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-xs leading-none">
              Cancelar
            </button>
            <button type="submit" [disabled]="clientForm.invalid" 
                    class="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-5 px-12 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-40 disabled:grayscale">
              Registrar Cliente
            </button>
          </div>
        </form>
      </div>

      <!-- Clients List Table -->
      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <h4 class="text-xl font-black text-slate-800">Cartera de Clientes</h4>
        </div>
        
        <div class="overflow-x-auto">
          <table *ngIf="clients && clients.length > 0; else emptyState" class="w-full text-left">
            <thead class="bg-slate-50/50">
              <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th class="px-8 py-5">Nombre Completo</th>
                <th class="px-8 py-5">Información de Contacto</th>
                <th class="px-8 py-5">Estado Global</th>
                <th class="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let client of clients" class="group hover:bg-slate-50/80 transition-all duration-200">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                      {{ client.nombre ? client.nombre[0] : '?' }}{{ client.apellido ? client.apellido[0] : '?' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-800">{{ client.nombre }} {{ client.apellido }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #CLI-{{client.id}}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="text-sm font-bold text-slate-600">{{ client.telefono || 'Sin teléfono' }}</p>
                  <p class="text-xs text-slate-400 font-medium italic">{{ client.correo || 'Sin correo' }}</p>
                </td>
                <td class="px-8 py-6">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Verificado</span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="deleteClient(client)" class="p-2 text-slate-300 hover:text-rose-600 transition-colors" title="Eliminar Cliente">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyState>
            <div class="py-24 flex flex-col items-center justify-center text-slate-300 italic font-medium">
               No hay clientes registrados en el sistema o hubo un error al cargar.
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Toast Message -->
      <div *ngIf="message" class="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
        <div class="px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border"
             [ngClass]="messageType === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'">
          <svg *ngIf="messageType === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-bold text-sm tracking-wide">{{ message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClientRegistrationComponent implements OnInit {
  clientForm: FormGroup;
  clients: Client[] = [];
  showForm: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder, 
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {
    this.clientForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: [''],
      correo: ['', [Validators.email]],
      nota: ['']
    });
  }

  async ngOnInit() {
    console.log('Clients: Component Init');
    await this.loadClients();
  }

  async loadClients() {
    try {
      console.log('Clients: Fetching data...');
      this.clients = await this.dataService.getClients() || [];
      console.log('Clients: Data fetch complete', this.clients.length);
    } catch (error) {
      console.error('Clients: Data fetch failed', error);
      this.clients = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async onSubmit() {
    console.log('Clients: Form Submit Start', this.clientForm.value);
    if (this.clientForm.valid) {
      try {
        console.log('Clients: Sending request to service...');
        const res = await this.dataService.addClient(this.clientForm.value);
        console.log('Clients: Response received', res);
        
        this.message = '¡Cliente registrado con éxito!';
        this.messageType = 'success';
        this.showForm = false;
        this.clientForm.reset();
        await this.loadClients();
        
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      } catch (error) {
        console.error('Clients: Submit error', error);
        this.message = 'Error al registrar el cliente.';
        this.messageType = 'error';
      } finally {
        this.cdr.detectChanges();
      }
    } else {
      console.warn('Clients: Form invalid', this.clientForm.errors);
    }
  }

  async deleteClient(client: Client) {
    if (confirm(`¿Estás seguro de eliminar a ${client.nombre} ${client.apellido}? Se eliminarán todos sus préstamos y abonos.`)) {
      try {
        await this.dataService.deleteClient(client.id!);
        await this.loadClients();
        this.message = 'Cliente eliminado.';
        this.messageType = 'success';
        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 3000);
      } catch (error) {
        console.error('Clients: Delete error', error);
      } finally {
        this.cdr.detectChanges();
      }
    }
  }
}
