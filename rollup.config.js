import { nodeResolve as resolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sucrase from "@rollup/plugin-sucrase";
import livereload from "rollup-plugin-livereload";
//import { terser } from "rollup-plugin-terser";

let production = !process.env.ROLLUP_WATCH;

//const terserOptions = {};

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  sucrase({ include: ["src/**/*.ts"], exclude: ["node_modules/**"], transforms: ["typescript"] }),
  commonjs({ extensions: [".js", ".ts"] }),
  //terser(terserOptions),
];

if (!production) {
  plugins.push(livereload());
}

const options = {
  plugins,
  watch: { clearScreen: false },
};

const outputOptionsEsm = {
  dir: "dist",
  assetFileNames: "assets/[hash][extname]",
  //chunkFileNames: '[name].esm.js',
  entryFileNames: "[name].esm.js",
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
  compact: true,
};

const outputOptionsUmd = {
  assetFileNames: "assets/[hash][extname]",
  entryFileNames: "[name].umd.js",
  sourcemap: true,
  name: "DeepStateObserver",
  exports: "default",
};

const files = [
  {
    input: "src/index.ts",
    output: [
      {
        ...outputOptionsEsm,
        format: "esm",
        entryFileNames: "[name].esm.js",
      },
      {
        ...outputOptionsUmd,
        format: "umd",
        file: "dist/index.umd.js",
      },
    ],
    ...options,
  },
];

export default files;
