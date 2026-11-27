import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" [attr.aria-label]="titulo()">
      <button type="button" class="absolute inset-0 bg-black/55 border-0 cursor-default" aria-label="Cerrar" (click)="cerrar.emit()"></button>
      <div class="pop relative bg-surface w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div class="sticky top-0 z-10 bg-surface flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <h2 class="m-0 text-lg font-bold">{{ titulo() }}</h2>
          <button type="button" class="btn btn-ghost !min-h-9 !px-2" aria-label="Cerrar" (click)="cerrar.emit()"><span class="icon">close</span></button>
        </div>
        <div class="p-5"><ng-content /></div>
      </div>
    </div>
  `,
})
export class Modal {
  readonly titulo = input('');
  readonly cerrar = output<void>();

  @HostListener('document:keydown.escape')
  alEscape(): void {
    this.cerrar.emit();
  }
}
