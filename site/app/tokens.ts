import tokens from "@open-e2ee/design/tokens";

/*
 * The reference site reads the published token file rather than restating any
 * value. A swatch that disagrees with the package would be worse than no
 * swatch at all.
 */
export const primitives = tokens.primitives;
export const geometry = tokens.geometry;

export type Ramp = { name: string; role: string; steps: [string, string][] };

const ramp = (name: string, role: string): Ramp => ({
  name,
  role,
  steps: Object.entries(
    (primitives.color as Record<string, Record<string, string>>)[name],
  ),
});

export const ramps: Ramp[] = [
  ramp("paper", "Canvas, surfaces, text, borders"),
  ramp("ultra", "Action: links, focus, accent"),
  ramp("seal", "Metadata and the trust boundary"),
  ramp("verify", "Verified state"),
  ramp("alert", "Danger and failure"),
];
