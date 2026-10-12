export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "ml", label: "Malayalam" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
