import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import {
  form,
  required,
  minLength,
  pattern,
  email as emailValidator,
  FormRoot,
  FormField,
  submit,
  RequiredValidationError,
  EmailValidationError,
  MinLengthValidationError,
  PatternValidationError,
} from '@angular/forms/signals';
import { Button } from '../button/button';
import { RegisterData } from '../../models/ui.models';
import { applyAddressValidators } from '../../utilities/address-validators';

@Component({
  selector: 'app-register-form',
  imports: [FormRoot, FormField, Button],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  readonly pendingEmail       = input<string>('');
  readonly emailServerError   = input<string | null>(null);
  readonly generalServerError = input<string | null>(null);
  readonly loading            = input<boolean>(false);
  readonly submitted          = output<RegisterData>();
  readonly back               = output<void>();
  readonly hasAccount         = output<void>();

  readonly model = signal<RegisterData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    address: { street: '', civico: '', city: '', postalCode: '', province: '' },
  });

  constructor() {
    effect(() => {
      const email = this.pendingEmail();
      if (email) this.model.update(m => ({ ...m, email }));
    }, { allowSignalWrites: true });
  }

  readonly formTree = form(
    this.model,
    ({ email, firstName, lastName, password, address }) => {
      required(email);
      emailValidator(email);
      required(firstName);
      required(lastName);
      required(password);
      minLength(password, 8);
      pattern(password, /[A-Z]/);
      applyAddressValidators({
        street:     address.street,
        civico:     address.civico,
        city:       address.city,
        postalCode: address.postalCode,
        province:   address.province,
      });
    }
  );

  readonly emailRequired  = computed(() => this.formTree.email().errors().some(e => e instanceof RequiredValidationError));
  readonly emailFormat    = computed(() => this.formTree.email().errors().some(e => e instanceof EmailValidationError));
  readonly pwRequired     = computed(() => this.formTree.password().errors().some(e => e instanceof RequiredValidationError));
  readonly pwTooShort     = computed(() => this.formTree.password().errors().some(e => e instanceof MinLengthValidationError));
  readonly pwNoUppercase  = computed(() => this.formTree.password().errors().some(e => e instanceof PatternValidationError));

  async onSubmit(): Promise<void> {
    await submit(this.formTree, async () => {
      this.submitted.emit(this.model());
      return null;
    });
  }
}
