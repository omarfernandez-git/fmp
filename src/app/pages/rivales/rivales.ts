import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { ChartComponent, C } from '../../shared/chart';
import { GpComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-rivales',
  imports: [RouterLink, TableModule, TagModule, ChartComponent, GpComponent, StateComponent],
  templateUrl: './rivales.html',
})
export class RivalesPage {
  cid = input.required<string>();
  api = inject(ApiService); Math = Math;
  d = signal<any>(null); loading = signal(true); error = signal<string | null>(null); abierto = signal<number | null>(null);
  constructor() { effect(() => { this.cid(); this.load(); }); }
  async load() { this.loading.set(true); try { this.d.set(await this.api.get(`/rivales/${this.cid()}`)); } catch (e: any) { this.error.set(e?.error?.error || 'Error'); } finally { this.loading.set(false); } }
  short(n: string) { const w = n.split(' '), part = (x: string) => ['de', 'del', 'la', 'las', 'los', 'san'].includes((x || '').toLowerCase()); if (w.length <= 2) return n; if (part(w[1])) return w[0] + ' ' + w.slice(1, part(w[2]) ? 4 : 3).join(' '); if (w.length >= 4 && !part(w[2]) && !part(w[3])) return w[0] + ' ' + w[2]; return w[0] + ' ' + w[1]; }
  teamShort(n: string) { return n.length > 26 ? n.slice(0, 24) + '…' : n; }
  /** Rango de Elo (mín–máx) y Elo medio de los 8 mejores de cada equipo, con el nuestro incluido */
  equipos = computed(() => { const d = this.d(); if (!d) return []; const all = [{ nombre: d.propio.nombre, r: d.propio.elo_resumen, propio: true }, ...d.rivales.map((x: any) => ({ nombre: x.nombre, r: x.elo_resumen, propio: false }))];
    return all.filter(x => x.r.medio).sort((a, b) => b.r.medio - a.r.medio); });
  rangoChart = computed(() => { const e = this.equipos(); return { labels: e.map(x => this.teamShort(x.nombre)), datasets: [
    { type: 'bar', label: 'Rango de Elo (mín–máx de la plantilla)', data: e.map(x => [x.r.min, x.r.max]), backgroundColor: e.map(x => x.propio ? 'rgba(79,207,192,.45)' : 'rgba(148,163,184,.28)'), borderColor: e.map(x => x.propio ? C.ball : C.grey), borderWidth: 1, borderRadius: 4, borderSkipped: false, barPercentage: .55, order: 2 },
    { type: 'line', label: 'Elo medio de los 8 mejores', data: e.map(x => ({ x: x.r.medio, y: this.teamShort(x.nombre) })), showLine: false, pointRadius: 6, pointHoverRadius: 7, pointStyle: 'rectRot', borderColor: C.ink, backgroundColor: C.ink, order: 1 }] }; });
  rangoOpts = { indexAxis: 'y' as const, plugins: { legend: { position: 'bottom' as const } }, scales: { x: { min: 750 } } };
  evolChart = computed(() => { const top = (this.d()?.elo_grupo || []).filter((x: any) => x.pj >= 6).slice(0, 8); const n = Math.max(...top.map((x: any) => x.hist.length), 1);
    return { labels: Array.from({ length: n }, (_, i) => i + 1), datasets: top.map((x: any, k: number) => ({ label: this.short(x.jugador) + ' · ' + this.teamShort(x.equipo), data: x.hist, borderColor: C.series[k % C.series.length], backgroundColor: 'transparent', tension: .25, pointRadius: 0, borderWidth: 2 })) }; });
  evolOpts = { plugins: { legend: { position: 'bottom' as const } }, interaction: { mode: 'index' as const, intersect: false }, scales: { x: { title: { display: true, text: 'partido nº' } } } };
  rivalEloChart(r: any) { const js = (r.elo_jugadores || []).slice(0, 14); return { labels: js.map((x: any) => this.short(x.jugador)), datasets: [{ label: 'Elo', data: js.map((x: any) => x.elo), backgroundColor: js.map((x: any) => x.elo >= 1000 ? C.ink : C.grey), borderRadius: 3 }] }; }
  rivalEloOpts = { indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { min: 800 } } };
  fuerzaChart = computed(() => { const r = this.d()?.rivales || []; return { labels: r.map((x: any) => x.nombre), datasets: [{ label: 'Suma de puntos de los 10 mejores', data: r.map((x: any) => x.ranking_top10), backgroundColor: C.s2, borderRadius: 4 }] }; });
  hayPuntos = computed(() => (this.d()?.rivales || []).some((x: any) => x.ranking_top10 > 0));
  eloChart = computed(() => { const r = (this.d()?.rivales || []).filter((x: any) => x.elo_medio).slice().sort((a: any, b: any) => b.elo_medio - a.elo_medio); return { labels: r.map((x: any) => x.nombre), datasets: [{ label: 'Elo medio (8 mejores)', data: r.map((x: any) => x.elo_medio), backgroundColor: C.s1, borderRadius: 4 }] }; });
  hOpts = { indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: false } } };
  topElo = computed(() => (this.d()?.elo_grupo || []).slice(0, 25));
}
