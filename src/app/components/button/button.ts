import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { VariantsType } from '../../types/variants';

const VARIANT_CLASS: Record<VariantsType, string> = {
  primary: 'btn-gj',
  outline: 'btn-gj-outline',
  ghost:   'btn-gj-ghost',
  soft:    'btn-gj-soft',
};

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  variant  = input<VariantsType>('primary');
  btnType  = input<'button' | 'submit' | 'reset'>('button');
  text     = input.required<string>();
  disabled = input<boolean>(false);
  loading  = input<boolean>(false);

  click$ = output<Event>();

  readonly variantClass = computed(() => VARIANT_CLASS[this.variant()]);
}
