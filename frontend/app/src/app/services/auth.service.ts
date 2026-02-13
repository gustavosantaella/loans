import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private rememberKey = 'auth_remember';

  constructor(private http: HttpClient, private router: Router) {}

  private get storage(): Storage {
    return localStorage.getItem(this.rememberKey) === 'true' ? localStorage : sessionStorage;
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<any> {
    const result = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/login`, { email, password })
    );
    if (result.token) {
      // Always store the remember preference in localStorage
      if (rememberMe) {
        localStorage.setItem(this.rememberKey, 'true');
      } else {
        localStorage.removeItem(this.rememberKey);
      }

      // Store credentials in the chosen storage
      this.storage.setItem(this.tokenKey, result.token);
      this.storage.setItem(this.userKey, JSON.stringify(result.user));
    }
    return result;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.rememberKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    // Check both storages
    const token = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }
}
