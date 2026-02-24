import { Event } from "../../events/types";
interface EventDetailContentProps {
    event: Event;
    isAuthenticated?: boolean;
    isFavoritePending?: boolean;
    isCheckinPending?: boolean;
    onFavorite?: () => void;
    onCheckin?: () => void;
    onShare?: () => void;
    onAddToCalendar?: () => void;
    isPreview?: boolean;
}
export declare function EventDetailContent({ event, isAuthenticated, isFavoritePending, isCheckinPending, onFavorite, onCheckin, onShare, onAddToCalendar, isPreview, }: EventDetailContentProps): import("react/jsx-runtime").JSX.Element;
export {};
