import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Genero } from '../core/api.models';
import { Avatar } from './avatar';

export const LADO_FOTO = 512;

export function recorteCuadrado(ancho: number, alto: number): { x: number; y: number; lado: number } {
  const lado = Math.min(ancho, alto);
  return { x: Math.floor((ancho - lado) / 2), y: Math.floor((alto - lado) / 2), lado };
}

export function tipoPermitido(tipo: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(tipo);
}

async function reducir(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const { x, y, lado } = recorteCuadrado(imagen.width, imagen.height);
  const lienzo = document.createElement('canvas');
  lienzo.width = LADO_FOTO;
  lienzo.height = LADO_FOTO;
  const contexto = lienzo.getContext('2d');
  if (contexto === null) throw new Error('canvas');
  contexto.drawImage(imagen, x, y, lado, lado, 0, 0, LADO_FOTO, LADO_FOTO);
  return new Promise((resolver, rechazar) => {
    lienzo.toBlob((blob) => (blob ? resolver(blob) : rechazar(new Error('blob'))), 'image/jpeg', 0.85);
  });
}

@Component({
  selector: 'app-foto-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar],
  template: `
    <div class="flex flex-col sm:flex-row items-center gap-4">
      <span class="rounded-full ring-4 ring-brand-soft"><app-avatar [foto]="vista()" [genero]="genero()" [nombre]="nombre()" [tam]="tam()" /></span>
      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <label class="btn btn-primary cursor-pointer">
          <span class="icon">photo_camera</span> {{ vista() ? 'Cambiar foto' : 'Subir foto' }}
          <input type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" (change)="elegir($event)" />
        </label>
        @if (vista()) { <button type="button" class="btn btn-ghost" (click)="quitar()"><span class="icon">delete</span> Quitar foto</button> }
        @if (error()) { <p class="error-text m-0">{{ error() }}</p> }
        <p class="text-xs text-muted m-0">JPG, PNG o WebP. Se recorta en cuadrado.</p>
      </div>
    </div>
  `,
})
export class FotoSelector {
  readonly fotoActual = input<string | null>(null);
  readonly genero = input<Genero | null>(null);
  readonly nombre = input('tu foto');
  readonly tam = input(112);
  readonly elegida = output<Blob>();
  readonly quitada = output<void>();

  private readonly nueva = signal<string | null | undefined>(undefined);
  protected readonly error = signal('');
  protected readonly vista = computed<string | null>(() => {
    const elegida = this.nueva();
    return elegida === undefined ? this.fotoActual() : elegida;
  });

  protected async elegir(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    campo.value = '';
    if (!archivo) return;
    this.error.set('');
    if (!tipoPermitido(archivo.type)) {
      this.error.set('Elige una imagen JPG, PNG o WebP.');
      return;
    }
    try {
      const blob = await reducir(archivo);
      this.nueva.set(URL.createObjectURL(blob));
      this.elegida.emit(blob);
    } catch {
      this.error.set('No pudimos leer esa imagen. Prueba con otra.');
    }
  }

  protected quitar(): void {
    this.nueva.set(null);
    this.quitada.emit();
  }
}
