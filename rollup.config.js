import { nodeResolve as resolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sucrase from "@rollup/plugin-sucrase";
import typescript from "@rollup/plugin-typescript";
//import { terser } from "rollup-plugin-terser";

//const terserOptions = {};

let production = !process.env.ROLLUP_WATCH;

let typescriptOptions = production
  ? {
      tsconfig: "./tsconfig.json",
    }
  : { include: ["src/**/*.ts"], exclude: ["node_modules/**"], transforms: ["typescript"] };

const ts = production ? typescript : sucrase;

// @ts-ignore
const tsPlugin = ts(typescriptOptions);

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  tsPlugin,
  commonjs({ extensions: [".js", ".ts"] }),
  //terser(terserOptions),
];

const options = {
  plugins,
  watch: { clearScreen: false },
};

const outputOptionsEsm = {
  dir: "dist",
  assetFileNames: "assets/[hash][extname]",
  entryFileNames: "[name].js",
  sourcemap: true,
  manualChunks(id) {
    if (id.includes("node_modules")) {
      return "vendor";
    }
  },
  chunkFileNames(chunk) {
    if (chunk.name === "vendor") return "vendor.esm.min.js";
    return `${chunk.name}.esm.js`;
  },
  compact: false,
};

const files = [
  {
    input: "src/index.ts",
    output: [
      {
        ...outputOptionsEsm,
        format: "esm",
        entryFileNames: "[name].js",
      },
    ],
    ...options,
  },
];

export default files;
