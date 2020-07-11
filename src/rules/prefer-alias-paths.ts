import { Rule } from "eslint";
import path from "path";

const preferAliasPaths: Rule.RuleModule = {
  create: (context) => {
    function escapeRegExp(string: string) {
      return string.replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&");
    }
    const currentFilePath = context.getFilename();
    const {
      basePath,
      target,
      aliasedPath,
    }: {
      basePath: string;
      target: string;
      aliasedPath: string;
    } = context.options[0];
    const currentDirname = path.dirname(currentFilePath);
    function absPath(importPath: string) {
      if (importPath.match(new RegExp(`^${escapeRegExp(aliasedPath)}`))) {
        return path.resolve(
          basePath,
          target,
          importPath.replace(
            new RegExp(
              `^${escapeRegExp(
                path
                  .join(aliasedPath, "dummy")
                  .replace(path.basename(path.join(aliasedPath, "dummy")), "")
              )}`
            ),
            ""
          )
        );
      }
      return path.resolve(currentDirname, importPath);
    }
    return {
      ImportDeclaration: (node) => {
        // @ts-ignore
        const importPath: string = node.source.value;
        const absolutePath = absPath(importPath);
        const expectedAliasedPath = absolutePath.replace(
          path.resolve(basePath, target),
          aliasedPath
        );
        if (importPath !== expectedAliasedPath) {
          context.report({
            message: `can be replaceable to ${expectedAliasedPath}`,
            node,
            fix: (fixer) => {
              return fixer.replaceTextRange(
                // @ts-ignore
                node.source.range,
                `"${expectedAliasedPath}"`
              );
            },
          });
        }
      },
    };
  },
};

export { preferAliasPaths };
