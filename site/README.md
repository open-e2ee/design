# OpenE2EE Design reference site

The source for `design.open-e2ee.dev`.

The site consumes the repository's local `@open-e2ee/design` package, exports a
versioned asset snapshot before development and builds, and demonstrates the
same theme contract used by product consumers.

```sh
npm install
npm run dev
npm test
```

The deployment target is recorded in `.openai/hosting.json`. The site does not
use persistent storage, authentication, or runtime environment variables.

