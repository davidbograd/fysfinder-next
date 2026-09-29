// Beregnerne lader altid visitoren trykke "Beregn". Mangler der noget, peger vi
// på de felter, der ikke er udfyldt, i stedet for at slå knappen fra.

export interface RequiredField<TKey extends string> {
  key: TKey;
  /** Feltets egen label, så beskeden matcher det, visitoren kigger på. */
  label: string;
  value: string;
  /** Sat på felter, der vælges frem for at udfyldes, fx køn. */
  choice?: boolean;
}

export type FieldErrors<TKey extends string> = Partial<Record<TKey, string>>;

export function findMissingFields<TKey extends string>(
  fields: RequiredField<TKey>[]
): FieldErrors<TKey> {
  const errors: FieldErrors<TKey> = {};

  for (const field of fields) {
    if (field.value.trim() !== "") continue;
    const verb = field.choice ? "Vælg" : "Udfyld";
    errors[field.key] = `${verb} ${field.label.toLowerCase()}`;
  }

  return errors;
}

export function hasFieldErrors<TKey extends string>(
  errors: FieldErrors<TKey>
): boolean {
  return Object.keys(errors).length > 0;
}
