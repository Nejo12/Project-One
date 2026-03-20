import { TemplateFieldView, TemplateView } from "@/lib/templates-contract";

export type TemplateEditorFieldValues = Record<string, string>;
export type TemplateEditorPhotoFit = "FIT" | "COVER";

export const templateVariableTokens = ["{first_name}", "{sender_name}", "{occasion}"] as const;

export function createEditorFieldValues(template: TemplateView): TemplateEditorFieldValues {
  return Object.fromEntries(
    template.fields.filter((field) => field.kind !== "PHOTO").map((field) => [field.key, ""]),
  );
}

export function insertVariableToken(currentValue: string, token: string): string {
  if (!currentValue.trim()) {
    return token;
  }

  return /\s$/.test(currentValue) ? `${currentValue}${token}` : `${currentValue} ${token}`;
}

type EditorPreviewContent = {
  headline: string;
  message: string;
  fieldSummaries: string[];
};

export function buildEditorPreviewContent(
  template: TemplateView,
  fieldValues: TemplateEditorFieldValues,
  hasPhoto: boolean,
): EditorPreviewContent {
  return {
    headline: getPreviewHeadline(template, fieldValues),
    message: getPreviewMessage(template, fieldValues),
    fieldSummaries: template.fields.map((field) =>
      buildFieldSummary(field, fieldValues[field.key] ?? "", hasPhoto),
    ),
  };
}

function getPreviewHeadline(
  template: TemplateView,
  fieldValues: TemplateEditorFieldValues,
): string {
  const firstTextField = template.fields.find((field) => field.kind === "TEXT");
  if (firstTextField) {
    const value = fieldValues[firstTextField.key]?.trim();
    if (value) {
      return value;
    }
  }

  return template.previewHeadline;
}

function getPreviewMessage(template: TemplateView, fieldValues: TemplateEditorFieldValues): string {
  const firstTextareaField = template.fields.find((field) => field.kind === "TEXTAREA");
  if (firstTextareaField) {
    const value = fieldValues[firstTextareaField.key]?.trim();
    if (value) {
      return value;
    }
  }

  return template.previewMessage;
}

function buildFieldSummary(field: TemplateFieldView, value: string, hasPhoto: boolean): string {
  if (field.kind === "PHOTO") {
    return hasPhoto ? `${field.label}: 1 image selected` : `${field.label}: waiting for upload`;
  }

  const trimmedValue = value.trim();
  if (trimmedValue) {
    return `${field.label}: ${trimmedValue}`;
  }

  return `${field.label}${field.required ? " (required)" : " (optional)"}`;
}
