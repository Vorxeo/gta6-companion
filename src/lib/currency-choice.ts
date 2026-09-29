import type { Currency } from "./pricing";
import type { Locale } from "./i18n";

const euroCountries = new Set(["AT","BE","CY","DE","EE","ES","FI","FR","GR","HR","IE","IT","LT","LU","LV","MT","NL","PT","SI","SK"]);
export function suggestedCurrency(country: string | null | undefined, locale: Locale): Currency {
  const region = country?.trim().toUpperCase();
  if (region === "BR") return "BRL";
  if (region === "US") return "USD";
  if (region && euroCountries.has(region)) return "EUR";
  return locale === "pt-BR" ? "BRL" : "EUR";
}
