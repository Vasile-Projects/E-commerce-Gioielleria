import { ChangeDetectionStrategy, Component, ElementRef, HostListener, effect, input, output, viewChild } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-confirm-modal',
  imports: [Button],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal {
  visible     = input.required<boolean>();
  title       = input.required<string>();
  message     = input.required<string>();
  confirmText    = input<string>('Conferma');
  cancelText     = input<string>('Annulla');
  confirmLoading = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  private cmCard = viewChild<ElementRef<HTMLElement>>('cmCard');

  constructor() {
    effect(() => {
      if (this.visible()) {
        queueMicrotask(() => this.cmCard()?.nativeElement.focus());
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.visible()) this.onCancel();
  }

  onCancel(): void  { this.cancelled.emit(); }
  onConfirm(): void { this.confirmed.emit(); }
}
