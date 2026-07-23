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
  assert.match(html, /Technical clarity/);
  assert.match(html, /Security without theater/);
  assert.match(html, /npm install @open-e2ee\/design/);
  assert.match(html, /Semantic tokens/);
  assert.match(html, /Surface profiles/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

