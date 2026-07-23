import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

const sourceUrl = "https://github.com/open-e2ee/design";

const colorTokens = [
  ["Canvas", "--oe-canvas", "token-canvas"],
  ["Surface", "--oe-surface", "token-surface"],
  ["Subtle", "--oe-surface-subtle", "token-subtle"],
  ["Primary", "--oe-primary", "token-primary"],
  ["Accent", "--oe-accent", "token-accent"],
  ["Success", "--oe-success", "token-success"],
  ["Danger", "--oe-danger", "token-danger"],
];

const surfaces = [
  {
    number: "01",
    name: "Website",
    description:
      "Editorial composition, larger type, and selective brand expression.",
  },
  {
    number: "02",
    name: "Docs",
    description:
      "Dense navigation, stable hierarchy, readable code, and focused scanning.",
  },
  {
    number: "03",
    name: "Console",
    description:
      "Explicit status, predictable actions, and calm decision-making surfaces.",
  },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="OpenE2EE Design home">
          <Image
            src="/brand/open-e2ee-shield-adaptive-small.svg"
            alt=""
            width={32}
            height={32}
            unoptimized
          />
          <span>OpenE2EE Design</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#identity">Identity</a>
          <a href="#tokens">Tokens</a>
          <a href="#surfaces">Surfaces</a>
          <a href={sourceUrl}>Source</a>
        </nav>
        <ThemeToggle />
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">Shared design foundations</p>
          <h1>
            Technical clarity.
            <br />
            Security without theater.
          </h1>
          <p className="lede">
            Brand identity, semantic themes, content guidance, and durable UI
            decisions for every OpenE2EE surface.
          </p>
          <div className="hero-actions">
            <a className="button" href={sourceUrl}>
              Explore the source
            </a>
            <code>npm install @open-e2ee/design</code>
          </div>
          <div className="principles" aria-label="Design principles">
            <article>
              <span>01</span>
              <strong>Precise</strong>
              <p>Structure and language do more work than decoration.</p>
            </article>
            <article>
              <span>02</span>
              <strong>Composable</strong>
              <p>Shared foundations without forcing identical products.</p>
            </article>
            <article>
              <span>03</span>
              <strong>Accessible</strong>
              <p>Theme, focus, contrast, motion, and zoom are requirements.</p>
            </article>
          </div>
        </section>

        <section id="identity">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Identity</p>
              <h2>One mark, designed for both modes.</h2>
            </div>
            <p>
              The split shield is generated from one geometry source and one
              token source. Small sizes use a simplified optical variant.
            </p>
          </div>
          <div className="mark-grid">
            <article className="mark-card light-card">
              <Image
                src="/brand/svg/open-e2ee-shield-light.svg"
                alt="OpenE2EE shield for light interfaces"
                width={320}
                height={320}
                unoptimized
              />
              <span>Light / primary</span>
            </article>
            <article className="mark-card dark-card">
              <Image
                src="/brand/svg/open-e2ee-shield-dark.svg"
                alt="OpenE2EE shield for dark interfaces"
                width={320}
                height={320}
                unoptimized
              />
              <span>Dark / inverse</span>
            </article>
          </div>
        </section>

        <section id="tokens">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Semantic tokens</p>
              <h2>Describe purpose, not palette.</h2>
            </div>
            <p>
              Components consume stable roles. Theme changes never alter
              meaning, hierarchy, or available actions.
            </p>
          </div>
          <div className="token-grid">
            {colorTokens.map(([name, token, className]) => (
              <article className={`token ${className}`} key={token}>
                <strong>{name}</strong>
                <code>{token}</code>
              </article>
            ))}
          </div>
          <article className="session-panel">
            <div>
              <p className="panel-label">Session</p>
              <h3>Identity verified</h3>
              <p>The safety number matches the trusted contact identity.</p>
            </div>
            <span className="status">Verified</span>
          </article>
        </section>

        <section id="surfaces">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Surface profiles</p>
              <h2>Recognizably related, deliberately different.</h2>
            </div>
            <p>
              The system unifies identity, typography, theme, focus, and
              language while allowing each surface to optimize for its job.
            </p>
          </div>
          <div className="surface-grid">
            {surfaces.map((surface) => (
              <article key={surface.name}>
                <span>{surface.number}</span>
                <h3>{surface.name}</h3>
                <p>{surface.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing">
          <p className="eyebrow">Design is an API</p>
          <h2>Change sources. Generate outputs. Version everything.</h2>
          <a className="button" href={`${sourceUrl}/blob/main/DESIGN.md`}>
            Read DESIGN.md
          </a>
        </section>
      </main>

      <footer>
        <span>OpenE2EE Design</span>
        <span>Brand · Tokens · Themes · Guidance</span>
      </footer>
    </>
  );
}
