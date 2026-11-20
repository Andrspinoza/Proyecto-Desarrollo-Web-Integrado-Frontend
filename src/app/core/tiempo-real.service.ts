import { Injectable, signal } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { AvisoMatch, MensajeApi } from './api.models';

@Injectable({ providedIn: 'root' })
export class TiempoReal {
  private cliente: Client | null = null;
  readonly mensajes = new Subject<MensajeApi>();
  readonly matches = new Subject<AvisoMatch>();
  readonly conectado = signal(false);

  conectar(token: string): void {
    if (this.cliente !== null) return;
    const protocolo = location.protocol === 'https:' ? 'wss' : 'ws';
    const cliente = new Client({
      brokerURL: `${protocolo}://${location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 6000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      onConnect: () => {
        this.conectado.set(true);
        cliente.subscribe('/user/queue/messages', (marco) => this.mensajes.next(JSON.parse(marco.body) as MensajeApi));
        cliente.subscribe('/user/queue/matches', (marco) => this.matches.next(JSON.parse(marco.body) as AvisoMatch));
      },
      onWebSocketClose: () => this.conectado.set(false),
    });
    this.cliente = cliente;
    cliente.activate();
  }

  desconectar(): void {
    const cliente = this.cliente;
    this.cliente = null;
    this.conectado.set(false);
    if (cliente !== null) void cliente.deactivate();
  }
}
