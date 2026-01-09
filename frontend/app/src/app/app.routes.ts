import { Routes } from '@angular/router';
import { ClientRegistrationComponent } from './components/client-registration/client-registration.component';
import { LoanManagementComponent } from './components/loan-management/loan-management.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientRegistrationComponent },
  { path: 'loans', component: LoanManagementComponent }
];
