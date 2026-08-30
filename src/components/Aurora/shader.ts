/**
 * The aurora as a GPU field. Same five colours, same two roles as the blob
 * version — but computed per-pixel: a domain-warped noise flow that drifts
 * on its own clock, leans with the page's travel, and quickens with scroll
 * velocity. The blob field remains the fallback wherever WebGL is missing.
 *
 * Renders at half resolution — the field is soft by nature, so the upscale
 * is invisible and the fill cost drops fourfold.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;   /* slow field clock, seconds            */
uniform float u_travel; /* section's progress through viewport  */
uniform float u_vel;    /* smoothed scroll velocity, 0..1       */
uniform vec2  u_ptr;    /* eased pointer, -1..1                 */

/* Brand colours (tokens.css), premultiplied to linear-ish taste. */
const vec3 PAPER  = vec3(0.988, 0.984, 0.973);
const vec3 SKY    = vec3(0.804, 0.867, 0.949);
const vec3 BUTTER = vec3(1.000, 0.973, 0.812);
const vec3 MINT   = vec3(0.369, 0.906, 0.773);
const vec3 VIOLET = vec3(0.235, 0.173, 0.761);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.3, 7.9);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 1.55;

  /* Scroll velocity feeds the clock and the warp — the field flows faster
     and folds harder while the page is moving, then settles. */
  float t = u_time * 0.045 + u_vel * u_time * 0.10;
  float warp = 2.2 + u_vel * 1.4;

  vec2 q = vec2(
    fbm(p + vec2(0.0, t)),
    fbm(p + vec2(5.2, t * 0.82))
  );
  vec2 r = vec2(
    fbm(p + warp * q + vec2(1.7 - u_ptr.x * 0.35, 9.2 + u_travel * 0.6)),
    fbm(p + warp * q + vec2(8.3, 2.8 + u_ptr.y * 0.35 - u_travel * 0.4))
  );
  float f = fbm(p + 2.6 * r);

  /* Sky carries the field, butter warms the folds, mint surfaces only in
     the crests, violet is a narrow deep seam. Tuned against a pixel-share
     probe: ~25% paper, ~50% sky, ~25% butter, mint scarce — colour is
     clearly present without becoming a saturated panel. */
  vec3 col = mix(PAPER, SKY, smoothstep(0.08, 0.46, f));
  col = mix(col, BUTTER, smoothstep(0.36, 0.66, fbm(p * 0.85 + r + 3.1)));
  col = mix(col, MINT, smoothstep(0.54, 0.80, f) * 0.75);
  col = mix(col, VIOLET, smoothstep(0.66, 0.78, q.y) * smoothstep(0.5, 0.7, f) * 0.22);

  /* Edges breathe back toward paper so the field reads as light arriving,
     not as a painted rectangle. */
  float edge = smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.68, uv.y);
  col = mix(mix(PAPER, col, 0.62), col, edge);

  /* A breath of dither so the soft ramps never band. */
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.010;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface AuroraGL {
  /** Draw one frame. Sizes the buffer to the canvas element as needed. */
  draw(time: number, travel: number, vel: number, px: number, py: number): void;
  dispose(): void;
}

/** Half-resolution backing store, capped DPR. */
const SCALE = 0.5;
const MAX_DPR = 1.5;

export function createAurora(canvas: HTMLCanvasElement): AuroraGL | null {
  const gl =
    canvas.getContext("webgl", { antialias: false, depth: false, stencil: false }) ??
    null;
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[aurora] shader:", gl.getShaderInfoLog(sh));
      }
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // one clipping triangle
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    travel: gl.getUniformLocation(prog, "u_travel"),
    vel: gl.getUniformLocation(prog, "u_vel"),
    ptr: gl.getUniformLocation(prog, "u_ptr"),
  };

  return {
    draw(time, travel, vel, px, py) {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(2, Math.round(canvas.clientWidth * SCALE * dpr));
      const h = Math.max(2, Math.round(canvas.clientHeight * SCALE * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.travel, travel);
      gl.uniform1f(u.vel, vel);
      gl.uniform2f(u.ptr, px, py);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      /* Deliberately does NOT lose the context: React StrictMode re-runs
         the owning effect on the same canvas, and a lost context can never
         be re-acquired. GL objects are freed; the context stays usable. */
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
