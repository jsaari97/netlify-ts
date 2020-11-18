Netlify Type Generator
===

Create TypeScript typings from Netlify CMS content collections.

# Installation

```bash
$ npm install -g netlify-ts
```

# Usage

```bash
$ netlify-ts public/admin/config.yml
```

This generates a `netlify-types.ts` file in the project root containing types for your netlify content types.

### Custom output location

You can also specify a custom output location by providing a second optional parameter. Omitting the filename outputs a file in the given directory with the default filename.

```bash
$ netlify-ts public/admin/config.yml src/my-types.ts
```

# License

MIT
