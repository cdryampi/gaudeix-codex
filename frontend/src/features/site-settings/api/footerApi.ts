import { apiGet } from "@/lib/api";
import { FooterPublicPayload } from "../types";

export async function getFooterPublic(): Promise<FooterPublicPayload> {
  return apiGet<FooterPublicPayload>("/footer-settings/public/");
}
