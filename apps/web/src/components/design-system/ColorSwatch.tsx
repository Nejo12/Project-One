type ColorSwatchProps = {
  label: string;
  swatchClassName: string;
};

export function ColorSwatch({ label, swatchClassName }: ColorSwatchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-18 rounded-2xl border border-border ${swatchClassName}`} />
      <span className="text-xs text-foreground/60">{label}</span>
    </div>
  );
}
