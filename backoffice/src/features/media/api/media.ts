import apiClient from "@/lib/api/client";
import { MediaItem, MediaType } from "../types";

const IMAGE_ENDPOINT = "/media/images/";
const DOC_ENDPOINT = "/media/documents/";
const VIDEO_ENDPOINT = "/media/videos/";

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

export const mediaApi = {
  async listImages(): Promise<MediaItem[]> {
    const res = await apiClient.get<MediaItem[]>(IMAGE_ENDPOINT);
    return res.data.map((item) => ({
      ...item,
      type: "image",
    }));
  },
  async listDocuments(): Promise<MediaItem[]> {
    const res = await apiClient.get<MediaItem[]>(DOC_ENDPOINT);
    return res.data.map((item) => ({
      ...item,
      type: "document",
    }));
  },
  async listVideos(): Promise<MediaItem[]> {
    const res = await apiClient.get<MediaItem[]>(VIDEO_ENDPOINT);
    return res.data.map((item) => ({
      ...item,
      type: "video",
    }));
  },
  async upload(file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);

    let endpoint = DOC_ENDPOINT;
    let type: MediaType = "document";

    if (isImage(file)) {
      endpoint = IMAGE_ENDPOINT;
      type = "image";
    } else if (isVideo(file)) {
      endpoint = VIDEO_ENDPOINT;
      type = "video";
    }

    const res = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      ...res.data,
      type,
    };
  },
  async delete(type: MediaType, id: number): Promise<void> {
    let endpoint = DOC_ENDPOINT;
    if (type === "image") endpoint = IMAGE_ENDPOINT;
    if (type === "video") endpoint = VIDEO_ENDPOINT;

    await apiClient.delete(`${endpoint}${id}/`);
  },
  async rename(
    type: MediaType,
    id: number,
    newName: string,
  ): Promise<MediaItem> {
    let endpoint = DOC_ENDPOINT;
    if (type === "image") endpoint = IMAGE_ENDPOINT;
    if (type === "video") endpoint = VIDEO_ENDPOINT;

    const res = await apiClient.patch(`${endpoint}${id}/`, {
      original_name: newName,
    });
    return { ...res.data, type };
  },
};
