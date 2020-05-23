const presets = [
    ['@babel/preset-typescript'],
    ['@babel/preset-env', {}],
    ['@babel/preset-react']
];
const plugins = [];

module.exports = (api) => {
    api.cache(true);
    return {
        babelrcRoots: [
            '.',
        ],
        presets,
        plugins,
    };
};
