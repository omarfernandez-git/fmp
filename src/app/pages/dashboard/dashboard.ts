import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ChartComponent, C } from '../../shared/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { FormComponent, KpiComponent, PctComponent, SeasonStripComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-dashboard',
  imports: [LowerCasePipe, RouterLink, TableModule, TagModule, ButtonModule, ChartComponent, FormComponent, KpiComponent, PctComponent, SeasonStripComponent, StateComponent],
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  api = inject(ApiService);
  d = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  keys = Object.keys;

  constructor() { this.load(); }
  async load() {
    try { this.d.set(await this.api.get('/dashboard')); }
    catch (e: any) { this.error.set(e?.error?.error || 'No se han podido cargar los datos'); }
    finally { this.loading.set(false); }
  }
  pos = computed(() => { const d = this.d(); if (!d) return null; return d.clasificacion.find((c: any) => this.same(c.equipo, d.equipo.nombre)); });
  same(a: string, b: string) { const n = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s/g, ''); return n(a) === n(b); }
  /** temporada con encuentros para la tira: la actual o, si aún no ha empezado, la anterior */
  strip = computed(() => { const d = this.d(); if (!d) return { encs: [], t: null }; if (d.series.length) return { encs: d.series, t: d.temporada };
    const ids = Object.keys(d.series_todas).map(Number).sort((a, b) => b - a); const id = ids.find(i => d.series_todas[i].length);
    return { encs: id ? d.series_todas[id] : [], t: id ? d.historial.find((h: any) => h.id === id) : null }; });
  isMe = (e: any, nombre: string) => this.same(e, nombre);
  res = resultadoEnc;

  acumChart = computed(() => { const d = this.d(); if (!d) return null;
    const ids = Object.keys(d.series_todas).map(Number).sort();
    const maxJ = Math.max(...ids.map(i => d.series_todas[i].length), 1);
    return { labels: Array.from({ length: maxJ }, (_, i) => 'J' + (i + 1)),
      datasets: ids.map((id, k) => ({ label: d.historial.find((h: any) => h.id === id)?.temporada || String(id), data: d.series_todas[id].map((e: any) => e.acum_g),
        borderColor: id === d.temporada.id ? C.ink : C.series[(k + 1) % C.series.length], backgroundColor: 'transparent', borderWidth: id === d.temporada.id ? 3 : 2, tension: .25, pointRadius: 2 })) }; });
  posChart = computed(() => { const d = this.d(); if (!d) return null; const p = d.partidos.por_posicion; const ks = Object.keys(p);
    return { labels: ks.map(k => 'Pareja ' + k), datasets: [{ label: '% victorias', data: ks.map(k => p[k].pct), backgroundColor: ks.map(k => p[k].pct >= 50 ? C.win : C.s2), borderRadius: 4 }] }; });
  pctOpts = { scales: { y: { min: 0, max: 100, ticks: { callback: (v: any) => v + '%' } } }, plugins: { legend: { display: false } } };
  lineOpts = { scales: { y: { beginAtZero: true, title: { display: true, text: 'victorias acumuladas' } } }, plugins: { legend: { position: 'bottom' as const } }, interaction: { mode: 'index' as const, intersect: false } };
}

export function resultadoEnc(e: any, eqId: number): boolean | null {
  if (e.res_local === null || e.res_local === undefined) return null;
  return e.local_id === eqId ? e.res_local > e.res_visitante : e.res_visitante > e.res_local;
}
