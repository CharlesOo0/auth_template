import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export interface PasswordPolicy {
  min_length: number;
  special_chars: string;
}

// Mirrors authentication/validators.py's defaults so the form has a
// sensible schema to validate against before GET /api/password-policy/
// resolves (and if it's ever unreachable). The backend is the actual
// source of truth - see authentication/views.py::PasswordPolicyView.
const FALLBACK_POLICY: PasswordPolicy = { min_length: 9, special_chars: "@$!%*?&" };

export function usePasswordPolicy(): PasswordPolicy {
  const { data } = useQuery({
    queryKey: ["password-policy"],
    queryFn: (): Promise<PasswordPolicy> => apiFetch("/password-policy/"),
    staleTime: Infinity,
  });
  return data ?? FALLBACK_POLICY;
}

// Escapes characters that are special inside a regex character class
// (`[...]`), so an arbitrary special_chars string from the backend can't
// break the generated pattern.
function escapeForCharClass(chars: string): string {
  return chars.replace(/[\\\]^-]/g, "\\$&");
}

export function specialCharsPattern(policy: PasswordPolicy): RegExp {
  return new RegExp(`[${escapeForCharClass(policy.special_chars)}]`);
}
