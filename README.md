# Netlify Type Generator

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fjsaari97%2Fnetlify-ts%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/jsaari97/netlify-ts/goto?ref=master)
![Supported Node versions](https://img.shields.io/node/v/netlify-ts)
[![Code coverage](https://img.shields.io/codecov/c/gh/jsaari97/netlify-ts)](https://app.codecov.io/gh/jsaari97/netlify-ts/)
![Project license](https://img.shields.io/npm/l/netlify-ts)

**Turn your Netlify CMS collections into TypeScript typings!**

<br />

This package generates a [TypeScript](https://www.typescriptlang.org/) schema of your [Netlify CMS](https://www.netlifycms.org/) content collections to be consumed by frontend apps for better type support.

# Features

- Primitive types, e.g. `string`, `number` and `boolean`
- Extract object widgets into own type interfaces
- Single and nested lists
- Multi-select and single option values
- Optional fields
- Unknown widgets resolve to `any` type
- Relation fields

# Installation

The package can be installed globally or as a `devDependency` using NPM or Yarn.

**NPM:**

```bash
npm install -g netlify-ts

# or

npm install -D netlify-ts
```

**Yarn:**

```bash
yarn global add netlify-ts

# or

yarn add -D netlify-ts
```

# Usage

## Method 1: CLI

The main method of usage is through the command-line. Having installed the package either globally or in project's `devDependencies`, simply call `netlify-ts` with a parameter pointing to your Netlify CMS admin `config.yml` file.

```bash
netlify-ts public/admin/config.yml
```

This generates by default a `netlify-types.ts` file in the project root containing types for your netlify content types.

### Custom output location

You can also specify a custom output location by providing a second optional parameter. Omitting the filename outputs a file in the given directory with the default filename (`netlify-types.ts`).

```bash
netlify-ts public/admin/config.yml src/my-types.ts
```

## Method 2: Programmatically

In case the CLI doesn't suit your project workflow or you need to invoke the type generation inside your code, the project exposes both a `createNetlifyTypes` and `createNetlifyTypesAsync` function that returns the generated type file as a string.

### Config file

```javascript
const fs = require("fs");
const { createNetlifyTypes } = require("netlify-ts");

function main() {
  const types = createNetlifyTypes("public/admin/config.yml");
  fs.writeFileSync("my-types.ts", types);
}

main();
```

### Config object

```javascript
const fs = require("fs");
const { createNetlifyTypes } = require("netlify-ts");

const cmsConfig = require("./config");

function main() {
  const types = createNetlifyTypes(cmsConfig);
  fs.writeFileSync("my-types.ts", types);
}

main();
```

# License

MIT
