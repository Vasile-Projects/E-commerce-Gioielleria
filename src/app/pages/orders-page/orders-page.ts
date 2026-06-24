import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrderService } from '../../services/order.service';
import { NavigationService } from '../../services/navigation.service';
import { Button } from '../../components/button/button';
import { Order } from '../../models/ui.models';
import { formatOrderNumber } from '../../models/ui.models';
import { PAYMENT_LABELS } from '../../constants/payment-options';

@Component({
  selector: 'app-orders-page',
  imports: [Button, CurrencyPipe, DatePipe],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);
  private readonly navigation   = inject(NavigationService);

  readonly ordersResource = rxResource({
    stream: () => this.orderService.getOrders$(),
  });

  readonly formatOrderNumber = formatOrderNumber;
  readonly paymentLabels: Record<string, string> = PAYMENT_LABELS;

  getPaymentLabel(method: string): string {
    const label = this.paymentLabels[method];
    return label !== undefined ? label : method;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      bozza:           'bg-secondary',
      confermato:      'bg-info text-dark',
      in_preparazione: 'bg-warning text-dark',
      spedito:         'bg-primary',
      consegnato:      'bg-success',
      annullato:       'bg-danger',
    };
    return map[status] !== undefined ? map[status] : 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      bozza:           'Bozza',
      confermato:      'Confermato',
      in_preparazione: 'In preparazione',
      spedito:         'Spedito',
      consegnato:      'Consegnato',
      annullato:       'Annullato',
    };
    return map[status] !== undefined ? map[status] : status;
  }

  onGoToCatalog(): void {
    this.navigation.goToProducts();
  }
}
