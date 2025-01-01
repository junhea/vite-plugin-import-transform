# vite-plugin-import-transform

vite plugin to transform import declarations

useful for:

- solving interop conflicts
- replacing module

## Installation

```bash
npm install --save-dev vite-plugin-import-transform
```

## Usage

```js
import importTransform from "vite-plugin-import-transform"
export default defineConfig({
  plugins: [
    importTransform({
      include: ["**/*.js"],
      transforms: [
        // change import type
        // e.g. import * as foo from '...'; => import foo from '...';
        {
          find: { type: "ImportNamespaceSpecifier" },
          replace: { type: "ImportDefaultSpecifier" },
        },
        // replace module
        // e.g. import ... from 'foo'; => import ... from 'bar';
        {
          find: { source: "foo" },
          replace: { source: "bar" },
        },
        // multiple conditions (OR)
        // e.g. import * as foo from 'foo'; => import foo from 'qaz';
        // e.g. import * as bar from 'bar'; => import bar from 'qaz';
        // e.g. import bar from 'bar'; => import bar from 'qaz';
        {
          find: [
            { source: "foo", type: "ImportNamespaceSpecifier" },
            { source: "bar" },
          ],
          replace: { source: "qaz", type: "ImportDefaultSpecifier" },
        },
      ],
    }),
  ],
})
```

## Todo

- generate source code from transformed ast to support dev server
- compatibility with rollup

## License

MIT
