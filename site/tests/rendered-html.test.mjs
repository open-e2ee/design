import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the OpenE2EE design reference", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>OpenE2EE Design<\/title>/i);
  assert.match(html, /The Opaque Carrier/);
  assert.match(html, /Opaque to the relay/);
  assert.match(html, /Open to inspection/);
  assert.match(html, /Diagram grammar/);
  assert.match(html, /Surface profiles/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);

  /*
   * The taglines are not approved yet. If the annotation ever falls off the
   * page, unapproved copy is silently presenting itself as final.
   */
  assert.match(html, /pending founder sign-off/);

  /* The package is not on npm; showing that command would send readers to a 404. */
  assert.doesNotMatch(html, /npm install @open-e2ee\/design/);
  assert.match(html, /npm install github:open-e2ee\/design/);

  /* Retired copy must not come back through a copy-paste. */
  assert.doesNotMatch(html, /Security without theater/);

  /* The old shield assets no longer exist; a stale reference would 404. */
  assert.doesNotMatch(html, /open-e2ee-shield/);
});

