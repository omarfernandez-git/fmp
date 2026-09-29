import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { KpiComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, TableModule, TagModule, ButtonModule, InputTextModule, PasswordModule, CheckboxModule, MessageModule, ConfirmDialogModule, TooltipModule, KpiComponent, StateComponent],
  providers: [ConfirmationService],
  templateUrl: './admin.html',
  styles: [`
    .form{display:grid;grid-template-columns:1fr 1fr 1fr auto auto;gap:10px;align-items:end}
    label.f{display:grid;gap:6px;font-size:13px;color:var(--ink-2)}
    .cred{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 14px;border-radius:var(--radius-s);background:var(--ball-bg);border:1px solid #BFEDE6}
    .cred code{font-size:16px;font-weight:600;background:#fff;padding:4px 10px;border-radius:6px;border:1px solid var(--line)}
    .acciones{display:flex;gap:4px;flex-wrap:wrap}
    :host ::ng-deep .p-password, :host ::ng-deep .p-password input{width:100%}
    @media (max-width:900px){.form{grid-template-columns:1fr 1fr}}
  `],
})
export class AdminPage {
  api = inject(ApiService); auth = inject(AuthService); confirm = inject(ConfirmationService);
  usuarios = signal<any[]>([]);
  activos = computed(() => this.usuarios().filter(u => u.activo).length);
  admins = computed(() => this.usuarios().filter(u => u.admin).length);
  loading = signal(true); error = signal<string | null>(null);
  nuevo = { email: '', nombre: '', password: '', admin: false };
  cred = signal<{ email: string; password: string; generada: boolean } | null>(null);
  msg = signal(''); err = signal(false);

  constructor() { this.load(); }
  async load() { this.loading.set(true); try { this.usuarios.set(await this.api.get('/admin/usuarios')); } catch (e: any) { this.error.set(e?.error?.error || 'Error'); } finally { this.loading.set(false); } }
  flash(m: string, err = false) { this.msg.set(m); this.err.set(err); setTimeout(() => this.msg.set(''), 4000); }
  async crear() {
    try { const r: any = await this.api.post('/admin/usuarios', { ...this.nuevo, password: this.nuevo.password || null }); this.cred.set(r);
      this.nuevo = { email: '', nombre: '', password: '', admin: false }; this.flash('Usuario creado'); this.load(); }
    catch (e: any) { this.flash(e?.error?.error || 'No se ha podido crear', true); }
  }
  async cambiar(u: any, body: any, ok: string) {
    try { const r: any = await this.api.post(`/admin/usuarios/${encodeURIComponent(u.email)}`, body); if (r.password) this.cred.set({ email: u.email, password: r.password, generada: true }); this.flash(ok); this.load(); }
    catch (e: any) { this.flash(e?.error?.error || 'Error', true); }
  }
  resetear(u: any) { this.confirm.confirm({ header: 'Restablecer contraseña', message: `Se generará una contraseña nueva para ${u.email}. La actual dejará de valer.`, acceptLabel: 'Restablecer', rejectLabel: 'Cancelar', accept: () => this.cambiar(u, { reset_password: true }, 'Contraseña restablecida') }); }
  borrar(u: any) { this.confirm.confirm({ header: 'Borrar usuario', message: `¿Borrar a ${u.email}? No se puede deshacer.`, acceptLabel: 'Borrar', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
    accept: async () => { try { await this.api.delete(`/admin/usuarios/${encodeURIComponent(u.email)}`); this.flash('Usuario borrado'); this.load(); } catch (e: any) { this.flash(e?.error?.error || 'Error', true); } } }); }
  copiar(t: string) { try { navigator.clipboard.writeText(t); this.flash('Copiado al portapapeles'); } catch {} }
  esYo = (u: any) => u.email === this.auth.user()?.email;
}
