import {
  ARROW_STROKE_WIDTH,
  BOUNDARY_STROKE,
  CARRIER_STROKE,
  CIPHERTEXT_FILL,
  CONTENT_BAR_FILL,
  PLAINTEXT_STROKE,
  STROKE_WIDTH,
  contentBarRects,
  metadataTickRects,
  notchedSlabPath,
  slabPath,
} from "@open-e2ee/design";

import { geometry } from "./tokens";

/*
 * The signature diagram, drawn with the published primitives rather than with
 * a private copy of them. Outlined forms are readable, filled forms are not,
 * sheared forms are moving, and the trust boundary is a gutter of empty canvas
 * rather than a fence. The relay is the org mark itself, read straight out of
 * the published geometry so the diagram cannot drift away from the logo.
 *
 * Geometry functions, not the markup ones: those emit `stroke-width` and React
 * wants `strokeWidth`.
 */

const RELAY_SIZE = 140;
const RELAY_X = 478;
const RELAY_Y = 92;

const DEVICE = { y: 96, width: 200, height: 133, padding: 20 };
const ENVELOPE = { y: 112, width: 80, height: 100, shear: 14, ticks: 5 };

function Device({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <rect
        x={x}
        y={DEVICE.y}
        width={DEVICE.width}
        height={DEVICE.height}
        fill="none"
        stroke={PLAINTEXT_STROKE}
        strokeWidth={STROKE_WIDTH}
      />
      {contentBarRects({
        x: x + DEVICE.padding,
        y: DEVICE.y + 22,
        width: DEVICE.width - DEVICE.padding * 2,
      }).map((bar) => (
        <rect key={bar.y} {...bar} fill={CONTENT_BAR_FILL} />
      ))}
      {/* Filled notched slab: a private key, and it never leaves this outline. */}
      <path
        d={notchedSlabPath({
          x: x + DEVICE.padding,
          y: 190,
          width: 40,
          height: 24,
          notch: 8,
        })}
        fill={PLAINTEXT_STROKE}
      />
      <text x={x} y={262} className="diagram-label">
        {label}
      </text>
    </g>
  );
}

function Envelope({ x, ticks }: { x: number; ticks?: string }) {
  return (
    <g>
      {metadataTickRects({
        x: x + 16,
        y: ENVELOPE.y,
        count: ENVELOPE.ticks,
      }).map((tick) => (
        <rect key={tick.x} {...tick} fill={BOUNDARY_STROKE} />
      ))}
      {ticks ? (
        <text x={x + 14} y={88} className="diagram-tick-label">
          {ticks}
        </text>
      ) : null}
      <path
        d={slabPath({
          x,
          y: ENVELOPE.y,
          width: ENVELOPE.width,
          height: ENVELOPE.height,
          shear: ENVELOPE.shear,
        })}
        fill={CIPHERTEXT_FILL}
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
        stroke={BOUNDARY_STROKE}
        strokeWidth={ARROW_STROKE_WIDTH}
        strokeDasharray="2 6"
      />
    </g>
  );
}

function Arrow({ x }: { x: number }) {
  return (
    <g fill={CARRIER_STROKE}>
      <rect x={x} y={161} width={30} height={ARROW_STROKE_WIDTH} />
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
        fill={CARRIER_STROKE}
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
