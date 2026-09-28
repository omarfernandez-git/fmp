import { Component, Input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js';

Chart.defaults.font.family = '"Inter", system-ui, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#94A3B8';
Chart.defaults.borderColor = '#EEF1F5';
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.tooltip.backgroundColor = '#0F172A';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

/** Paleta: escala de grises azulados para series neutras, verde/rojo para resultados. */
export const C = {
  s1: '#64748B', s2: '#94A3B8', s3: '#CBD5E1', s4: '#E2E8F0', ink: '#0F172A', ink2: '#475569',
  win: '#16A34A', winSoft: 'rgba(22,163,74,.22)', loss: '#DC2626', lossSoft: 'rgba(220,38,38,.22)',
  ball: '#CDE84A', ballDeep: '#9DB81C', grey: '#CBD5E1', greySoft: '#E2E8F0', accent: '#0F172A',
  series: ['#0F172A', '#64748B', '#94A3B8', '#CBD5E1', '#16A34A', '#2563EB', '#9DB81C', '#DC2626', '#7C3AED', '#EA580C'],
};

@Component({
  selector: 'app-chart',
  imports: [ChartModule],
  template: `<p-chart [type]="type" [data]="data" [options]="opts" [height]="height + 'px'" />`,
})
export class ChartComponent {
  @Input() type: any = 'bar';
  @Input() data: any = { datasets: [] };
  @Input() set options(o: any) { this.opts = { responsive: true, maintainAspectRatio: false, ...o }; }
  opts: any = { responsive: true, maintainAspectRatio: false };
  @Input() height = 240;
}
