import { LLMProviderConfig, LLMProviderConfigUpdatePayload, TranslationLog } from "../types";
export declare const llmSettingsApi: {
    getConfig(): Promise<LLMProviderConfig>;
    updateConfig(id: number, payload: LLMProviderConfigUpdatePayload): Promise<LLMProviderConfig>;
    listLogs(params?: {
        provider?: string;
        success?: boolean;
        source_lang?: string;
        target_lang?: string;
    }): Promise<TranslationLog[]>;
};
