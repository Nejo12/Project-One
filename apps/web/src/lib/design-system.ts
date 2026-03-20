export const colorSwatches = [
  { label: "Ink", swatchClassName: "bg-foreground" },
  { label: "Paper", swatchClassName: "bg-surface-strong" },
  { label: "Accent", swatchClassName: "bg-accent" },
  { label: "Soft", swatchClassName: "bg-accent-soft" },
] as const;

export const foundationPrinciples = [
  {
    title: "Typography",
    body: "Strong hierarchy comes from scale, weight, and spacing before decorative styling.",
  },
  {
    title: "Spacing",
    body: "Panels, content blocks, and actions follow a restrained rhythm to keep pages readable.",
  },
  {
    title: "Composition",
    body: "Build from reusable surfaces and semantic tokens before extracting shared components.",
  },
] as const;

export const colorRules = [
  "Use semantic tokens instead of raw hex values in UI code.",
  "Prefer shared panel and action treatments over ad hoc utility stacks.",
  "Reserve the accent color for actions, emphasis, and active states.",
] as const;

export const tokenGroups = [
  "Color",
  "Typography",
  "Spacing",
  "Radius",
  "Shadow",
  "Surface treatment",
] as const;

export const componentRoadmap = [
  "Page shell",
  "Hero",
  "Feature cards",
  "Status strip",
  "Primary and secondary actions",
] as const;
