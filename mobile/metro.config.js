const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Optimization: Hermes is default in Expo 54, but we can tune serializer for bundle size
config.serializer = {
  ...config.serializer,
  // Custom serializer options if needed
};

// Enable CSS for NativeWind v4
module.exports = withNativeWind(config, { input: './global.css' });
