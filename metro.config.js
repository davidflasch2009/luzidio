// Metro-Konfiguration: expo-sqlite lädt im Browser eine .wasm-Datei als Asset.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

module.exports = config;
