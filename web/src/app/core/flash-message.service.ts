import { Injectable } from '@angular/core';

export interface FlashMessage {
  type: 'success' | 'danger';
  text: string;
}

// Guarda uma mensagem para a próxima tela (por exemplo, "salvo com sucesso").
@Injectable({ providedIn: 'root' })
export class FlashMessageService {
  private message: FlashMessage | null = null;

  show(message: FlashMessage): void {
    this.message = message;
  }

  take(): FlashMessage | null {
    const message = this.message;
    this.message = null;

    return message;
  }
}
