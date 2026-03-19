import type { LanguageOption } from "@/lib/languages";

type LanguageSelectorProps = {
  id: string;
  label: string;
  value: string;
  options: LanguageOption[];
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
  disabled?: boolean;
};

export function LanguageSelector({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  hint,
  disabled = false
}: LanguageSelectorProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:bg-white/60"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="text-xs leading-5 text-[var(--muted)]">{hint}</p> : null}
    </label>
  );
}
