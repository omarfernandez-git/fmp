import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-cuenta',
  imports: [FormsModule, PasswordModule, ButtonModule, MessageModule],
  template: `
    <div class="page">
      <div class="page-head"><div><div class="eyebrow">Cuenta</div><h1>Tu acceso</h1><p class="sub">{{ auth.user()?.email }}</p></div></div>
      <form class="card" style="max-width:440px;display:grid;gap:14px" (ngSubmit)="cambiar()">
        <h2>Cambiar contraseña</h2>
        <label class="f">Contraseña actual <p-password name="a" [(ngModel)]="actual" [feedback]="false" [toggleMask]="true" autocomplete="current-password" /></label>
        <label class="f">Nueva contraseña (mínimo 8 caracteres) <p-password name="n" [(ngModel)]="nueva" [toggleMask]="true" autocomplete="new-password" promptLabel="Escribe una contraseña" weakLabel="Débil" mediumLabel="Media" strongLabel="Fuerte" /></label>
        @if (msg()) {<p-message [severity]="err() ? 'error' : 'success'" [text]="msg()" />}
        <div><p-button type="submit" label="Guardar nueva contraseña" /></div>
      </form>
    </div>`,
  styles: [`:host ::ng-deep .p-password, :host ::ng-deep .p-password input{width:100%}`],
})
export class CuentaPage {
  api = inject(ApiService); auth = inject(AuthService);
  actual = ''; nueva = ''; msg = signal(''); err = signal(false);
  async cambiar() {
    try { await this.api.post('/me/password', { actual: this.actual, nueva: this.nueva }); this.msg.set('Contraseña cambiada'); this.err.set(false); this.actual = this.nueva = ''; }
    catch (e: any) { this.msg.set(e?.error?.error || 'Error'); this.err.set(true); }
  }
}
