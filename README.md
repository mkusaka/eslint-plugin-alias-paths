# eslint-plugin-alias-paths

eslint plugin for detect & autofix alias paht
# install

```
yarn add https://github.com/mkusaka/eslint-plugin-alias-paths.git
```

# usage
```.js
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
        "alias-paths
    ],
    rules: {
        "alias-paths/prefer-alias-paths"
    },
};
```