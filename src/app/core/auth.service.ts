import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API } from './api.service';

export interface User { email: string; nombre?: string; admin?: boolean; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'fmp.token';
  token = signal<string | null>(safeGet(this.KEY));
  user = signal<User | null>(null);
  logged = computed(() => !!this.token());

  constructor(private http: HttpClient) {}

  async login(email: string, password: string) {
    const r = await firstValueFrom(this.http.post<{ token: string; user: User }>(`${API}/auth/login`, { email, password }));
    this.token.set(r.token); this.user.set(r.user);
    safeSet(this.KEY, r.token);
  }
  async loadMe() {
    if (!this.token()) return null;
    try { const u = await firstValueFrom(this.http.get<User>(`${API}/me`)); this.user.set(u); return u; }
    catch { this.logout(); return null; }
  }
  logout() { this.token.set(null); this.user.set(null); safeSet(this.KEY, null); }
}
function safeGet(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k: string, v: string | null) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} }
