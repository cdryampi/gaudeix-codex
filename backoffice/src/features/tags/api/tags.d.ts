import { Tag, TagPayload, TagUpdatePayload } from "../types";
export declare const tagsApi: {
    list(params?: {
        search?: string;
        slug?: string;
    }): Promise<Tag[]>;
    create(payload: TagPayload): Promise<Tag>;
    update(id: number, payload: TagUpdatePayload): Promise<Tag>;
    remove(id: number): Promise<void>;
};
