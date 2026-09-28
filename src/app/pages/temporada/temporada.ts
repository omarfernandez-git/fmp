import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { ChartComponent, C } from '../../shared/chart';
import { KpiComponent, PctComponent, SegComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-temporada',
  imports: [RouterLink, TableModule, TagModule, ChartComponent, KpiComponent, PctComponent, SegComponent, StateComponent],
  templateUrl: './temporada.html',
})
export class TemporadaPage {
  cid = input.required<string>();
  api = inject(ApiService);
  d = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  temps = signal<any[]>([]); vista = signal<'propios' | 'todos'>('propios');
  vistaOpts = [{ label: 'Nuestros encuentros', value: 'propios' }, { label: 'Todo el grupo', value: 'todos' }];

  constructor() { this.api.get<any>('/temporadas').then(r => this.temps.set(r.temporadas)); effect(() => { this.cid(); this.load(); }); }
  async load() { this.loading.set(true); this.error.set(null); try { this.d.set(await this.api.get(`/temporada/${this.cid()}`)); } catch (e: any) { this.error.set(e?.error?.error || 'Error'); } finally { this.loading.set(false); } }
  isMe = (n: string) => { const d = this.d(); const f = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s/g, ''); return d && f(n) === f(d.equipo.nombre); };
  encs = computed(() => this.vista() === 'propios' ? this.d()?.encuentros || [] : this.d()?.todos_encuentros || []);
  resultado = (e: any) => { const d = this.d(); if (!d || e.res_local === null) return null; const casa = e.local_id === d.equipo.id, fuera = e.visitante_id === d.equipo.id; if (!casa && !fuera) return null; return casa ? e.res_local > e.res_visitante : e.res_visitante > e.res_local; };
  resumen = computed(() => { const es = this.d()?.encuentros || []; const j = es.filter((e: any) => e.res_local !== null); const g = j.filter((e: any) => this.resultado(e)).length; return { pj: j.length, pg: g, pp: j.length - g, pendientes: es.length - j.length }; });
  clasChart = computed(() => { const c = this.d()?.clasificacion || []; return { labels: c.map((x: any) => x.equipo.split(' ').slice(0, 3).join(' ')), datasets: [{ label: 'Sets ganados', data: c.map((x: any) => x.sg), backgroundColor: c.map((x: any) => this.isMe(x.equipo) ? C.ballDeep : C.s2), borderRadius: 3 }, { label: 'Sets perdidos', data: c.map((x: any) => -x.sp), backgroundColor: c.map((x: any) => this.isMe(x.equipo) ? C.ball : C.s4), borderRadius: 3 }] }; });
  clasOpts = { indexAxis: 'y' as const, scales: { x: { stacked: true, ticks: { callback: (v: any) => Math.abs(v) } }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' as const }, tooltip: { callbacks: { label: (c: any) => `${c.dataset.label}: ${Math.abs(c.raw)}` } } } };
}
