module.exports = function (api) {
  api.cache(true)
  const plugins = [
    'react-native-reanimated/plugin',
    'react-native-paper/babel',
    'nativewind/babel',
    [
      'module-resolver',
      {
        alias: {
          'react-native-sqlite-storage': 'react-native-quick-sqlite',
        },
      },
    ],
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ]

  if (
    process.env.NX_TASK_TARGET_TARGET &&
    (process.env.NX_TASK_TARGET_TARGET === 'build' ||
      process.env.NX_TASK_TARGET_TARGET.includes('storybook'))
  ) {
    return {
      presets: [
        [
          '@nx/react/babel',
          {
            runtime: 'automatic',
          },
        ],
      ],
      plugins,
    }
  }

  return {
    presets: [
      ['module:@react-native/babel-preset', { useTransformReactJSX: true }],
    ],
    plugins,
  }
}
