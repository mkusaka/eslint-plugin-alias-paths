import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { dirname, join, resolve } from "path";

const createRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

type SchemaType = {
  basePath: string;
  targetPath: string;
  aliasedPath: string;
  depth: number;
};

const defaultOptions: SchemaType = {
  basePath: "",
  targetPath: "",
  aliasedPath: "",
  depth: 2,
};

const regexGen = (depth: number) => {
  switch (depth) {
    case 1:
      return /^\.\.\//;
    case 2:
      return /^\.\.\/\.\.\//;
    case 3:
      return /^\.\.\/\.\.\/\.\.\//;
    case 4:
      return /^\.\.\/\.\.\/\.\.\/\.\.\//;
    case 5:
      return /^\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//;
    default:
      throw Error("unsupported depth");
  }
};

export const preferAliasPaths = createRule<[SchemaType], "message">({
  name: "prefer-alias-paths",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "prefer alias path instead of relative path.",
      category: "Best Practices",
      recommended: false,
      requiresTypeChecking: true,
    },
    deprecated: false,
    messages: {
      message: "{{ message }}",
    },
    schema: [
      {
        type: "object",
        properties: {
          basePath: {
            type: "string",
          },
          target: {
            type: "string",
          },
          aliasedPath: {
            type: "string",
          },
          depth: {
            type: "number",
          },
        },
      },
    ],
  },
  defaultOptions: [defaultOptions],
  create(context) {
    return {
      ImportDeclaration: (node) => {
        const importPath = node.source.value as string;
        if (!/\.\.\//.exec(importPath)) {
          return;
        }
        const {
          basePath,
          targetPath: target,
          aliasedPath,
          depth,
        } = context.options[0];
        const relativePrefixRegexp = regexGen(depth);
        if (!relativePrefixRegexp.exec(importPath)) {
          return;
        }
        const targetPath = join(basePath, target);
        const fullFilePath = context.getFilename();
        const dirPath = dirname(fullFilePath);
        const expectedAliasedPath = resolve(dirPath, importPath).replace(
          targetPath,
          aliasedPath
        );
        if (importPath !== expectedAliasedPath) {
          context.report({
            messageId: "message",
            node,
            fix: (fixer) => {
              return fixer.replaceTextRange(
                node.source.range,
                `"${expectedAliasedPath}"`
              );
            },
          });
        }
      },
    };
  },
});
