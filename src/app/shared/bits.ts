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
    .kpi{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;display:grid;gap:8px}
    .top{display:flex;justify-content:space-between;align-items:center}
    .l{font-size:13px;color:var(--ink-2)}
    .ic{width:34px;height:34px;border-radius:10px;background:var(--surface-2);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink-2);font-size:14px}
    .v{font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.1;display:flex;align-items:baseline;gap:6px;min-height:26px}
    .v.win{color:var(--win)} .v.loss{color:var(--loss)}
    .bottom{display:flex;justify-content:space-between;align-items:center;min-height:22px}
    .sub{font-size:12.5px;color:var(--ink-3)}
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

/** Tira de temporada: un bloque por encuentro, altura = margen del marcador. */
@Component({
  selector: 'app-season-strip',
  imports: [RouterLink],
  template: `
    <div class="strip" [class.dense]="encuentros().length > 30">
      @for (e of encuentros(); track e.encuentro_id ?? $index) {
        <a class="blk" [class.g]="e.gano" [routerLink]="e.encuentro_id ? ['/encuentro', e.encuentro_id] : null"
           [title]="'J' + e.jornada + ' · ' + (e.casa ? 'casa' : 'fuera') + ' · ' + e.rival + ' · ' + e.pf + '-' + e.pc">
          <i [style.height.%]="22 + 15 * (e.pf - e.pc) * (e.gano ? 1 : -1)"></i><span>{{ e.jornada }}</span>
        </a>
      }
    </div>`,
  styles: [`
    .strip{display:flex;gap:5px;align-items:flex-end;height:100px;padding-top:6px}
    .blk{flex:1 1 0;min-width:10px;max-width:40px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}
    .blk i{display:block;width:100%;border-radius:4px;background:var(--loss);opacity:.85}
    .blk.g i{background:var(--win)}
    .blk span{font-size:10.5px;color:var(--ink-3);font-variant-numeric:tabular-nums}
    .blk:hover i{opacity:1}
    .dense .blk span{display:none}
  `],
})
export class SeasonStripComponent { encuentros = input<any[]>([]); }

@Component({ selector: 'app-state', template: `@if (error()) {<div class="notice error">{{ error() }}</div>} @else if (loading()) {<div class="loading">Cargando…</div>}` })
export class StateComponent { loading = input(false); error = input<string | null>(null); }
