import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { SignatureDiagram } from "./signature-diagram";
import { ramps } from "./tokens";

const sourceUrl = "https://github.com/open-e2ee/design";

const markSizes = [
  { size: 16, variant: "optical", src: "/brand/open-e2ee-mark-adaptive-small.svg" },
  { size: 32, variant: "full", src: "/brand/open-e2ee-mark-adaptive.svg" },
  { size: 64, variant: "full", src: "/brand/open-e2ee-mark-adaptive.svg" },
  { size: 512, variant: "full", src: "/brand/open-e2ee-mark-adaptive.svg" },
];

const surfaces = [
  {
    number: "01",
    name: "Website",
    description:
      "Editorial composition, larger type, and one signature device per viewport.",
  },
  {
    number: "02",
    name: "Docs",
    description:
      "Front-matter blocks, Failure mode callouts, and a serif that says a page is explaining rather than operating.",
  },
  {
    number: "03",
    name: "Console",
    description:
      "Explicit status, predictable actions, and a lifecycle stepper that only moves forward.",
  },
];

function Wordmark() {
  return (
    <span className="oe-wordmark">
      <span>Open</span>
      <span>E2EE</span>
    </span>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="OpenE2EE Design home">
          <Image
            src="/brand/open-e2ee-mark-adaptive-small.svg"
            alt=""
            width={32}
            height={32}
            unoptimized
          />
          <Wordmark />
          <small>Design</small>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#identity">Identity</a>
          <a href="#diagrams">Diagrams</a>
          <a href="#color">Color</a>
          <a href="#type">Type</a>
          <a href="#surfaces">Surfaces</a>
          <a href={sourceUrl}>Source</a>
        </nav>
        <ThemeToggle />
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">The Opaque Carrier</p>
          <h1>
            Opaque to the relay.
            <br />
            Open to inspection.
          </h1>
          <p className="proposed">
            Proposed — pending founder sign-off
          </p>
          <p className="lede">
            One idea runs through the mark, the palette, the diagrams, and the
            words: a carrier that cannot read what it carries. This is the
            shared identity, token, and theming source for every OpenE2EE
            surface.
          </p>
          <div className="hero-actions">
            <a className="button" href={`${sourceUrl}/blob/main/DESIGN.md`}>
              Read the design contract
            </a>
            <code>npm install github:open-e2ee/design#v0.2.0</code>
          </div>
          <div className="law" aria-label="The material law">
            <article>
              <span>01</span>
              <strong>Open is outlined</strong>
              <p>
                A transparent interior means you can see in, so the contents are
                readable. There is no half-transparent third state.
              </p>
            </article>
            <article>
              <span>02</span>
              <strong>Opaque is filled</strong>
              <p>
                A flat fill with no interior detail means the contents are not
                readable. Overlap occludes; it never blends.
              </p>
            </article>
            <article>
              <span>03</span>
              <strong>Metadata is always drawn</strong>
              <p>
                Every sealed envelope carries brass ticks for what the relay can
                still see. Leaving them off is a bug, not a simplification.
              </p>
            </article>
          </div>
        </section>

        <section id="identity">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Identity</p>
              <h2>Two brackets. One payload. A gap that never closes.</h2>
            </div>
            <p>
              The carrier is open and inspectable; the payload is not. The gap
              between them is the trust boundary — geometry, not spacing, and it
              may never be tightened.
            </p>
          </div>
          <div className="mark-grid">
            <article className="mark-card light-card">
              <Image
                src="/brand/svg/open-e2ee-mark-light.svg"
                alt="The OpenE2EE mark drawn for light interfaces"
                width={320}
                height={320}
                unoptimized
              />
              <span>Light — the default</span>
            </article>
            <article className="mark-card dark-card">
              <Image
                src="/brand/svg/open-e2ee-mark-dark.svg"
                alt="The OpenE2EE mark drawn for dark interfaces"
                width={320}
                height={320}
                unoptimized
              />
              <span>Dark — equally first-class</span>
            </article>
          </div>
          <div className="size-row">
            {markSizes.map((mark) => (
              <figure key={mark.size}>
                <Image
                  src={mark.src}
                  alt={`The mark at ${mark.size} pixels, ${mark.variant} variant`}
                  width={mark.size}
                  height={mark.size}
                  style={{ width: `${mark.size}px`, height: `${mark.size}px` }}
                  unoptimized
                />
                <figcaption>
                  {mark.size}px · {mark.variant}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="figure-note">
            Two silhouettes exist. Below 32px the payload squares up and the
            stems thicken, because the shear disintegrates at favicon scale;
            from 32px the payload shears to read as cargo in transit. Selection
            by size is a rule the build applies and the tests enforce, not a
            judgement call. Nothing renders below 16px.
          </p>
        </section>

        <section id="diagrams">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Diagram grammar</p>
              <h2>The diagrams and the logo are the same construction.</h2>
            </div>
            <p>
              Which is why every diagram reinforces the mark, and the mark
              explains every diagram. This is the system&rsquo;s workhorse.
            </p>
          </div>
          <figure className="figure">
            <SignatureDiagram />
            <figcaption className="figure-note">
              Devices are outlined, so you can see their contents. Envelopes are
              filled, so you cannot. The private key never appears outside a
              device outline anywhere in this system, including in error and
              recovery diagrams — that absence is the argument. The trust
              boundary is a gutter of empty canvas with a dotted brass rule, not
              a fence drawn around a region: encryption happens at a place.
            </figcaption>
          </figure>
        </section>

        <section id="color">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Color</p>
              <h2>Warm paper, not cool grey.</h2>
            </div>
            <p>
              Every published contrast ratio is asserted to two decimal places,
              and a chroma lint keeps the neutral ramp from drifting blue
              through incremental edits.
            </p>
          </div>
          {ramps.map((ramp) => (
            <div className="ramp" key={ramp.name}>
              <header>
                <h3>{ramp.name}</h3>
                <p className="ramp-role">{ramp.role}</p>
              </header>
              <div className="ramp-steps">
                {ramp.steps.map(([step, value]) => (
                  <figure key={step}>
                    <div className="swatch" style={{ background: value }} />
                    <figcaption>
                      <span>{step}</span>
                      <span>{value}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
          <article className="session-panel">
            <div>
              <p className="panel-label">Session</p>
              <h3>Identity verified</h3>
              <p>The safety number matches the trusted contact identity.</p>
            </div>
            <span className="status">Verified</span>
          </article>
        </section>

        <section id="type">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Typography</p>
              <h2>Serif explains. Sans operates. Mono is for values.</h2>
            </div>
            <p>
              The split is doctrinal. A reader can tell which kind of page they
              are on before reading a word.
            </p>
          </div>
          <div className="specimen-grid">
            <article className="specimen specimen-sans">
              <p className="sample">Public Sans</p>
              <p>
                Interface, headings, and the wordmark. A Libre Franklin
                derivative, so the civic and postal lineage arrives by descent
                rather than by pastiche — with caps and figures sturdy enough
                for PQXDH and ML-KEM.
              </p>
              <dl>
                <dt>400</dt>
                <dd>body and UI</dd>
                <dt>500</dt>
                <dd>emphasis, labels</dd>
                <dt>600</dt>
                <dd>subheads</dd>
                <dt>700</dt>
                <dd>headings</dd>
                <dt>800</dt>
                <dd>wordmark</dd>
              </dl>
            </article>
            <article className="specimen specimen-serif">
              <p className="sample">Newsreader</p>
              <p>
                Articles, Learn pages, and long-form explanation. The fastest
                signal that a page is an argument rather than an interface is
                that it is set in a text serif.
              </p>
              <dl>
                <dt>opsz</dt>
                <dd>auto</dd>
                <dt>weight</dt>
                <dd>400</dd>
                <dt>leading</dt>
                <dd>1.7</dd>
                <dt>measure</dt>
                <dd>68ch</dd>
              </dl>
            </article>
            <article className="specimen specimen-mono">
              <p className="sample">05 A9 F2 1C</p>
              <p>
                JetBrains Mono, kept from the previous system. Packages,
                versions, identifiers, safety numbers, timestamps. Never prose,
                never emphasis.
              </p>
              <dl>
                <dt>code</dt>
                <dd>400 / 13.5px / 1.65</dd>
                <dt>inline</dt>
                <dd>0.92em of context</dd>
                <dt>metadata</dt>
                <dd>500 / 12px / +2%</dd>
              </dl>
            </article>
          </div>
          <p className="figure-note">
            The wordmark performs the material law rather than illustrating it:{" "}
            <Wordmark /> sets <code>Open</code> at weight 500 and{" "}
            <code>E2EE</code> at weight 800, so read left to right it is an open
            thing becoming an opaque thing. Below 14px it reverts to one uniform
            weight, where the contrast would read as a rendering fault.
          </p>
        </section>

        <section id="surfaces">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Surface profiles</p>
              <h2>Recognizably related, deliberately different.</h2>
            </div>
            <p>
              The system unifies identity, typography, theme, focus, and
              language while letting each surface optimize for its job.
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
