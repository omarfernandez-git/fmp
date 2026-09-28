import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  template: `
    <div class="wrap">
      <form class="box" (ngSubmit)="entrar()">
        <img class="logo" src="logo.png" alt="MV Padel Cercedilla Sport Center">
        <h1 style="text-align:center">MV Padel Cercedilla</h1>
        <p class="muted" style="text-align:center">Estadísticas y alineaciones de la liga FMP. Acceso solo para el equipo.</p>
        <label class="f">Email <input pInputText type="email" name="email" [(ngModel)]="email" autocomplete="username" required autofocus></label>
        <label class="f">Contraseña <p-password name="password" [(ngModel)]="password" [feedback]="false" [toggleMask]="true" autocomplete="current-password" [inputStyle]="{ width: '100%' }" styleClass="w-full" required /></label>
        @if (error()) {<p-message severity="error" [text]="error()!" />}
        <p-button type="submit" [label]="busy() ? 'Entrando…' : 'Entrar'" [disabled]="busy()" styleClass="w-full" />
      </form>
    </div>`,
  styles: [`
    .wrap{min-height:100vh;display:grid;place-items:center;background:var(--bg);padding:20px}
    .box{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:34px;width:100%;max-width:400px;display:grid;gap:14px}
    .logo{width:150px;height:150px;justify-self:center;margin-bottom:-10px}
    :host ::ng-deep .w-full, :host ::ng-deep .p-password{width:100%} :host ::ng-deep .p-password input{width:100%}
  `],
})
export class LoginPage {
  auth = inject(AuthService); router = inject(Router);
  email = ''; password = ''; error = signal<string | null>(null); busy = signal(false);
  async entrar() {
    this.busy.set(true); this.error.set(null);
    try { await this.auth.login(this.email, this.password); this.router.navigate(['/']); }
    catch (e: any) { this.error.set(e?.error?.error || 'No se ha podido iniciar sesión'); }
    finally { this.busy.set(false); }
  }
}
