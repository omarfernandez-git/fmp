import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ApiService } from '../../core/api.service';
import { KpiComponent, SegComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-alineacion',
  imports: [FormsModule, RouterLink, TableModule, TagModule, ButtonModule, SelectModule, InputTextModule, MessageModule, KpiComponent, SegComponent, StateComponent],
  templateUrl: './alineacion.html',
  styles: [`
    .pareja{display:grid;grid-template-columns:70px 1fr 1fr 80px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
    .pareja.t2{background:var(--ball-bg);margin:0 -20px;padding:10px 20px}
    .pareja .o{font-weight:600}.pareja .o small{display:block;color:var(--ink-3);font-weight:400}
    .disp{display:grid;grid-template-columns:minmax(140px,1fr) 48px auto minmax(90px,1fr);gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)}
    .disp input{min-width:0;width:100%}
    .disp app-seg{white-space:nowrap}
    .pareja{grid-template-columns:64px minmax(0,1fr) minmax(0,1fr) 60px}
    @media (max-width:640px){.disp{grid-template-columns:1fr 48px auto}.disp input{grid-column:1/-1}.pareja{grid-template-columns:64px 1fr 60px;row-gap:6px}.pareja p-select:nth-of-type(2){grid-column:2}.pareja .num{grid-column:3;grid-row:1}.pareja.t2{margin:0 -14px;padding:10px 14px}}
    :host ::ng-deep .p-select{width:100%}
    :host ::ng-deep .jornadas .p-button{min-width:34px;padding:4px 8px}
  `],
})
export class AlineacionPage {
  cid = input.required<string>(); jornada = input.required<string>();
  api = inject(ApiService); router = inject(Router);
  d = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  modo = signal('fuerza'); msg = signal('');
  modoOpts = [{ label: 'Por fuerza', value: 'fuerza' }, { label: 'Equilibrado', value: 'equilibrado' }, { label: 'Con química', value: 'quimica' }];
  dispOpts = [{ label: '?', value: null }, { label: 'Sí', value: true }, { label: 'No', value: false }];
  edicion: { orden: number; turno: number; jugador1: string; jugador2: string }[] = [];
  jugOpts = computed(() => (this.d()?.jugadores || []).map((j: any) => ({ label: `${j.jugador} (${j.puntos})`, value: j.jugador })));

  constructor() { effect(() => { this.cid(); this.jornada(); this.load(); }); }
  async load() {
    this.loading.set(true); this.error.set(null);
    try { const d: any = await this.api.get(`/alineacion/${this.cid()}/${this.jornada()}`, { modo: this.modo() }); this.d.set(d);
      const base = d.guardada.length ? d.guardada.map((g: any) => ({ orden: g.orden, turno: g.turno, jugador1: g.jugador1, jugador2: g.jugador2 })) : d.propuesta.map((p: any) => ({ orden: p.orden, turno: p.turno, jugador1: p.j1.jugador, jugador2: p.j2.jugador }));
      this.edicion = [1, 2, 3, 4, 5].map(o => base.find((b: any) => b.orden === o) || { orden: o, turno: o <= 3 ? 1 : 2, jugador1: '', jugador2: '' }); }
    catch (e: any) { this.error.set(e?.error?.error || 'Error'); }
    finally { this.loading.set(false); }
  }
  async cambiarModo(m: string) { this.modo.set(m); const d: any = await this.api.get(`/alineacion/${this.cid()}/${this.jornada()}`, { modo: m }); this.d.set(d); this.usarPropuesta(); }
  usarPropuesta() { const d = this.d(); this.edicion = [1, 2, 3, 4, 5].map(o => { const p = d.propuesta.find((x: any) => x.orden === o); return p ? { orden: o, turno: p.turno, jugador1: p.j1.jugador, jugador2: p.j2.jugador } : { orden: o, turno: o <= 3 ? 1 : 2, jugador1: '', jugador2: '' }; }); }
  async guardarDisp() { const items = this.d().jugadores.map((j: any) => ({ key: j.key, disponible: j.disponible, nota: j.nota })); await this.api.post(`/alineacion/${this.cid()}/${this.jornada()}/disponibilidad`, { items }); this.flash('Disponibilidad guardada'); await this.cambiarModo(this.modo()); }
  async guardarAli() { await this.api.post(`/alineacion/${this.cid()}/${this.jornada()}/guardar`, { parejas: this.edicion }); this.flash('Alineación guardada'); const d: any = await this.api.get(`/alineacion/${this.cid()}/${this.jornada()}`, { modo: this.modo() }); this.d.set(d); }
  flash(m: string) { this.msg.set(m); setTimeout(() => this.msg.set(''), 2500); }
  pts(nombre: string) { return this.d()?.jugadores.find((j: any) => j.jugador === nombre)?.puntos ?? 0; }
  suma(p: any) { return this.pts(p.jugador1) + this.pts(p.jugador2); }
  avisosEdicion = computed(() => { const e = this.edicion; const out: string[] = []; const t1 = e.slice(0, 3).map(p => this.suma(p)), t2 = e.slice(3).map(p => this.suma(p));
    const desc = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] >= v);
    if (!desc(t1)) out.push('Turno 1: las parejas deben ir de mayor a menor suma de puntos.'); if (!desc(t2)) out.push('Turno 2: las parejas deben ir de mayor a menor suma de puntos.');
    const names = e.flatMap(p => [p.jugador1, p.jugador2]).filter(Boolean); const dup = names.filter((n, i) => names.indexOf(n) !== i); if (dup.length) out.push('Jugador repetido: ' + [...new Set(dup)].join(', '));
    const nd = names.filter(n => this.d()?.jugadores.find((j: any) => j.jugador === n)?.disponible === false); if (nd.length) out.push('Marcado como no disponible: ' + nd.join(', '));
    return out; });
  disponibles = computed(() => (this.d()?.jugadores || []).filter((j: any) => j.disponible === true).length);
  tick = signal(0);
}
