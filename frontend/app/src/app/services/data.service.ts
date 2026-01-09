import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Client, Loan, Payment } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {
    console.log('DataService: Initialized');
  }

  async getClients(): Promise<Client[]> {
    try {
      const data = await firstValueFrom(this.http.get<Client[]>(`${this.apiUrl}/clients`));
      return data || [];
    } catch (e) {
      console.error('DataService: Error fetching clients', e);
      return [];
    }
  }

  async addClient(client: Client): Promise<any> {
    try {
      console.log('DataService: Adding client', client);
      return await firstValueFrom(this.http.post(`${this.apiUrl}/clients`, client));
    } catch (e) {
      console.error('DataService: Error adding client', e);
      throw e;
    }
  }

  async deleteClient(clientId: number): Promise<any> {
    try {
      console.log('DataService: Deleting client', clientId);
      return await firstValueFrom(this.http.delete(`${this.apiUrl}/clients/${clientId}`));
    } catch (e) {
      console.error('DataService: Error deleting client', e);
      throw e;
    }
  }

  async getLoans(clientId: number): Promise<Loan[]> {
    try {
      const data = await firstValueFrom(this.http.get<Loan[]>(`${this.apiUrl}/clients/${clientId}/loans`));
      return data || [];
    } catch (e) {
      console.error('DataService: Error fetching loans', e);
      return [];
    }
  }

  async addLoan(loan: Loan): Promise<any> {
    try {
      return await firstValueFrom(this.http.post(`${this.apiUrl}/loans`, loan));
    } catch (e) {
      console.error('DataService: Error adding loan', e);
      throw e;
    }
  }

  async deleteLoan(loanId: number): Promise<any> {
    try {
      return await firstValueFrom(this.http.delete(`${this.apiUrl}/loans/${loanId}`));
    } catch (e) {
      console.error('DataService: Error deleting loan', e);
      throw e;
    }
  }

  async getPayments(loanId: number): Promise<Payment[]> {
    try {
      const data = await firstValueFrom(this.http.get<Payment[]>(`${this.apiUrl}/loans/${loanId}/payments`));
      return data || [];
    } catch (e) {
      console.error('DataService: Error fetching payments', e);
      return [];
    }
  }

  async addPayment(loanId: number, payment: Payment): Promise<any> {
    try {
      return await firstValueFrom(this.http.post(`${this.apiUrl}/loans/${loanId}/payments`, payment));
    } catch (e) {
      console.error('DataService: Error adding payment', e);
      throw e;
    }
  }

  async deletePayment(paymentId: number): Promise<any> {
    try {
      return await firstValueFrom(this.http.delete(`${this.apiUrl}/payments/${paymentId}`));
    } catch (e) {
      console.error('DataService: Error deleting payment', e);
      throw e;
    }
  }
}
