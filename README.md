# eslint-plugin-alias-paths

eslint plugin for detect & autofix alias path.
# install

```
yarn add -D eslint-plugin-alias-paths
```

# usage
```js
module.exports = {
    env: {
        browser: true,
        es2020: true,
    },
    extends: [],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 11,
        sourceType: "module",
    },
    plugins: [
        "alias-paths",
    ],
    rules: {
        "alias-paths/prefer-alias-paths": [
            "warn"
            {
                basePath: resolve(__dirname), // base path for project
                targetPath: "./", // base of alias path
                aliasedPath: "@/", // path for aliased path
                depth: 2, // target minimum relative path depth
            }
        ],
    },
};
```
