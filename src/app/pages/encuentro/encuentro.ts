import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { StateComponent } from '../../shared/bits';

@Component({
  selector: 'app-encuentro',
  imports: [RouterLink, TagModule, StateComponent],
  template: `
    <div class="page">
      <app-state [loading]="loading()" [error]="error()" />
      @if (e(); as e) {
        <div class="page-head"><div><div class="eyebrow">Acta · jornada {{ e.jornada }} · {{ e.fecha }} · {{ e.tipo_turno }}</div>
          <h1><span [class.win-text]="e.res_local > e.res_visitante && e.propio_local" [class.loss-text]="e.res_local < e.res_visitante && e.propio_local">{{ e.local }}</span> <span class="muted">{{ e.res_local }} – {{ e.res_visitante }}</span> <span [class.win-text]="e.res_visitante > e.res_local && e.propio_visitante" [class.loss-text]="e.res_visitante < e.res_local && e.propio_visitante">{{ e.visitante }}</span></h1>
          <p class="sub">Se juega en {{ e.club_org }} · <a [href]="'https://www.fmpadel.com/ligas_detalleResultadoT3.aspx?idCategoria=' + e.categoria_id + '&idResultado=' + e.id" target="_blank" rel="noopener">ver en fmpadel.com <i class="pi pi-external-link" style="font-size:11px"></i></a></p></div>
          <a [routerLink]="['/alineacion', e.categoria_id, e.jornada]" class="p-button p-button-outlined p-button-sm">Alineación de esta jornada</a></div>
        @if (!e.partidos.length) {<div class="empty">El acta todavía no está publicada.</div>}
        <div class="stack">
          @for (p of e.partidos; track p.orden) {
            <div class="card partido" [class.turno2]="p.turno === 2">
              <div class="n"><b>Pareja {{ p.orden }}</b><span class="small muted">turno {{ p.turno }}</span></div>
              <div class="side" [class.w]="p.ganador === 'local'"><a [routerLink]="['/jugador', (p.local1 || '').toLowerCase()]">{{ p.local1 }}</a> <span class="muted small">{{ p.local1_pts }}</span><br><a [routerLink]="['/jugador', (p.local2 || '').toLowerCase()]">{{ p.local2 }}</a> <span class="muted small">{{ p.local2_pts }}</span><div class="sum">{{ p.pareja_local_pts }} pts</div></div>
              <div class="sets"><span [class.w]="p.s1l > p.s1v" [class.l]="p.s1l < p.s1v">{{ p.s1l }}-{{ p.s1v }}</span>@if (p.s2l !== null) {<span [class.w]="p.s2l > p.s2v" [class.l]="p.s2l < p.s2v">{{ p.s2l }}-{{ p.s2v }}</span>}@if (p.s3l !== null) {<span [class.w]="p.s3l > p.s3v" [class.l]="p.s3l < p.s3v">{{ p.s3l }}-{{ p.s3v }}</span>}</div>
              <div class="side r" [class.w]="p.ganador === 'visitante'"><a [routerLink]="['/jugador', (p.vis1 || '').toLowerCase()]">{{ p.vis1 }}</a> <span class="muted small">{{ p.vis1_pts }}</span><br><a [routerLink]="['/jugador', (p.vis2 || '').toLowerCase()]">{{ p.vis2 }}</a> <span class="muted small">{{ p.vis2_pts }}</span><div class="sum">{{ p.pareja_vis_pts }} pts</div></div>
            </div>
          }
        </div>
      }
    </div>`,
  styles: [`
    .partido{display:grid;grid-template-columns:110px 1fr auto 1fr;gap:16px;align-items:center;padding:14px 18px}
    .turno2{border-left:4px solid var(--ball)}
    .n{display:grid}
    .side{line-height:1.6}.side.r{text-align:right}.side.w a{font-weight:600}.side.w{position:relative}
    .side.w::before{content:"";position:absolute;left:-10px;top:8px;width:4px;height:calc(100% - 16px);border-radius:2px;background:var(--win)}
    .side.r.w::before{left:auto;right:-10px}
    .sum{font-size:12px;color:var(--ink-3)}
    .sets{display:flex;gap:6px}.sets span{padding:4px 8px;border-radius:6px;background:var(--surface-2);font-variant-numeric:tabular-nums;font-weight:600}
    .sets span.w{background:var(--win-bg);color:var(--win)}.sets span.l{background:var(--loss-bg);color:var(--loss)}
    @media (max-width:700px){.partido{grid-template-columns:1fr;gap:8px}.side.r{text-align:left}}
  `],
})
export class EncuentroPage {
  id = input.required<string>();
  api = inject(ApiService);
  e = signal<any>(null); loading = signal(true); error = signal<string | null>(null);
  constructor() { effect(() => { this.id(); this.load(); }); }
  async load() { this.loading.set(true); try { this.e.set(await this.api.get(`/encuentro/${this.id()}`)); } catch (e: any) { this.error.set(e?.error?.error || 'Error'); } finally { this.loading.set(false); } }
}
