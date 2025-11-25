import apiClient from "@/lib/api/client";
import { MediaItem, MediaType } from "../types";

const IMAGE_ENDPOINT = "/media/images/";
const DOC_ENDPOINT = "/media/documents/";

function isImage(file: File) {
  return file.type.startsWith("image/");
}

export const mediaApi = {
  async listImages(): Promise<MediaItem[]> {
    const res = await apiClient.get(IMAGE_ENDPOINT);
    return (res.data as any[]).map((item) => ({
      ...item,
      type: "image",
    }));
  },
  async listDocuments(): Promise<MediaItem[]> {
    const res = await apiClient.get(DOC_ENDPOINT);
    return (res.data as any[]).map((item) => ({
      ...item,
      type: "document",
    }));
  },
  async upload(file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    const endpoint = isImage(file) ? IMAGE_ENDPOINT : DOC_ENDPOINT;
    const res = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      ...res.data,
      type: isImage(file) ? "image" : "document",
    };
  },
  async delete(type: MediaType, id: number): Promise<void> {
    const endpoint = type === "image" ? IMAGE_ENDPOINT : DOC_ENDPOINT;
    await apiClient.delete(`${endpoint}${id}/`);
  },
  async rename(type: MediaType, id: number, newName: string): Promise<MediaItem> {
    const endpoint = type === "image" ? IMAGE_ENDPOINT : DOC_ENDPOINT;
    const res = await apiClient.patch(`${endpoint}${id}/`, {
      original_name: newName,
    });
    return { ...res.data, type };
  },
};
