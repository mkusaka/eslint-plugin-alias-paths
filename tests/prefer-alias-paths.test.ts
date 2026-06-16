import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";
import { preferAliasPaths } from "../src/rules/prefer-alias-paths.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

afterAll(() => {
  RuleTester.describe = null;
  RuleTester.it = null;
  RuleTester.itOnly = null;
});

const projectRoot = "/project";
const defaultOptions = [
  {
    basePath: projectRoot,
    targetPath: "src",
    aliasedPath: "@/",
    depth: 2,
  },
];

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
  },
});

ruleTester.run("prefer-alias-paths", preferAliasPaths, {
  valid: [
    {
      name: "allows existing alias import",
      code: 'import { Button } from "@/shared/Button";',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "allows relative import shallower than configured depth",
      code: 'import { Button } from "../shared/Button";',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "does not rewrite paths outside targetPath",
      code: 'import { build } from "../../../tools/build";',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "ignores package imports",
      code: 'import React from "react";',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "ignores export declarations",
      code: 'export { Button } from "../../shared/Button";',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "ignores dynamic imports",
      code: 'const module = await import("../../shared/Button");',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "ignores require calls",
      code: 'const module = require("../../shared/Button");',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
    },
    {
      name: "does not run without aliasedPath",
      code: 'import { Button } from "../../shared/Button";',
      filename: "/project/src/features/user/View.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          depth: 2,
        },
      ],
    },
    {
      name: "allows one level below depth 2",
      code: 'import mod from "../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 2,
        },
      ],
    },
    {
      name: "allows one level below depth 3",
      code: 'import mod from "../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 3,
        },
      ],
    },
    {
      name: "allows one level below depth 4",
      code: 'import mod from "../../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 4,
        },
      ],
    },
    {
      name: "allows one level below depth 5",
      code: 'import mod from "../../../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 5,
        },
      ],
    },
  ],
  invalid: [
    {
      name: "rewrites README-style deep relative import",
      code: 'import { Button } from "../../components/Button";',
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/components/Button",
          },
        },
      ],
      output: 'import { Button } from "@/components/Button";',
    },
    {
      name: "preserves single quotes",
      code: "import { format } from '../../utils/format';",
      filename: "/project/src/features/user/View.ts",
      options: defaultOptions,
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/utils/format",
          },
        },
      ],
      output: "import { format } from '@/utils/format';",
    },
    {
      name: "joins alias prefix without trailing slash",
      code: 'import setup from "../../setup";',
      filename: "/project/src/features/user/View.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: ".",
          aliasedPath: "~",
          depth: 2,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "~/src/setup",
          },
        },
      ],
      output: 'import setup from "~/src/setup";',
    },
    {
      name: "reports exactly depth 1",
      code: 'import mod from "../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 1,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/a/b/c/d/mod",
          },
        },
      ],
      output: 'import mod from "@/a/b/c/d/mod";',
    },
    {
      name: "reports exactly depth 2",
      code: 'import mod from "../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 2,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/a/b/c/mod",
          },
        },
      ],
      output: 'import mod from "@/a/b/c/mod";',
    },
    {
      name: "reports exactly depth 3",
      code: 'import mod from "../../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 3,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/a/b/mod",
          },
        },
      ],
      output: 'import mod from "@/a/b/mod";',
    },
    {
      name: "reports exactly depth 4",
      code: 'import mod from "../../../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 4,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/a/mod",
          },
        },
      ],
      output: 'import mod from "@/a/mod";',
    },
    {
      name: "reports exactly depth 5",
      code: 'import mod from "../../../../../mod";',
      filename: "/project/src/a/b/c/d/e/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 5,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/mod",
          },
        },
      ],
      output: 'import mod from "@/mod";',
    },
    {
      name: "supports depth beyond the old 1 through 5 range",
      code: 'import mod from "../../../../../../mod";',
      filename: "/project/src/a/b/c/d/e/f/file.ts",
      options: [
        {
          basePath: projectRoot,
          targetPath: "src",
          aliasedPath: "@/",
          depth: 6,
        },
      ],
      errors: [
        {
          messageId: "preferAlias",
          data: {
            path: "@/mod",
          },
        },
      ],
      output: 'import mod from "@/mod";',
    },
  ],
  assertionOptions: {
    requireData: "error",
    requireMessage: "messageId",
  },
});
