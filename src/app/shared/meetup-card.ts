import { Component, computed, input, output } from '@angular/core';
import { Meetup } from '../core/models';
import { formatearFecha, hayCupo } from './formato';

@Component({
  selector: 'app-meetup-card',
  templateUrl: './meetup-card.html',
})
export class MeetupCard {
  readonly meetup = input.required<Meetup>();
  readonly ocupado = input(false);
  readonly solicitar = output<Meetup>();
  readonly retirar = output<Meetup>();

  protected readonly fecha = computed(() => formatearFecha(this.meetup().fechaHora));
  protected readonly academico = computed(() => this.meetup().tipo === 'ACADEMICO');
  protected readonly estadoAccion = computed(() => {
    const m = this.meetup();
    if (m.estado === 'CANCELADO') {
      return 'cancelado';
    }
    if (m.esOrganizador) {
      return 'organizador';
    }
    if (m.miParticipacion === 'SOLICITADA') {
      return 'solicitada';
    }
    if (m.miParticipacion === 'CONFIRMADA') {
      return 'confirmada';
    }
    if (m.miParticipacion === 'RECHAZADA') {
      return 'rechazada';
    }
    return hayCupo(m) ? 'disponible' : 'lleno';
  });
}
