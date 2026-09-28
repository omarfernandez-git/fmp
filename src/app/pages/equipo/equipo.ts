import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ChartComponent, C } from '../../shared/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FormComponent, GpComponent, KpiComponent, PctComponent, SeasonStripComponent, SegComponent, StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-equipo',
  imports: [RouterLink, TableModule, TagModule, ChartComponent, FormComponent, GpComponent, KpiComponent, PctComponent, SeasonStripComponent, SegComponent, StateComponent],
  templateUrl: './equipo.html',
})
export class EquipoPage {
  api = inject(ApiService); route = inject(ActivatedRoute); router = inject(Router);
  E = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  cid = signal<number | null>(null);
  keys = Object.keys; entries = (o: any): [string, any][] => Object.entries(o || {});

  constructor() { this.route.queryParamMap.subscribe(q => { this.cid.set(q.get('cid') ? Number(q.get('cid')) : null); this.load(); }); }
  async load() {
    this.loading.set(true);
    try { this.E.set(await this.api.get('/equipo', { cid: this.cid() })); }
    catch (e: any) { this.error.set(e?.error?.error || 'Error cargando'); }
    finally { this.loading.set(false); }
  }
  temps = computed(() => Object.values(this.E()?.temporadas || {}) as any[]);
  segOpts = computed(() => [{ label: 'Todas', value: null }, ...this.temps().map(t => ({ label: t.temporada, value: t.id }))]);
  goCid(v: any) { this.router.navigate(['/equipo'], { queryParams: v ? { cid: v } : {} }); }
  tname = (id: any) => this.E()?.temporadas?.[id]?.temporada || id;
  seriesIds = computed(() => Object.keys(this.E()?.series || {}).map(Number).sort((a, b) => b - a));
  S = computed(() => this.E()?.encuentros); P = computed(() => this.E()?.partidos);

  // ---- gráficos ----
  mesChart = computed(() => { const m = this.S()?.por_mes || {}; const ks = Object.keys(m);
    return { labels: ks.map(k => k.slice(5) + ' ' + k.slice(2, 4)), datasets: [
      { label: 'Ganados', data: ks.map(k => m[k].pg), backgroundColor: C.win, borderRadius: 3, stack: 'a' },
      { label: 'Perdidos', data: ks.map(k => m[k].pj - m[k].pg), backgroundColor: C.loss, borderRadius: 3, stack: 'a' }] }; });
  marcChart = computed(() => { const m: [string, number][] = this.S()?.marcadores || [];
    return { labels: m.map(x => x[0]), datasets: [{ data: m.map(x => x[1]), backgroundColor: m.map(x => ({ '5-0': '#15803D', '4-1': '#22C55E', '3-2': '#86EFAC', '2-3': '#FCA5A5', '1-4': '#EF4444', '0-5': '#B91C1C' } as any)[x[0]] || C.grey), borderWidth: 2, borderColor: '#fff' }] }; });
  posChart = computed(() => { const p = this.P()?.por_posicion || {}; const ks = Object.keys(p);
    return { labels: ks.map(k => 'Pareja ' + k), datasets: [{ label: '% ganados', data: ks.map(k => p[k].pct), backgroundColor: C.s1, borderRadius: 4 }] }; });
  situChart = computed(() => { const P = this.P(); if (!P) return null; const items = [['En casa', P.casa], ['Fuera', P.fuera], ['A 3 sets', P.tres], ['Ganando 1er set', P.primer_g], ['Perdiendo 1er set', P.primer_p], ['Favoritos', P.favorito], ['No favoritos', P.underdog], ['Igualados', P.igualado]] as [string, any][];
    return { labels: items.map(i => i[0]), datasets: [{ label: '% ganados', data: items.map(i => i[1].pct), backgroundColor: items.map(i => i[1].pct >= 50 ? C.win : C.s1), borderRadius: 4 }] }; });
  nivelChart = computed(() => { const n = this.E()?.distribucion?.nivel_rival || {}; const ks = Object.keys(n);
    return { labels: ks, datasets: [{ label: '% ganados', data: ks.map(k => n[k].pct), backgroundColor: C.s1, borderRadius: 4 }, { label: 'partidos', data: ks.map(k => n[k].pj), backgroundColor: C.greySoft, borderRadius: 4, yAxisID: 'y2' }] }; });
  setsChart = computed(() => { const s = this.E()?.distribucion?.sets || {}; const ks = Object.keys(s).sort((a, b) => Number(a[0]) - Number(b[0]) || Number(a[2]) - Number(b[2]));
    return { labels: ks, datasets: [{ label: 'sets', data: ks.map(k => s[k]), backgroundColor: ks.map(k => Number(k[0]) > Number(k[2]) ? C.win : C.loss), borderRadius: 3 }] }; });
  difChart = computed(() => { const d = this.E()?.distribucion?.dif_juegos || {}; const ks = Object.keys(d).map(Number).sort((a, b) => a - b);
    return { labels: ks.map(k => (k > 0 ? '+' : '') + k), datasets: [{ label: 'partidos', data: ks.map(k => d[k]), backgroundColor: ks.map(k => k > 0 ? C.win : k < 0 ? C.loss : C.grey), borderRadius: 3 }] }; });
  acumChart = computed(() => { const s = this.E()?.series || {}; const ids = Object.keys(s).map(Number).sort();
    const maxJ = Math.max(...ids.map(i => s[i].length), 1);
    return { labels: Array.from({ length: maxJ }, (_, i) => 'J' + (i + 1)), datasets: ids.map((id, k) => ({ label: this.tname(id), data: s[id].map((e: any) => e.acum_pf - e.acum_pc), borderColor: C.series[k % C.series.length], backgroundColor: 'transparent', tension: .25, pointRadius: 2 })) }; });
  puntosChart = computed(() => { const pj = this.E()?.puntos_jornada || {}; const names = Object.keys(pj).sort((a, b) => pj[b].length - pj[a].length).slice(0, 8);
    const labels = Array.from(new Set(names.flatMap(n => pj[n].map((x: any) => x.fecha)))).sort();
    return { labels: labels.map(l => l.slice(2)), datasets: names.map((n, k) => { const m = new Map(pj[n].map((x: any) => [x.fecha, x.puntos]));
      return { label: n.split(' ').slice(0, 2).join(' '), data: labels.map(l => m.get(l) ?? null), borderColor: C.series[k % C.series.length], backgroundColor: 'transparent', spanGaps: true, tension: .2, pointRadius: 2 }; }) }; });
  partChart = computed(() => { const j = (this.E()?.jugadores || []).slice(0, 20);
    return { labels: j.map((x: any) => x.jugador.split(' ').slice(0, 2).join(' ')), datasets: [{ label: 'Ganados', data: j.map((x: any) => x.pg), backgroundColor: C.win, stack: 'a', borderRadius: 3 }, { label: 'Perdidos', data: j.map((x: any) => x.pj - x.pg), backgroundColor: C.lossSoft, stack: 'a', borderRadius: 3 }] }; });

