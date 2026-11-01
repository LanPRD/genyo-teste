// @ts-check
import globals from "globals";

import NodeConfig from "@prdev-solutions/eslint-config/node.mjs";

export default [
  { ignores: ["dist", "coverage", "src/generated"] },
  ...NodeConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
];
