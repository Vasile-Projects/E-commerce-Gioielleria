import { PaymentMethod } from '../models/ui.models';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  carta:        'Carta di credito / debito',
  paypal:       'PayPal',
  contrassegno: 'Contrassegno',
  bonifico:     'Bonifico bancario',
};

export const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'carta',        label: PAYMENT_LABELS.carta        },
  { value: 'paypal',       label: PAYMENT_LABELS.paypal       },
  { value: 'contrassegno', label: PAYMENT_LABELS.contrassegno },
  { value: 'bonifico',     label: PAYMENT_LABELS.bonifico     },
];
