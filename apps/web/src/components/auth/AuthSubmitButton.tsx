type AuthSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  isPending: boolean;
};

export function AuthSubmitButton({ label, pendingLabel, isPending }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
