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
  api = inject(ApiService);
  d = signal<any>(null); loading = signal(true); error = signal<string | null>(null); abierto = signal<number | null>(null);
  constructor() { effect(() => { this.cid(); this.load(); }); }
  async load() { this.loading.set(true); try { this.d.set(await this.api.get(`/rivales/${this.cid()}`)); } catch (e: any) { this.error.set(e?.error?.error || 'Error'); } finally { this.loading.set(false); } }
  fuerzaChart = computed(() => { const r = this.d()?.rivales || []; return { labels: r.map((x: any) => x.nombre), datasets: [{ label: 'Suma de puntos de los 10 mejores', data: r.map((x: any) => x.ranking_top10), backgroundColor: C.s1, borderRadius: 4 }] }; });
  eloChart = computed(() => { const r = (this.d()?.rivales || []).filter((x: any) => x.elo_medio).slice().sort((a: any, b: any) => b.elo_medio - a.elo_medio); return { labels: r.map((x: any) => x.nombre), datasets: [{ label: 'Elo medio (8 mejores)', data: r.map((x: any) => x.elo_medio), backgroundColor: C.ballDeep, borderRadius: 4 }] }; });
  hOpts = { indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: false } } };
  topElo = computed(() => (this.d()?.elo_grupo || []).slice(0, 25));
}
