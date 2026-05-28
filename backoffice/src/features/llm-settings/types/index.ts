export type LLMProviderConfig = {
  id: number;
  provider: string;
  provider_display?: string;
  model_name: string;
  model_display?: string;
  is_active: boolean;
  temperature: number;
  max_tokens: number;
  credentials_configured: boolean;
  credentials_source: "db" | "env" | null;
  credentials: Record<
    string,
    {
      configured: boolean;
      source: "db" | "env" | null;
    }
  >;
};

export type LLMProviderConfigUpdatePayload = Partial<
  Pick<
    LLMProviderConfig,
    "provider" | "model_name" | "is_active" | "temperature" | "max_tokens"
  >
> & {
  api_key?: string | null;
  openrouter_api_key?: string | null;
  gemini_api_key?: string | null;
};

export type TranslationLog = {
  id: number;
  provider: string;
  provider_display?: string;
  model_name: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  tokens_used: number | null;
  cost_estimate: string | null;
  success: boolean;
  error_message: string;
  created_at: string;
};
