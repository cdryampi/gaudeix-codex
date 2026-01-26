import { MediaItem } from "../types";
export type MediaLink = {
  label: string;
  subtitle?: string;
};
type Props = {
  items: MediaItem[];
  onDelete: (item: MediaItem) => void;
  onRename: (item: MediaItem) => void;
  linkedMap?: Record<string, MediaLink[]>;
};
export declare function MediaTable({
  items,
  onDelete,
  onRename,
  linkedMap,
}: Props): import("react/jsx-runtime").JSX.Element;
export {};
