import { geometry } from "./tokens";

/*
 * The signature diagram, drawn to the grammar in DESIGN.md: outlined forms are
 * readable, filled forms are not, sheared forms are moving, and the trust
 * boundary is a gutter of empty canvas rather than a fence. The relay is the
 * org mark itself, read straight out of the published geometry so the diagram
 * cannot drift away from the logo.
 */

const RELAY_SIZE = 140;
const RELAY_X = 478;
const RELAY_Y = 92;

function Device({ x, label }: { x: number; label: string }) {
  const bars = [
    { y: 118, width: 150 },
    { y: 140, width: 170 },
    { y: 162, width: 120 },
  ];
  return (
    <g>
      <rect
        x={x}
        y={96}
        width={200}
        height={133}
        fill="none"
        stroke="var(--oe-diagram-plaintext-stroke)"
        strokeWidth={4}
      />
      {bars.map((bar) => (
        <rect
          key={bar.y}
          x={x + 20}
          y={bar.y}
          width={bar.width}
          height={9}
          fill="var(--oe-diagram-plaintext-stroke)"
          opacity={0.28}
        />
      ))}
      <path
        d={`M${x + 20} 190 H${x + 52} L${x + 60} 198 V214 H${x + 20} Z`}
        fill="var(--oe-diagram-plaintext-stroke)"
      />
      <text x={x} y={262} className="diagram-label">
        {label}
      </text>
    </g>
  );
}

function Envelope({ x, ticks }: { x: number; ticks?: string }) {
  const shear = 14;
  return (
    <g>
      {Array.from({ length: 5 }, (_, index) => (
        <rect
          key={index}
          x={x + 16 + index * 14}
          y={98}
          width={2}
          height={10}
          fill="var(--oe-diagram-boundary)"
        />
      ))}
      {ticks ? (
        <text x={x + 14} y={88} className="diagram-tick-label">
          {ticks}
        </text>
      ) : null}
      <path
        d={`M${x + shear} 112 L${x + 80 + shear} 112 L${x + 80} 212 L${x} 212 Z`}
        fill="var(--oe-diagram-ciphertext-fill)"
      />
      <text x={x} y={262} className="diagram-label">
        sealed
      </text>
    </g>
  );
}

function Boundary({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <text x={x} y={64} textAnchor="middle" className="diagram-boundary-label">
        {label}
      </text>
      <line
        x1={x}
        y1={76}
        x2={x}
        y2={248}
        stroke="var(--oe-diagram-boundary)"
        strokeWidth={2}
        strokeDasharray="2 6"
      />
    </g>
  );
}

function Arrow({ x }: { x: number }) {
  return (
    <g fill="var(--oe-diagram-carrier-stroke)">
      <rect x={x} y={161} width={30} height={2} />
      <path d={`M${x + 30} 155 L${x + 40} 162 L${x + 30} 169 Z`} />
    </g>
  );
}

export function SignatureDiagram() {
  return (
    <svg
      className="signature-diagram"
      viewBox="0 0 1104 280"
      role="img"
      aria-labelledby="signature-diagram-title signature-diagram-desc"
    >
      <title id="signature-diagram-title">
        One message travelling from one device to another through a relay
      </title>
      <desc id="signature-diagram-desc">
        Two outlined devices with readable contents and a private key inside
        each. Between them, sealed envelopes drawn as solid slabs leaning in the
        direction of travel, carrying metadata ticks on their outside edge, and
        the OpenE2EE mark standing in for the relay. Dotted brass rules mark
        where the message is sealed and where it is opened.
      </desc>

      <Device x={10} label="Device A · readable" />
      <Boundary x={258} label="seal" />
      <Envelope x={320} ticks="metadata visible" />
      <Arrow x={432} />
      <g
        transform={`translate(${RELAY_X} ${RELAY_Y}) scale(${RELAY_SIZE / 512})`}
        fill="var(--oe-diagram-carrier-stroke)"
      >
        <path d={geometry.full.carrierLeftPath} />
        <path d={geometry.full.carrierRightPath} />
        <path d={geometry.full.payloadPath} />
      </g>
      <text x={RELAY_X} y={262} className="diagram-label">
        relay · cannot read
      </text>
      <Arrow x={632} />
      <Envelope x={688} />
      <Boundary x={826} label="open" />
      <Device x={888} label="Device B · readable" />
    </svg>
  );
}
