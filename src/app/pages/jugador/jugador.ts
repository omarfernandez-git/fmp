import { Component, computed, inject, input, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ChartComponent, C } from '../../shared/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FormComponent, KpiComponent, PctComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-jugador',
  imports: [RouterLink, FormsModule, TableModule, TagModule, ButtonModule, InputNumberModule, InputTextModule, CheckboxModule, ChartComponent, FormComponent, KpiComponent, PctComponent, StateComponent],
  templateUrl: './jugador.html',
})
export class JugadorPage {
  key = input.required<string>();
  api = inject(ApiService);
  j = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  ajuste: { puntos_manual: number | null; activo: boolean; nota: string } = { puntos_manual: null, activo: true, nota: '' }; msg = signal('');
  entries = (o: any): [string, any][] => Object.entries(o || {});

  constructor() { effect(() => { this.key(); this.load(); }); }
  async load() {
    this.loading.set(true); this.error.set(null);
    try { const j: any = await this.api.get(`/jugador/${encodeURIComponent(this.key())}`); this.j.set(j);
      this.ajuste = { puntos_manual: j.ajuste?.puntos_manual ?? null, activo: (j.ajuste?.activo ?? 1) === 1, nota: j.ajuste?.nota || '' }; }
    catch (e: any) { this.error.set(e?.error?.error || 'Error'); }
    finally { this.loading.set(false); }
  }
  async guardar() { await this.api.post(`/jugador/${encodeURIComponent(this.key())}/ajuste`, { ...this.ajuste, activo: this.ajuste.activo ? 1 : 0 }); this.msg.set('Guardado'); setTimeout(() => this.msg.set(''), 2500); }
  tname = (id: any) => this.j()?.temporadas?.[id]?.temporada || id;
  situaciones = computed(() => { const j = this.j(); if (!j) return []; return [['En casa', j.casa], ['Fuera', j.fuera], ['A 2 sets', j.dos], ['A 3 sets', j.tres], ['Ganando el 1er set', j.primer_g], ['Perdiendo el 1er set', j.primer_p], ['Como favorito', j.favorito], ['Como no favorito', j.underdog], ['Igualado', j.igualado], ['En encuentros 3-2', j.decisivo]] as [string, any][]; });

  puntosChart = computed(() => { const h = this.j()?.puntos_hist || []; return { labels: h.map((x: any) => x.fecha.slice(2)), datasets: [{ label: 'Puntos FMP', data: h.map((x: any) => x.puntos), borderColor: C.s1, backgroundColor: C.greySoft, fill: true, tension: .25, pointRadius: 2.5 }] }; });
  eloChart = computed(() => { const h = this.j()?.elo_hist || []; return { labels: h.map((_: any, i: number) => i + 1), datasets: [{ label: 'Elo', data: h, borderColor: C.ballDeep, backgroundColor: 'transparent', tension: .25, pointRadius: 0 }] }; });
  situChart = computed(() => { const s = this.situaciones().filter(x => x[1].pj); return { labels: s.map(x => x[0]), datasets: [{ label: '% ganados', data: s.map(x => x[1].pct), backgroundColor: s.map(x => x[1].pct >= 50 ? C.win : C.s1), borderRadius: 4 }] }; });
  posChart = computed(() => { const p = this.j()?.por_posicion || {}; const ks = Object.keys(p); return { labels: ks.map(k => 'Pareja ' + k), datasets: [{ label: 'Ganados', data: ks.map(k => p[k].pg), backgroundColor: C.win, stack: 'a', borderRadius: 3 }, { label: 'Perdidos', data: ks.map(k => p[k].pj - p[k].pg), backgroundColor: C.lossSoft, stack: 'a', borderRadius: 3 }] }; });
  mesChart = computed(() => { const m = this.j()?.por_mes || {}; const ks = Object.keys(m); return { labels: ks.map(k => k.slice(5) + ' ' + k.slice(2, 4)), datasets: [{ label: 'Ganados', data: ks.map(k => m[k].pg), backgroundColor: C.win, stack: 'a', borderRadius: 3 }, { label: 'Perdidos', data: ks.map(k => m[k].pj - m[k].pg), backgroundColor: C.lossSoft, stack: 'a', borderRadius: 3 }] }; });
  parChart = computed(() => { const p = this.j()?.por_pareja || {}; const ks = Object.keys(p).slice(0, 12); return { labels: ks.map(k => k.split(' ').slice(0, 2).join(' ')), datasets: [{ label: 'Ganados', data: ks.map(k => p[k].pg), backgroundColor: C.win, stack: 'a', borderRadius: 3 }, { label: 'Perdidos', data: ks.map(k => p[k].pj - p[k].pg), backgroundColor: C.lossSoft, stack: 'a', borderRadius: 3 }] }; });

  pctOptsH = { indexAxis: 'y' as const, scales: { x: { min: 0, max: 100, ticks: { callback: (v: any) => v + '%' } } }, plugins: { legend: { display: false } } };
  stackOpts = { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { position: 'bottom' as const } } };
  stackOptsH = { indexAxis: 'y' as const, scales: { x: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' as const } } };
  lineOpts = { plugins: { legend: { display: false } } };
}
