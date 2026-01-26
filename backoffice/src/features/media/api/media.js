import apiClient from "@/lib/api/client";
const IMAGE_ENDPOINT = "/media/images/";
const DOC_ENDPOINT = "/media/documents/";
function isImage(file) {
  return file.type.startsWith("image/");
}
export const mediaApi = {
  async listImages() {
    const res = await apiClient.get(IMAGE_ENDPOINT);
    return res.data.map((item) => ({
      ...item,
      type: "image",
    }));
  },
  async listDocuments() {
    const res = await apiClient.get(DOC_ENDPOINT);
    return res.data.map((item) => ({
      ...item,
      type: "document",
    }));
  },
  async upload(file) {
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
  async delete(type, id) {
    const endpoint = type === "image" ? IMAGE_ENDPOINT : DOC_ENDPOINT;
    await apiClient.delete(`${endpoint}${id}/`);
  },
  async rename(type, id, newName) {
    const endpoint = type === "image" ? IMAGE_ENDPOINT : DOC_ENDPOINT;
    const res = await apiClient.patch(`${endpoint}${id}/`, {
      original_name: newName,
    });
    return { ...res.data, type };
  },
};
