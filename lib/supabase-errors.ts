type SupabaseErrorLike = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

export function getSupabaseErrorMessage(
  error: SupabaseErrorLike | null | undefined,
  fallback: string,
  overrides: Partial<Record<string, string>> = {}
) {
  if (!error) return fallback;

  if (error.code && overrides[error.code]) {
    return overrides[error.code] as string;
  }

  if (error.code === "23505") {
    return overrides["23505"] || "This record already exists.";
  }

  if (error.code === "23503") {
    return overrides["23503"] || "The related record could not be found.";
  }

  if (error.code === "22P02") {
    return overrides["22P02"] || "One of the values is invalid.";
  }

  return error.message || fallback;
}

export function errorMessageIncludes(
  error: SupabaseErrorLike | null | undefined,
  text: string
) {
  const haystack = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return haystack.includes(text.toLowerCase());
}
