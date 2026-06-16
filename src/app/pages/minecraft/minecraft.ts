import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ServerStatus {
  online: boolean;
  players?: { online: number; max: number };
  version?: string;
  motd?: string;
}

@Component({
  selector: 'app-minecraft',
  imports: [],
  templateUrl: './minecraft.html',
  styleUrl: './minecraft.scss',
})
export class Minecraft implements OnInit {
  status = signal<ServerStatus | null>(null);
  refreshing = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStatus();
  }

  fetchStatus() {
    this.refreshing.set(true);
    this.http.get<ServerStatus>('/api/minecraft/status').subscribe({
      next: (s) => { this.status.set(s); this.refreshing.set(false); },
      error: () => { this.status.set({ online: false }); this.refreshing.set(false); },
    });
  }
}
