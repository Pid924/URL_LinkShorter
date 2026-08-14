import clsx from "clsx";

interface EnabledToggleProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export function EnabledToggle({ enabled, onChange, disabled }: EnabledToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "Disable link" : "Enable link"}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        enabled ? "bg-success" : "bg-ink-borderStrong"
      )}
    >
      <span
        className={clsx(
          "inline-block h-[18px] w-[18px] transform rounded-full bg-ink shadow transition-transform",
          enabled ? "translate-x-[22px]" : "translate-x-[4px]"
        )}
      />
    </button>
  );
}
