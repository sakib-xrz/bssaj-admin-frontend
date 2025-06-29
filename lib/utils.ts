import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQueryString(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const isEmpty = Object.values(params).every(
    (value) => value === "" || value === null || value === undefined
  );

  if (isEmpty) {
    return "";
  }

  const queryString = Object.entries(params)
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_key, value]) => value !== "" && value !== null && value !== undefined
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&");

  return `?${queryString}`;
}

export function sanitizeParams<T extends Record<string, unknown>>(
  params: T
): Partial<T> {
  const sanitizedObj: Partial<T> = {};

  for (const key in params) {
    if (
      params[key] !== "" &&
      params[key] !== null &&
      params[key] !== undefined
    ) {
      sanitizedObj[key] = params[key];
    }
  }

  return sanitizedObj;
}
