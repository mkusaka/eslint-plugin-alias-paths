import type { Rule } from "eslint";
import { dirname, isAbsolute, relative, resolve, sep as pathSeparator } from "node:path";

type PreferAliasPathsOptions = {
  basePath?: string;
  targetPath?: string;
  aliasedPath?: string;
  depth?: number;
};

type MessageIds = "preferAlias";

const DEFAULT_DEPTH = 2;

function getRelativeImportDepth(importPath: string): number {
  if (!importPath.startsWith("../")) {
    return 0;
  }

  let depth = 0;
  for (const segment of importPath.split("/")) {
    if (segment !== "..") {
      break;
    }

    depth += 1;
  }

  return depth;
}

function isInsideTarget(relativePath: string): boolean {
  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${pathSeparator}`) &&
      relativePath !== ".." &&
      !isAbsolute(relativePath))
  );
}

function normalizeImportPath(path: string): string {
  return path.split(pathSeparator).join("/");
}

function joinAliasPath(aliasPrefix: string, pathFromTarget: string): string {
  const normalizedAlias = aliasPrefix.replace(/\\/g, "/");
  const normalizedPath = normalizeImportPath(pathFromTarget);

  if (normalizedPath === "") {
    return normalizedAlias;
  }

  if (normalizedAlias === "" || normalizedAlias.endsWith("/")) {
    return `${normalizedAlias}${normalizedPath}`;
  }

  return `${normalizedAlias}/${normalizedPath}`;
}

function getQuote(sourceText: string): string {
  return sourceText.startsWith("'") ? "'" : '"';
}

export const preferAliasPaths: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer alias imports instead of deep relative imports.",
    },
    fixable: "code",
    messages: {
      preferAlias: "Use alias path {{ path }}.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          basePath: {
            type: "string",
          },
          targetPath: {
            type: "string",
          },
          aliasedPath: {
            type: "string",
          },
          depth: {
            type: "integer",
            minimum: 1,
          },
        },
      },
    ],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== "string") {
          return;
        }

        const options = (context.options[0] ?? {}) as PreferAliasPathsOptions;
        const aliasedPath = options.aliasedPath ?? "";
        if (aliasedPath === "") {
          return;
        }

        const minimumDepth = options.depth ?? DEFAULT_DEPTH;
        if (getRelativeImportDepth(importPath) < minimumDepth) {
          return;
        }

        const basePath = resolve(options.basePath ?? context.cwd);
        const targetPath = resolve(basePath, options.targetPath ?? ".");
        const absoluteImportPath = resolve(dirname(context.filename), importPath);
        const pathFromTarget = relative(targetPath, absoluteImportPath);

        if (!isInsideTarget(pathFromTarget)) {
          return;
        }

        const expectedAliasedPath = joinAliasPath(aliasedPath, pathFromTarget);
        if (importPath === expectedAliasedPath) {
          return;
        }

        context.report({
          node: node.source,
          messageId: "preferAlias" satisfies MessageIds,
          data: {
            path: expectedAliasedPath,
          },
          fix(fixer) {
            const sourceText = context.sourceCode.getText(node.source);
            const quote = getQuote(sourceText);

            return fixer.replaceText(node.source, `${quote}${expectedAliasedPath}${quote}`);
          },
        });
      },
    };
  },
};
