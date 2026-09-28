import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ChartComponent, C } from '../../shared/chart';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { FormComponent, SegComponent, StateComponent } from '../../shared/bits';

const COLS: [string, string, (j: any) => any][] = [
  ['jugador', 'Jugador', j => j.jugador], ['puntos_ult', 'Puntos', j => j.puntos_ult], ['elo', 'Elo', j => j.elo], ['pj', 'PJ', j => j.pj], ['pg', 'PG', j => j.pg], ['pct', '% G', j => j.pct],
  ['pct_sets', '% sets', j => j.pct_sets], ['pct_juegos', '% juegos', j => j.pct_juegos], ['dif', 'Dif. juegos', j => j.dif_juegos_media],
  ['casa', 'Casa', j => j.casa.pct], ['fuera', 'Fuera', j => j.fuera.pct], ['tres', '3 sets', j => j.tres.pct], ['p1g', '1er set G', j => j.primer_g.pct], ['p1p', '1er set P', j => j.primer_p.pct],
  ['fav', 'Favorito', j => j.favorito.pct], ['und', 'No fav.', j => j.underdog.pct], ['dec', 'En 3-2', j => j.decisivo.pct], ['tb', 'TB', j => j.tb_g - j.tb_p], ['racha', 'Racha', j => j.racha_mejor],
  ['forma', 'Forma', j => j.ultimos5], ['pos', 'Pos.', j => j.posicion_habitual], ['npar', 'Parejas', j => j.n_parejas],
];

@Component({
  selector: 'app-jugadores',
  imports: [RouterLink, TableModule, InputNumberModule, FormsModule, ChartComponent, FormComponent, SegComponent, StateComponent],
  templateUrl: './jugadores.html',
})
export class JugadoresPage {
  api = inject(ApiService); route = inject(ActivatedRoute); router = inject(Router);
  d = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  cid = signal<number | null>(null); temps = signal<any[]>([]);
  sort = signal<{ k: string; dir: 1 | -1 }>({ k: 'puntos_ult', dir: -1 });
  minPj = signal(1);
  cols = COLS;

  constructor() {
    this.api.get<any>('/temporadas').then(r => this.temps.set(r.temporadas));
    this.route.queryParamMap.subscribe(q => { this.cid.set(q.get('cid') ? Number(q.get('cid')) : null); this.load(); });
  }
  async load() { this.loading.set(true); try { this.d.set(await this.api.get('/jugadores', { cid: this.cid() })); } catch (e: any) { this.error.set(e?.error?.error || 'Error'); } finally { this.loading.set(false); } }
  setSort(k: string) { const s = this.sort(); this.sort.set({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : (k === 'jugador' ? 1 : -1) }); }
  rows = computed(() => { const d = this.d(); if (!d) return []; const { k, dir } = this.sort(); const f = COLS.find(c => c[0] === k)![2];
    return d.jugadores.filter((j: any) => j.pj >= this.minPj()).slice().sort((a: any, b: any) => { const x = f(a) ?? -Infinity, y = f(b) ?? -Infinity; return (x > y ? 1 : x < y ? -1 : 0) * dir; }); });
  segOpts = computed(() => [{ label: 'Todas', value: null }, ...this.temps().map(t => ({ label: t.temporada, value: t.id }))]);
  goCid(v: any) { this.router.navigate(['/jugadores'], { queryParams: v ? { cid: v } : {} }); }
  tname = (id: any) => this.temps().find(t => t.id === Number(id))?.temporada || id;

  scatter = computed(() => { const js = this.rows(); return { datasets: [{ label: 'jugadores', data: js.map((j: any) => ({ x: j.puntos_ult ?? 0, y: j.pct, r: 4 + Math.sqrt(j.pj) * 1.6, j: j.jugador })),
    backgroundColor: js.map((j: any) => j.pct >= 50 ? C.winSoft : C.lossSoft), borderColor: js.map((j: any) => j.pct >= 50 ? C.win : C.loss), borderWidth: 1.5 }] }; });
  scatterOpts = { scales: { x: { title: { display: true, text: 'puntos FMP (último acta)' } }, y: { title: { display: true, text: '% partidos ganados' }, min: 0, max: 100 } },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.raw.j}: ${c.raw.x} pts, ${c.raw.y}%` } } } };
  eloChart = computed(() => { const js = this.rows().filter((j: any) => j.elo).slice().sort((a: any, b: any) => b.elo - a.elo).slice(0, 20);
    return { labels: js.map((j: any) => j.jugador.split(' ').slice(0, 2).join(' ')), datasets: [{ label: 'Elo', data: js.map((j: any) => j.elo), backgroundColor: js.map((j: any) => j.elo >= 1000 ? C.ink : C.grey), borderRadius: 3 }] }; });
  eloOpts = { indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { min: 800 } } };
  parejasChart = computed(() => { const p = (this.d()?.parejas || []).filter((x: any) => x.pj >= 3).slice(0, 15);
    return { labels: p.map((x: any) => x.j1.split(' ')[0] + ' ' + x.j1.split(' ')[1] + ' / ' + x.j2.split(' ')[0] + ' ' + x.j2.split(' ')[1]), datasets: [{ label: 'Ganados', data: p.map((x: any) => x.pg), backgroundColor: C.win, stack: 'a', borderRadius: 3 }, { label: 'Perdidos', data: p.map((x: any) => x.pj - x.pg), backgroundColor: C.lossSoft, stack: 'a', borderRadius: 3 }] }; });
  stackOptsH = { indexAxis: 'y' as const, scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' as const } } };
}