  /** Nombre corto: 'Felipe Del Olmo Lopez' -> 'Felipe Del Olmo'; 'Roberto Ignacio Prieto Perez' -> 'Roberto Prieto'; 'Miguel Ruiberriz De Torres' -> 'Miguel Ruiberriz' */
  short(n: string) {
    const w = n.split(' '), part = (x: string) => ['de', 'del', 'la', 'las', 'los', 'san'].includes((x || '').toLowerCase());
    if (w.length <= 2) return n;
    if (part(w[1])) return w[0] + ' ' + w.slice(1, part(w[2]) ? 4 : 3).join(' ');
    if (w.length >= 4 && !part(w[2]) && !part(w[3])) return w[0] + ' ' + w[2];
    return w[0] + ' ' + w[1];
  }
  eloBarChart = computed(() => { const e = (this.E()?.elo || []).slice(0, 20);
    return { labels: e.map((x: any) => this.short(x.jugador)), datasets: [{ label: 'Elo actual', data: e.map((x: any) => x.elo), backgroundColor: e.map((x: any) => x.elo >= 1000 ? C.ink : C.grey), borderRadius: 4 },
      { label: 'Máximo alcanzado', data: e.map((x: any) => x.max), backgroundColor: C.greySoft, borderRadius: 4 }] }; });
  eloLineChart = computed(() => { const e = (this.E()?.elo || []).slice().sort((a: any, b: any) => b.pj - a.pj).slice(0, 8);
    const n = Math.max(...e.map((x: any) => x.hist.length), 1);
    return { labels: Array.from({ length: n }, (_, i) => i + 1), datasets: e.map((x: any, k: number) => ({ label: this.short(x.jugador), data: x.hist, borderColor: C.series[k % C.series.length], backgroundColor: 'transparent', tension: .25, pointRadius: 0, borderWidth: 2 })) }; });
  eloScatter = computed(() => { const e = this.E()?.elo || []; const pj = this.E()?.puntos_jornada || {};
    const pts = (n: string) => { const h = pj[n]; return h?.length ? h[h.length - 1].puntos : null; };
    const d = e.filter((x: any) => pts(x.jugador) !== null);
    return { datasets: [{ label: 'jugadores', data: d.map((x: any) => ({ x: pts(x.jugador), y: x.elo, r: 4 + Math.sqrt(x.pj) * 1.5, j: x.jugador })), backgroundColor: d.map((x: any) => x.elo >= 1000 ? C.winSoft : C.lossSoft), borderColor: d.map((x: any) => x.elo >= 1000 ? C.win : C.loss), borderWidth: 1.5 }] }; });
  eloBarOpts = { indexAxis: 'y' as const, plugins: { legend: { position: 'bottom' as const } }, scales: { x: { min: 800 } } };
  eloLineOpts = { plugins: { legend: { position: 'bottom' as const } }, interaction: { mode: 'index' as const, intersect: false }, scales: { x: { title: { display: true, text: 'partido nº' } } } };
  eloScatterOpts = { scales: { x: { title: { display: true, text: 'puntos FMP (último acta)' } }, y: { title: { display: true, text: 'Elo' } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.raw.j}: Elo ${c.raw.y}, ${c.raw.x} pts` } } } };
  pctOpts = { scales: { y: { min: 0, max: 100, ticks: { callback: (v: any) => v + '%' } } }, plugins: { legend: { display: false } } };
  pctOptsH = { indexAxis: 'y' as const, scales: { x: { min: 0, max: 100, ticks: { callback: (v: any) => v + '%' } } }, plugins: { legend: { display: false } } };
  nivelOpts = { scales: { y: { min: 0, max: 100, ticks: { callback: (v: any) => v + '%' } }, y2: { position: 'right' as const, grid: { display: false }, beginAtZero: true } }, plugins: { legend: { position: 'bottom' as const } } };
  stackOpts = { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' as const } } };
  stackOptsH = { indexAxis: 'y' as const, scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' as const } } };
  doughOpts = { cutout: '62%', plugins: { legend: { position: 'right' as const } } };
  lineOpts = { plugins: { legend: { position: 'bottom' as const } }, interaction: { mode: 'index' as const, intersect: false } };
  barOpts = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
}
