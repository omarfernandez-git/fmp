import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent {
  api = inject(ApiService); auth = inject(AuthService); router = inject(Router);
  temporadas = signal<any[]>([]);
  actual = computed(() => this.temporadas()[0]);
  refresh = signal<any>({ running: false, msg: '' });
  open = signal(false);

  constructor() { this.load(); this.auth.loadMe(); }
  async load() {
    const r = await this.api.get<any>('/temporadas');
    this.temporadas.set(r.temporadas); this.refresh.set(r.refresh);
  }
  async actualizar() {
    this.refresh.set(await this.api.post('/refresh'));
    const poll = setInterval(async () => {
      const s = await this.api.get<any>('/refresh'); this.refresh.set(s);
      if (!s.running) { clearInterval(poll); this.load(); }
    }, 4000);
  }
  salir() { this.auth.logout(); this.router.navigate(['/login']); }
}
