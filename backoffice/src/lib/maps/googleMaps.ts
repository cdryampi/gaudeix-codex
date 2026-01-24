/// <reference types="google.maps" />
/**
 * Google Maps loader utility for the backoffice.
 */
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { envConfig } from "@/lib/config/env";

let mapsPromise: Promise<typeof google | null> | null = null;
let optionsSet = false;

export function loadGoogleMaps(): Promise<typeof google | null> {
  if (!envConfig.googleMapsApiKey) {
    return Promise.resolve(null);
  }

  if (!optionsSet) {
    setOptions({
      key: envConfig.googleMapsApiKey,
      libraries: ["places"],
    });
    optionsSet = true;
  }

  if (!mapsPromise) {
    mapsPromise = Promise.all([importLibrary("maps"), importLibrary("places")]).then(
      () => google
    );
  }

  return mapsPromise;
}
