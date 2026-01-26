/// <reference types="google.maps" />
/**
 * Google Maps loader utility for the backoffice.
 */
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { envConfig } from "@/lib/config/env";
let mapsPromise = null;
let optionsSet = false;
export function loadGoogleMaps() {
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
    mapsPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("places"),
    ]).then(() => google);
  }
  return mapsPromise;
}
