import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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

export interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  imports: [FormRoot, FormField, Button],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  readonly serverError  = input<string | null>(null);
  readonly loading      = input<boolean>(false);
  readonly submitted    = output<LoginData>();
  readonly backToCart   = output<void>();
  readonly registerDirect = output<void>();

  readonly model = signal<LoginData>({ email: '', password: '' });

  readonly formTree = form(
    this.model,
    ({ email: emailField, password }) => {
      required(emailField);
      emailValidator(emailField);
      required(password);
      minLength(password, 8);
      pattern(password, /[A-Z]/);
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
