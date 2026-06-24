import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { form, FormRoot, FormField, submit } from '@angular/forms/signals';
import { Button } from '../button/button';
import { AddressData } from '../../models/ui.models';
import { applyAddressValidators } from '../../utilities/address-validators';

@Component({
  selector: 'app-address-form',
  imports: [FormRoot, FormField, Button],
  templateUrl: './address-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent {
  readonly loading   = input<boolean>(false);
  readonly submitted = output<AddressData>();
  readonly cancel    = output<void>();

  readonly model = signal<AddressData>({
    street: '',
    civico: '',
    city: '',
    postalCode: '',
    province: '',
  });

  readonly formTree = form(
    this.model,
    ({ street, civico, city, postalCode, province }) => {
      applyAddressValidators({ street, civico, city, postalCode, province });
    }
  );

  async onSubmit(): Promise<void> {
    await submit(this.formTree, async () => {
      this.submitted.emit(this.model());
      return null;
    });
  }
}
