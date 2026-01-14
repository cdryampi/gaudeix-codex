import apiClient from "@/lib/api/client";
const BASE_PATH = "/social-links/";
function withTranslations(payload) {
    const name = payload.name || "";
    const translations = {
        en: { name },
        es: { name },
        ca: { name },
        fr: { name },
    };
    return { ...payload, translations };
}
export const socialLinksApi = {
    async getAll() {
        const { data } = await apiClient.get(BASE_PATH);
        return data;
    },
    async create(payload) {
        const { data } = await apiClient.post(BASE_PATH, withTranslations(payload));
        return data;
    },
    async update(id, payload) {
        const { data } = await apiClient.put(`${BASE_PATH}${id}/`, withTranslations(payload));
        return data;
    },
    async delete(id) {
        await apiClient.delete(`${BASE_PATH}${id}/`);
    },
};
