const { getDefaultConfig } = require('@expo/metro-config');

// Use Expo's default Metro config to ensure assetRegistryPath and other
// Expo-specific resolver settings are correctly set. Then add SVG support.
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Treat SVGs as source files so they can be imported as React components
// and not as binary assets.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
