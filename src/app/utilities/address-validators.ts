import { required, pattern, SchemaPath, SchemaPathRules } from '@angular/forms/signals';

type StringField = SchemaPath<string, SchemaPathRules.Supported>;

export function applyAddressValidators(fields: {
  street: StringField;
  civico: StringField;
  city: StringField;
  postalCode: StringField;
  province: StringField;
}): void {
  required(fields.street);
  required(fields.civico);
  required(fields.city);
  required(fields.postalCode);
  pattern(fields.postalCode, /^\d{5}$/);
  required(fields.province);
}