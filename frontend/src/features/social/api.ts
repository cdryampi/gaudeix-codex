
import { api } from "@/lib/api";
import type { SocialLink } from "./types";

export const listSocialLinks = async (): Promise<SocialLink[]> => {
    try {
        const response = await api.get<SocialLink[]>("/social-links/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch social links", error);
        // Fallback Mock Data as per pattern
        return [
            {
                id: 1,
                name: "Mock Instagram",
                url: "https://instagram.com",
                icon_class: "fa-brands fa-instagram",
                color: "#E1306C",
                order: 1,
                is_active: true
            },
            {
                id: 2,
                name: "Mock Facebook",
                url: "https://facebook.com",
                icon_class: "fa-brands fa-facebook",
                color: "#1877F2",
                order: 2,
                is_active: true
            }
        ];
    }
};
