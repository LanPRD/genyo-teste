import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModal } from './confirm-modal';

@Component({
  imports: [ConfirmModal],
  template: `
    <app-confirm-modal
      [open]="open()"
      title="Excluir funcionário"
      [busy]="busy()"
      (confirmed)="confirmed.set(confirmed() + 1)"
      (cancelled)="cancelled.set(cancelled() + 1)"
    >
      <p>Conteúdo do modal</p>
    </app-confirm-modal>
  `,
})
class Host {
  readonly open = signal(false);
  readonly busy = signal(false);
  readonly confirmed = signal(0);
  readonly cancelled = signal(0);
}

describe('ConfirmModal', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    root = fixture.nativeElement as HTMLElement;
  });

  async function show(options: { busy?: boolean } = {}) {
    host.open.set(true);
    host.busy.set(options.busy ?? false);
    await fixture.whenStable();
  }

  function button(label: string) {
    return Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label),
    ) as HTMLButtonElement;
  }

  it('renders nothing while closed', async () => {
    await fixture.whenStable();

    expect(root.querySelector('.modal')).toBeNull();
  });

  it('renders the title and the projected content when open', async () => {
    await show();

    expect(root.querySelector('.modal-title')?.textContent).toContain('Excluir funcionário');
    expect(root.querySelector('.modal-body')?.textContent).toContain('Conteúdo do modal');
  });

  it('emits confirmed and cancelled from the buttons', async () => {
    await show();

    button('Confirmar').click();
    button('Cancelar').click();

    expect(host.confirmed()).toBe(1);
    expect(host.cancelled()).toBe(1);
  });

  it('emits cancelled when Escape is pressed while open', async () => {
    await show();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(host.cancelled()).toBe(1);
  });

  it('ignores Escape while closed', async () => {
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(host.cancelled()).toBe(0);
  });

  it('disables the buttons and ignores Escape while busy', async () => {
    await show({ busy: true });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(button('Confirmar').disabled).toBe(true);
    expect(button('Cancelar').disabled).toBe(true);
    expect(host.cancelled()).toBe(0);
  });
});
