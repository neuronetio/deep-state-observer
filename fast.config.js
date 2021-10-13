import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-sucrase";

const typescriptOptions = { include: ["./*.ts"], exclude: ["node_modules/**"], transforms: ["typescript"] };

export default [
  {
    input: "index.ts",
    output: {
      file: "index.esm.js",
      format: "esm",
    },
    plugins: [
      typescript(typescriptOptions),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: [".js", ".ts"] }),
    ],
  },
  {
    input: "index.ts",
    output: {
      file: "index.cjs.js",
      format: "cjs",
    },
    plugins: [
      typescript(typescriptOptions),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: [".js", ".ts"] }),
    ],
  },
  {
    input: "index.ts",
    output: {
      name: "DeepStateObserver",
      file: "index.umd.js",
      format: "umd",
    },
    plugins: [
      typescript(typescriptOptions),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: [".js", ".ts"] }),
    ],
  },
  {
    input: "test.ts",
    output: {
      file: "test.esm.js",
      format: "esm",
    },
    plugins: [
      typescript(typescriptOptions),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: [".js", ".ts"] }),
    ],
  },
];
