import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  userLocation: google.maps.LatLngLiteral | null;
  permissionStatus: PermissionState | "unknown";
  isLocating: boolean;

  // Actions
  setUserLocation: (location: google.maps.LatLngLiteral | null) => void;
  setPermissionStatus: (status: PermissionState) => void;
  checkPermission: () => Promise<void>;
  requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      userLocation: null,
      permissionStatus: "unknown",
      isLocating: false,

      setUserLocation: (location) => set({ userLocation: location }),

      setPermissionStatus: (status) => set({ permissionStatus: status }),

      checkPermission: async () => {
        if (!navigator.permissions) return;
        try {
          const result = await navigator.permissions.query({
            name: "geolocation" as PermissionName,
          });
          set({ permissionStatus: result.state });

          // Listen for changes
          result.onchange = () => {
            set({ permissionStatus: result.state });
            if (result.state === "denied") {
              set({ userLocation: null });
            }
          };
        } catch (err) {
          console.warn("Permissions API not supported for geolocation", err);
        }
      },

      requestLocation: async () => {
        set({ isLocating: true });
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            set({ isLocating: false });
            reject(new Error("Geolocation not supported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              set({
                userLocation: location,
                permissionStatus: "granted",
                isLocating: false,
              });
              resolve();
            },
            (error) => {
              set({ isLocating: false });
              if (error.code === error.PERMISSION_DENIED) {
                set({ permissionStatus: "denied", userLocation: null });
              }
              reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
          );
        });
      },
    }),
    {
      name: "gaudeix-location-storage",
      partialize: (state) => ({ userLocation: state.userLocation }), // Only persist coordinates
    },
  ),
);
