import { Routes } from '@angular/router';
import { ClientRegistrationComponent } from './components/client-registration/client-registration.component';
import { LoanManagementComponent } from './components/loan-management/loan-management.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PartnersManagementComponent } from './components/partners-management/partners-management.component';
import { ProjectionComponent } from './components/projection/projection.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientRegistrationComponent, canActivate: [authGuard] },
  { path: 'loans', component: LoanManagementComponent, canActivate: [authGuard] },
  { path: 'partners', component: PartnersManagementComponent, canActivate: [authGuard] },
  { path: 'projection', component: ProjectionComponent, canActivate: [authGuard] }
];
