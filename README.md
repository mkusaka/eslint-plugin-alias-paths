# eslint-plugin-alias-paths

ESLint plugin for replacing deep relative import paths with project aliases.

This plugin is useful when a project already uses path aliases such as `@/`.
It detects imports like `../../utils/date` and reports an autofix to rewrite
them as alias imports such as `@/utils/date`.

## Why

Deep relative imports make files harder to move and harder to read.

```ts
import { formatDate } from "../../../shared/date";
```

When the same project also supports an alias such as `@/`, the import can be
written from the project root instead:

```ts
import { formatDate } from "@/shared/date";
```

`eslint-plugin-alias-paths` enforces that convention from a configurable import
depth.

## Installation

Requires Node.js `>=24` and ESLint `>=10`.

```sh
pnpm add -D eslint-plugin-alias-paths
```

```sh
yarn add -D eslint-plugin-alias-paths
```

```sh
npm install -D eslint-plugin-alias-paths
```

## Usage

Add the plugin and enable `alias-paths/prefer-alias-paths` in your ESLint
configuration.

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import aliasPaths from "eslint-plugin-alias-paths";

export default defineConfig([
  {
    plugins: {
      "alias-paths": aliasPaths,
    },
    rules: {
      "alias-paths/prefer-alias-paths": [
        "warn",
        {
          basePath: import.meta.dirname,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 2,
        },
      ],
    },
  },
]);
```

With the configuration above, imports that go up at least two directories are
rewritten to the configured alias.

```ts
// before
import { Button } from "../../components/Button";

// after
import { Button } from "@/components/Button";
```

## Rule Options

### `basePath`

Absolute base path for the project. In most `eslint.config.js` files this can
be `import.meta.dirname`.

### `targetPath`

Path below `basePath` that should be replaced by the alias. For example, use
`"./src"` when `@/` points to the `src` directory.

### `aliasedPath`

Alias prefix used in import paths. For example, `"@/"`.

### `depth`

Minimum relative import depth to report.

Supported values are positive integers.

Examples:

| `depth` | Reports imports starting with |
| ------- | ----------------------------- |
| `1`     | `../`                         |
| `2`     | `../../`                      |
| `3`     | `../../../`                   |
| `4`     | `../../../../`                |
| `5`     | `../../../../../`             |

## Scope

This plugin only rewrites static `import` declarations. It does not configure
TypeScript, bundlers, test runners, or runtime module resolution. Configure
those tools separately so the alias in `aliasedPath` resolves correctly.

Currently, the plugin does not handle `require()`, dynamic `import()`, or export
declarations.
