import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
export default [
  {
    input: "index.ts",
    output: {
      file: "index.esm.js",
      format: "esm",
    },
    plugins: [
      typescript(),
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
      typescript(),
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
      typescript(),
      resolve({
        browser: true,
      }),
      commonjs({ extensions: [".js", ".ts"] }),
    ],
  },
];
