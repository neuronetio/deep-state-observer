import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
export default [
  {
    input: 'index.ts',
    output: {
      file: 'index.js',
      format: 'esm'
    },
    plugins: [
      typescript(),
      resolve({
        browser: true
      }),
      commonjs()
    ]
  },
  {
    input: 'index.js',
    output: {
      file: 'index.cjs.js',
      format: 'cjs'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs()
    ]
  },
  {
    input: 'index.js',
    output: {
      name: 'svelte-deep-store',
      file: 'index.umd.js',
      format: 'umd'
    },
    plugins: [
      resolve({
        browser: true
      })
    ]
  }
];
