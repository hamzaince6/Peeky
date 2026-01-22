module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@components': './app/components',
            '@screens': './app/screens',
            '@services': './app/services',
            '@hooks': './app/hooks',
            '@utils': './app/utils',
            '@navigation': './app/navigation',
          },
        },
      ],
    ],
  };
};
