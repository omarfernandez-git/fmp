import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

/** Tarjeta KPI: valor grande, etiqueta, icono y tag opcional. */
@Component({
  selector: 'app-kpi',
  imports: [TagModule],
  template: `
    <div class="kpi">
      <div class="top"><span class="l">{{ label() }}</span>@if (icon()) {<span class="ic"><i class="pi" [class]="'pi ' + icon()"></i></span>}</div>
      <div class="v" [class.win]="tone() === 'win'" [class.loss]="tone() === 'loss'">{{ value() }}<ng-content /></div>
      <div class="bottom"><span class="sub">{{ sub() }}</span>@if (tag()) {<p-tag [value]="tag()!" [severity]="tagSeverity()" [rounded]="true" />}</div>
    </div>`,
  styles: [`
    :host{display:block;height:100%}
    .kpi{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;display:grid;grid-template-rows:auto 1fr auto;gap:8px;height:100%;box-sizing:border-box}
    .top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;min-height:34px}
    .l{font-size:13px;color:var(--ink-2);line-height:1.3;flex:1;min-width:0;padding-top:2px}
    .ic{width:34px;height:34px;flex:0 0 auto;border-radius:10px;background:var(--surface-2);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink-2);font-size:14px}
    .v{font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.1;display:flex;align-items:baseline;gap:6px;min-height:26px}
    .v.win{color:var(--win)} .v.loss{color:var(--loss)}
    .bottom{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;min-height:22px}
    .sub{font-size:12.5px;color:var(--ink-3);line-height:1.3}
  `],
})
export class KpiComponent {
  label = input(''); value = input<any>(''); sub = input(''); icon = input<string | null>(null);
  tag = input<string | null>(null); tagSeverity = input<any>('secondary'); tone = input<'win' | 'loss' | null>(null);
}

/** Selector segmentado (p-selectbutton) con opciones {label, value}. */
@Component({
  selector: 'app-seg',
  imports: [SelectButtonModule, FormsModule],
  template: `<p-selectbutton [options]="options()" [ngModel]="value()" (ngModelChange)="change.emit($event)" optionLabel="label" optionValue="value" [allowEmpty]="false" size="small" />`,
})
export class SegComponent { options = input<{ label: string; value: any }[]>([]); value = input<any>(null); change = output<any>(); }

/** Barra de porcentaje: PG/PJ y % */
@Component({
  selector: 'app-pct',
  template: `@if (v() && v()!.pj) {<span class="bar" [title]="v()!.pg + ' de ' + v()!.pj"><span class="track"><i [class.win]="v()!.pct >= 50" [style.width.%]="v()!.pct"></i></span><b>{{ v()!.pct }}%</b></span> <span class="small muted">{{ v()!.pg }}/{{ v()!.pj }}</span>} @else {<span class="muted">–</span>}`,
})
export class PctComponent { v = input<{ pj: number; pg: number; pct: number } | null | undefined>(); }

/** Tira de forma G/P */
@Component({ selector: 'app-form', template: `<span class="form" [title]="forma()">@for (c of chars(); track $index) {<i [class.g]="c === 'G'" [class.p]="c === 'P'"></i>}</span>` })
export class FormComponent { forma = input(''); chars = computed(() => this.forma().split('')); }

/** Etiqueta ganado/perdido */
@Component({ selector: 'app-gp', imports: [TagModule], template: `<p-tag [value]="gano() ? 'Ganado' : 'Perdido'" [severity]="gano() ? 'success' : 'danger'" [rounded]="true" />` })
export class GpComponent { gano = input(false); }

/** Tira de temporada: un bloque por encuentro. Ganados hacia arriba (verde), perdidos hacia abajo (rojo); la altura es el margen. */
@Component({
  selector: 'app-season-strip',
  imports: [RouterLink],
  template: `
    <div class="strip" [class.dense]="encuentros().length > 30">
      @for (e of encuentros(); track e.encuentro_id ?? $index) {
        <a class="col" [routerLink]="e.encuentro_id ? ['/encuentro', e.encuentro_id] : null"
           [title]="'Jornada ' + e.jornada + ' · ' + (e.casa ? 'en casa' : 'fuera') + ' contra ' + e.rival + ' · ' + (e.gano ? 'ganado' : 'perdido') + ' ' + e.pf + '-' + e.pc">
          <div class="up">@if (e.gano) {<i class="g" [style.height.%]="alto(e)"><span>{{ e.pf }}-{{ e.pc }}</span></i>}</div>
          <div class="down">@if (!e.gano) {<i class="p" [style.height.%]="alto(e)"><span>{{ e.pf }}-{{ e.pc }}</span></i>}</div>
          <b>{{ e.jornada }}</b>
        </a>
      }
    </div>
    <div class="leyenda small muted"><span><i class="g"></i> ganado, hacia arriba</span><span><i class="p"></i> perdido, hacia abajo</span><span>Cuanto más largo el bloque, mayor la diferencia (5-0 es el máximo). Pulsa un bloque para abrir el acta.</span></div>`,
  styles: [`
    .strip{display:flex;gap:5px;align-items:stretch;height:150px;padding-top:4px}
    .col{flex:1 1 0;min-width:12px;max-width:44px;display:grid;grid-template-rows:1fr 1fr auto;text-decoration:none}
    .up,.down{position:relative}
    .up{border-bottom:2px solid var(--line)}
    .up i{position:absolute;left:0;right:0;bottom:0}
    .down i{position:absolute;left:0;right:0;top:0}
    i{display:flex;align-items:center;justify-content:center;border-radius:4px;opacity:.9}
    i.g{background:var(--win)} i.p{background:var(--loss)}
    i span{font-size:10px;font-weight:600;color:#fff;font-variant-numeric:tabular-nums;line-height:1}
    .col:hover i{opacity:1}
    .col b{font-size:10.5px;font-weight:500;color:var(--ink-3);text-align:center;padding-top:4px;font-variant-numeric:tabular-nums}
    .dense .col b, .dense i span{display:none}
    .leyenda{display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;align-items:center}
    .leyenda i{display:inline-block;width:10px;height:10px;border-radius:2px;vertical-align:-1px;margin-right:4px}
    @media (max-width:600px){.strip{height:120px} i span{display:none}}
  `],
})
export class SeasonStripComponent {
  encuentros = input<any[]>([]);
  /** margen 1..5 -> 30..100 % de la mitad disponible */
  alto(e: any) { const m = Math.abs((e.pf ?? 0) - (e.pc ?? 0)); return 30 + 70 * (Math.max(1, m) - 1) / 4; }
}

@Component({ selector: 'app-state', template: `@if (error()) {<div class="notice error">{{ error() }}</div>} @else if (loading()) {<div class="loading">Cargando…</div>}` })
export class StateComponent { loading = input(false); error = input<string | null>(null); }
