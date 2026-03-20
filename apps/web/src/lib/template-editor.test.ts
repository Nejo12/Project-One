import { describe, expect, it } from "vitest";
import {
  buildEditorPreviewContent,
  createEditorFieldValues,
  insertVariableToken,
} from "./template-editor";
import { TemplateView } from "./templates-contract";

const templateFixture: TemplateView = {
  id: "template_birthday_bloom",
  slug: "birthday-bloom",
  name: "Birthday Bloom",
  category: "BIRTHDAY",
  summary: "A floral portrait card with room for a warm birthday note.",
  description: "Built for milestone birthdays and intimate celebrations.",
  widthMm: 127,
  heightMm: 177,
  orientation: "PORTRAIT",
  previewLabel: "Birthday / Portrait",
  previewHeadline: "Send a birthday note that feels quietly personal.",
  previewMessage: "Soft florals, one hero photo, and a generous writing area.",
  accentHex: "#E38B6D",
  surfaceHex: "#F8EDE5",
  textHex: "#2F211D",
  isActive: true,
  createdAt: "2026-03-20T00:00:00.000Z",
  updatedAt: "2026-03-20T00:00:00.000Z",
  fields: [
    {
      key: "recipient_name",
      label: "Recipient name",
      kind: "TEXT",
      required: true,
      placeholder: "Amina",
      maxLength: 40,
      position: 1,
    },
    {
      key: "message_body",
      label: "Message",
      kind: "TEXTAREA",
      required: true,
      placeholder: "Write the birthday note here.",
      maxLength: 420,
      position: 2,
    },
    {
      key: "photo",
      label: "Photo",
      kind: "PHOTO",
      required: false,
      placeholder: null,
      maxLength: null,
      position: 3,
    },
  ],
};

describe("template-editor helpers", () => {
  it("creates empty field values for non-photo fields", () => {
    expect(createEditorFieldValues(templateFixture)).toEqual({
      recipient_name: "",
      message_body: "",
    });
  });

  it("appends variable tokens with spacing", () => {
    expect(insertVariableToken("Happy birthday", "{first_name}")).toBe(
      "Happy birthday {first_name}",
    );
  });

  it("builds preview content from entered values", () => {
    const preview = buildEditorPreviewContent(
      templateFixture,
      {
        recipient_name: "Amina",
        message_body: "Thinking of you today.",
      },
      true,
    );

    expect(preview.headline).toBe("Amina");
    expect(preview.message).toBe("Thinking of you today.");
    expect(preview.fieldSummaries).toContain("Photo: 1 image selected");
  });
});
