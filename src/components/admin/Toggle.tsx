"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <label className="admin-toggle" style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="admin-toggle-track" />
      <span className="admin-toggle-thumb" />
      {label && <span className="sr-only">{label}</span>}
    </label>
  );
}
