import { Component, input, output } from '@angular/core';

// Modal de confirmação feito só com as classes do Bootstrap (sem o JS dele),
// controlado pelo estado do componente que o usa.
@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class ConfirmModal {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly confirmClass = input('btn-primary');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected onEscape(): void {
    if (this.open() && !this.busy()) {
      this.cancelled.emit();
    }
  }
}
