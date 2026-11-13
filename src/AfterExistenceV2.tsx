import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ================================================================== */
/* AFTER EXISTENCE — V2 (rich)                                        */
/*                                                                     */
/* Same 20s spine as v1, rebuilt as a layered world instead of a      */
/* flat card: parallax particle void, breathing nebula, a morphing     */
/* sigil, kinetic type with weight, an Evangelion-style interface     */
/* layer, film grain, scanlines, dust, and a camera that pushes       */
/* through the layers.                                                 */
/*                                                                     */
/* Inspiration (researched):                                           */
/*  - Severance titles (Oliver Latta): the design ENACTS the concept  */
/*    (split/mirrored space = fractured identity); slow, deliberate,   */
/*    unnerving motion; thin clinical type; "beautiful but a little    */
/*    off". Taken: the split-reality moment + slow dread pacing.       */
/*  - Evangelion (Anno): brutal type-only title cards, flashing       */
/*    type, and UI-as-storytelling — flickering status screens,        */
/*    cascading warnings, rotating diagrams, esoteric symbols (Tree    */
/*    of Life, glowing ring, red nebula). The opening ONBOARDS you     */
/*    emotionally before you understand anything. Taken: interface     */
/*    overlay, telemetry, rotating diagram ring, type flashes.         */
/*  - Glitch-art language: RGB split, slice displacement, signal      */
/*    loss, chromatic aberration — used as tears across DEPTH layers,  */
/*    not just on text.                                                */
/* ================================================================== */

const BG = "#050506";
const WHITE = "#f2f2f0";
const DIM = "#8f8f96";
const CYAN = "#7fd4ff";
const RED = "#ff2a55";
const FONT = "Arial, Helvetica, sans-serif";
const MONO = "Courier New, Courier, monospace";

/* ------------------------------------------------------------------ */
/* Deterministic helpers — pure functions of frame/seed. No random.   */
/* ------------------------------------------------------------------ */
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/* Glitch windows — moments where reality tears. */
const GLITCH_WINDOWS: Array<[number, number]> = [
  [16, 19],
  [41, 43],
  [66, 69],
  [104, 108],
  [138, 141],
  [178, 180],
  [224, 227],
  [262, 265],
  [296, 300],
  [332, 334],
  [382, 385],
  [428, 431],
  [470, 473],
  [506, 509],
  [528, 531],
  [548, 554],
];
const inGlitch = (frame: number): boolean =>
  GLITCH_WINDOWS.some(([s, e]) => frame >= s && frame <= e);

/* Split-reality windows — the frame itself divides (Severance). */
const SPLIT_WINDOWS: Array<[number, number]> = [
  [296, 300],
  [548, 554],
];
const inSplit = (frame: number): boolean =>
  SPLIT_WINDOWS.some(([s, e]) => frame >= s && frame <= e);

/* ------------------------------------------------------------------ */
/* LAYER 1 — Particle starfield void, 3 parallax depth layers.        */
/* ------------------------------------------------------------------ */
type Star = {
  x: number;
  y: number;
  size: number;
  layer: number;
  phase: number;
  cyan: boolean;
};

const STARS: Star[] = Array.from({ length: 170 }, (_, i) => ({
  x: hash(i * 3.7 + 11) * 1920,
  y: hash(i * 9.13 + 47) * 1080,
  size: 1 + hash(i * 5.3 + 3) * 2.4,
  layer: i % 3,
  phase: hash(i * 7.7 + 21) * Math.PI * 2,
  cyan: hash(i * 13.1 + 8) > 0.82,
}));

const Starfield: React.FC<{ frame: number }> = ({ frame }) => {
  /* Camera pushes through the void: far layer barely moves, near
     layer drifts fastest — parallax depth. */
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {STARS.map((s, i) => {
        const depth = [0.12, 0.3, 0.62][s.layer];
        const driftX = frame * 0.06 * depth;
        const driftY = frame * 0.03 * depth;
        const x = (((s.x + driftX) % 1920) + 1920) % 1920;
        const y = (((s.y + driftY) % 1080) + 1080) % 1080;
        const twinkle =
          0.35 + 0.65 * Math.abs(Math.sin(frame * 0.045 * (0.5 + depth) + s.phase));
        const opacity = (0.25 + depth * 0.6) * twinkle;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              backgroundColor: s.cyan ? CYAN : WHITE,
              opacity,
              boxShadow: s.cyan
                ? `0 0 ${s.size * 4}px rgba(127,212,255,0.8)`
                : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* LAYER 2 — Living background: breathing nebula + watching light.    */
/* ------------------------------------------------------------------ */
const Nebula: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = (seed: number, amp: number, speed: number) =>
    Math.sin(frame * speed + seed) * amp;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: 240 + drift(1.2, 60, 0.004),
          top: -260 + drift(4.4, 40, 0.003),
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,20,46,0.85) 0%, rgba(20,20,46,0.25) 45%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: 1150 + drift(7.7, 70, 0.003),
          top: 420 + drift(2.9, 50, 0.005),
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(127,212,255,0.10) 0%, rgba(127,212,255,0.03) 50%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          left: -160 + drift(9.1, 45, 0.005),
          top: 620 + drift(5.5, 35, 0.004),
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,42,85,0.06) 0%, transparent 65%)",
        }}
      />
      {/* The watching light: a cold glow that slowly pulses, as if
          something behind the dark is breathing. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 900px 500px at 50% 42%, rgba(127,212,255,0.07) 0%, transparent 70%)",
          opacity: 0.6 + 0.4 * Math.sin(frame * 0.018),
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* LAYER 3 — The sigil: a fractured ring + inner eye that assembles,  */
/* rotates, and breaks apart. (Evangelion's glowing ring / Tree of    */
/* Life diagram, rebuilt as After Existence's own mark.)              */
/* ------------------------------------------------------------------ */
const Sigil: React.FC<{ frame: number; baseOpacity?: number }> = ({
  frame,
  baseOpacity = 0.55,
}) => {
  /* Assembly 0–120: arcs draw themselves in. */
  const assemble = interpolate(frame, [0, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  /* Slow rotation, faster while assembling. */
  const rot = frame * 0.06 + assemble * 20;
  const rot2 = -frame * 0.04;
  /* Break apart on glitch frames: arcs jump and flicker. */
  const breaking = inGlitch(frame);
  const breakRot = breaking ? (hash(frame * 17 + 5) - 0.5) * 26 : 0;
  const breakOp = breaking ? 0.45 + 0.55 * hash(frame * 23 + 2) : 1;
  const fadeOut = interpolate(frame, [540, 560], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const R = 230;
  const C = 2 * Math.PI * R;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 620,
        height: 620,
        marginLeft: -310,
        marginTop: -310,
        opacity: baseOpacity * breakOp * fadeOut,
        transform: `rotate(${breakRot}deg)`,
      }}
    >
      <svg width="620" height="620" viewBox="0 0 620 620">
        <g transform="rotate(0 310 310)">
          {/* Outer fractured ring: three arcs with gaps. */}
          <circle
            cx="310"
            cy="310"
            r={R}
            fill="none"
            stroke={CYAN}
            strokeWidth="1.5"
            strokeDasharray={`${C * 0.28} ${C * 0.72}`}
            strokeDashoffset={C * (1 - assemble) * 0.28}
            opacity="0.7"
            transform={`rotate(${rot} 310 310)`}
          />
          <circle
            cx="310"
            cy="310"
            r={R}
            fill="none"
            stroke={WHITE}
            strokeWidth="1"
            strokeDasharray={`${C * 0.18} ${C * 0.82}`}
            strokeDashoffset={C * (1 - assemble) * 0.18}
            opacity="0.45"
            transform={`rotate(${rot2 + 120} 310 310)`}
          />
          <circle
            cx="310"
            cy="310"
            r={R}
            fill="none"
            stroke={RED}
            strokeWidth="1"
            strokeDasharray={`${C * 0.07} ${C * 0.93}`}
            strokeDashoffset={C * (1 - assemble) * 0.07}
            opacity="0.6"
            transform={`rotate(${-rot * 1.6 + 240} 310 310)`}
          />
          {/* Inner ring. */}
          <circle
            cx="310"
            cy="310"
            r={R * 0.62}
            fill="none"
            stroke={WHITE}
            strokeWidth="1"
            strokeDasharray={`${C * 0.62 * 0.4} ${C * 0.62 * 0.6}`}
            opacity="0.35"
            transform={`rotate(${rot * 0.5} 310 310)`}
          />
          {/* The eye: triangle + pupil. */}
          <polygon
            points="310,212 396,362 224,362"
            fill="none"
            stroke={CYAN}
            strokeWidth="1.5"
            opacity={0.8 * assemble}
            transform={`rotate(${rot * 0.25} 310 310)`}
          />
          <circle
            cx="310"
            cy="310"
            r={10 * assemble + 1}
            fill={CYAN}
            opacity={0.9 * assemble}
          />
          {/* Tick marks around the ring, like a dial. */}
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x1 = 310 + Math.cos(a) * (R + 14);
            const y1 = 310 + Math.sin(a) * (R + 14);
            const x2 = 310 + Math.cos(a) * (R + (i % 6 === 0 ? 34 : 24));
            const y2 = 310 + Math.sin(a) * (R + (i % 6 === 0 ? 34 : 24));
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={WHITE}
                strokeWidth={i % 6 === 0 ? 2 : 1}
                opacity={0.5 * assemble}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Glitch + flicker helpers (same language as v1, reused).             */
/* ------------------------------------------------------------------ */
const GlitchLayer: React.FC<{
  frame: number;
  intensity?: number;
  children: React.ReactNode;
}> = ({ frame, intensity = 1, children }) => {
  const glitching = inGlitch(frame) || intensity > 1;
  if (!glitching) {
    return <>{children}</>;
  }
  const dx = (hash(frame * 3 + 1) - 0.5) * 16 * intensity;
  const dy = (hash(frame * 7 + 2) - 0.5) * 6 * intensity;
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          opacity: 0.4,
          textShadow: `${dx * 0.5}px 0 rgba(255,42,85,0.85), ${
            -dx * 0.5
          }px 0 rgba(127,212,255,0.85)`,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "inset(6% 0 66% 0)",
          transform: `translate(${dx}px, ${dy}px)`,
          textShadow: `${dx * 0.7}px 0 rgba(255,42,85,0.9), ${
            -dx * 0.7
          }px 0 rgba(127,212,255,0.9)`,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "inset(64% 0 8% 0)",
          transform: `translate(${-dx}px, ${-dy}px)`,
          textShadow: `${-dx * 0.7}px 0 rgba(255,42,85,0.9), ${
            dx * 0.7
          }px 0 rgba(127,212,255,0.9)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Flicker: React.FC<{
  frame: number;
  children: React.ReactNode;
}> = ({ frame, children }) => {
  const opacity = inGlitch(frame) ? 0.45 + 0.55 * hash(frame * 5 + 9) : 1;
  return <div style={{ opacity }}>{children}</div>;
};

/* ------------------------------------------------------------------ */
/* ATMOSPHERE OVERLAYS — grain, scanlines, dust, vignette, tear bar.  */
/* ------------------------------------------------------------------ */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

const Atmosphere: React.FC<{ frame: number }> = ({ frame }) => {
  const split = inSplit(frame);
  const tearY = 180 + hash(Math.floor(frame / 4) * 31 + 7) * 700;
  const grainOp = inGlitch(frame) ? 0.1 : 0.055;
  return (
    <>
      {/* Film grain. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN_URI,
          opacity: grainOp,
          pointerEvents: "none",
        }}
      />
      {/* Scanlines. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 4px)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
      {/* Dust motes drifting through the light. */}
      {Array.from({ length: 26 }, (_, i) => {
        const x = hash(i * 17.3 + 2) * 1920;
        const y0 = hash(i * 29.7 + 5) * 1080;
        const y = (((y0 + frame * (0.12 + hash(i * 3.1) * 0.25)) % 1080) + 1080) % 1080;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 2 + hash(i * 7.7) * 2,
              height: 2 + hash(i * 7.7) * 2,
              borderRadius: "50%",
              backgroundColor: WHITE,
              opacity: 0.12 + 0.2 * Math.abs(Math.sin(frame * 0.03 + i)),
              pointerEvents: "none",
            }}
          />
        );
      })}
      {/* Vignette. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,0.72) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* The tear bar: during split windows a bright horizontal tear
          rips across the frame — the reality split, made visible. */}
      {split ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: tearY,
            height: 5,
            background:
              "linear-gradient(90deg, transparent, rgba(127,212,255,0.9) 20%, rgba(255,255,255,0.95) 50%, rgba(255,42,85,0.9) 80%, transparent)",
            boxShadow: "0 0 24px rgba(127,212,255,0.7)",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* INTERFACE OVERLAY — Evangelion-style telemetry + rotating diagram.  */
/* The system is watching the viewer back.                            */
/* ------------------------------------------------------------------ */
const InterfaceOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const sync = 81 + hash(Math.floor(frame / 12) * 7 + 1) * 14;
  const lineCount = Math.min(6, Math.floor(frame / 48));
  const lines = [
    "SYS.CHECK // IDENTITY ......... UNRESOLVED",
    "PERCEPTION.SYNC .............. " + sync.toFixed(1) + "%",
    "OBSERVER COUNT ............... 2  [MISMATCH]",
    "REALITY LAYER ................ 01 / 07",
    "SIGNAL INTEGRITY ............. DEGRADING",
    "DO NOT TRUST WHAT YOU SEE ....",
  ];
  const rot = frame * 0.5;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 48,
          color: CYAN,
          fontSize: 19,
          letterSpacing: 3,
          fontFamily: MONO,
          lineHeight: 1.9,
          opacity: 0.62,
        }}
      >
        {lines.slice(0, lineCount).map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {/* Rotating diagram ring, top-right. */}
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 44,
          width: 120,
          height: 120,
          opacity: 0.6,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={CYAN}
            strokeWidth="1"
            strokeDasharray="10 7"
            transform={`rotate(${rot} 60 60)`}
          />
          <circle
            cx="60"
            cy="60"
            r="38"
            fill="none"
            stroke={WHITE}
            strokeWidth="1"
            strokeDasharray="4 9"
            transform={`rotate(${-rot * 1.7} 60 60)`}
          />
          <circle cx="60" cy="60" r="3" fill={CYAN} />
          <line x1="60" y1="8" x2="60" y2="20" stroke={CYAN} strokeWidth="1.5" />
          <line x1="60" y1="100" x2="60" y2="112" stroke={CYAN} strokeWidth="1.5" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 52,
          color: CYAN,
          fontSize: 19,
          letterSpacing: 5,
          fontFamily: MONO,
          opacity: inGlitch(frame) ? 0.3 + 0.7 * hash(frame * 2 + 5) : 0.7,
        }}
      >
        SIGNAL // UNSTABLE
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 1 — frames 0–120: title forms with WEIGHT. Letters fall      */
/* from above on springs, the sigil assembles behind them, the        */
/* camera pushes through the particle layers.                         */
/* ------------------------------------------------------------------ */
const TITLE = "AFTER EXISTENCE";

const KineticTitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <div style={{ display: "flex", flexDirection: "row" }}>
    {TITLE.split("").map((ch, i) => {
      const delay = 8 + i * 3;
      const s = spring({
        frame: frame - delay,
        fps,
        config: { damping: 11, mass: 0.9, stiffness: 110 },
      });
      const y = interpolate(s, [0, 1], [-260, 0]);
      const rot = interpolate(s, [0, 1], [(hash(i * 7 + 1) - 0.5) * 24, 0]);
      const opacity = interpolate(s, [0, 0.35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      /* Letters overshoot slightly, then settle — they land hard. */
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity,
            transform: `translateY(${y}px) rotate(${rot}deg)`,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      );
    })}
  </div>
);

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [104, 119], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [46, 96], [0, 460], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subOpacity = interpolate(frame, [74, 94], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Flicker frame={frame}>
          <GlitchLayer frame={frame}>
            <div
              style={{
                color: WHITE,
                fontSize: 118,
                fontWeight: 800,
                fontFamily: FONT,
                letterSpacing: 10,
                lineHeight: 1,
                whiteSpace: "nowrap",
                textShadow: "0 0 60px rgba(127,212,255,0.25)",
              }}
            >
              <KineticTitle frame={frame} fps={fps} />
            </div>
          </GlitchLayer>
        </Flicker>
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: CYAN,
            marginTop: 44,
            boxShadow: "0 0 18px rgba(127,212,255,0.8)",
          }}
        />
        <div
          style={{
            color: DIM,
            fontSize: 26,
            letterSpacing: 12,
            fontFamily: FONT,
            marginTop: 30,
            opacity: subOpacity,
          }}
        >
          A N O V E L
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 2 — frames 120–360: fragments + interface + type flashes.    */
/* Evangelion's brutal type-only cards: a single word fills the       */
/* frame for a few frames, then vanishes.                             */
/* ------------------------------------------------------------------ */
const FragmentLine: React.FC<{
  frame: number;
  start: number;
  end: number;
  fontSize?: number;
  color?: string;
  children: React.ReactNode;
}> = ({ frame, start, end, fontSize = 58, color = WHITE, children }) => {
  const fadeIn = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [end - 12, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: Math.min(fadeIn, fadeOut),
        color,
        fontSize,
        fontFamily: FONT,
        textAlign: "center",
        lineHeight: 1.35,
        paddingLeft: 160,
        paddingRight: 160,
        textShadow: "0 0 40px rgba(127,212,255,0.18)",
      }}
    >
      <Flicker frame={frame}>
        <GlitchLayer frame={frame}>{children}</GlitchLayer>
      </Flicker>
    </div>
  );
};

/* A single-word flash card: huge, stark, gone in 9 frames. */
const FlashCard: React.FC<{
  frame: number;
  start: number;
  word: string;
}> = ({ frame, start, word }) => {
  const show = frame >= start && frame < start + 9;
  if (!show) return null;
  const opacity = interpolate(frame, [start, start + 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        opacity,
      }}
    >
      <div
        style={{
          color: WHITE,
          fontSize: 150,
          fontWeight: 900,
          fontFamily: FONT,
          letterSpacing: 26,
          transform: `scaleX(0.86)`,
        }}
      >
        {word}
      </div>
    </div>
  );
};

const NAMES = ["Xera", "Setya", "Putri", "Sheila", "Grahita"];

const NameFlash: React.FC<{
  frame: number;
  start: number;
  name: string;
}> = ({ frame, start, name }) => {
  const end = start + 16;
  const fadeIn = interpolate(frame, [start, start + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [end - 5, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jx = (hash(frame * 11 + 4) - 0.5) * 14;
  const jy = (hash(frame * 13 + 8) - 0.5) * 8;
  return (
    <div
      style={{
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translate(${jx}px, ${jy}px)`,
        color: CYAN,
        fontSize: 92,
        fontWeight: 700,
        fontFamily: FONT,
        letterSpacing: 20,
        textAlign: "center",
        textShadow: "0 0 44px rgba(127,212,255,0.45)",
      }}
    >
      <GlitchLayer frame={frame} intensity={1.8}>
        {name}
      </GlitchLayer>
    </div>
  );
};

const FragmentScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <InterfaceOverlay frame={frame} />
      {frame < 200 ? (
        <FragmentLine frame={frame} start={120} end={200}>
          What if the world you see...
        </FragmentLine>
      ) : null}
      {frame >= 200 && frame < 280 ? (
        <FragmentLine frame={frame} start={200} end={280} color={DIM}>
          ...isn&apos;t the same world I see.
        </FragmentLine>
      ) : null}
      {frame >= 280 && frame < 360
        ? NAMES.map((name, i) => {
            const start = 280 + i * 16;
            return frame >= start && frame < start + 16 ? (
              <NameFlash key={name} frame={frame} start={start} name={name} />
            ) : null;
          })
        : null}
      {/* Type flashes: a single word slams the frame, then is gone. */}
      <FlashCard frame={frame} start={196} word="SEE" />
      <FlashCard frame={frame} start={276} word="SAME" />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 3 — frames 360–540: tagline assembles with weight; the       */
/* sigil turns fully formed behind it; at 470–473 the frame SPLITS —  */
/* top and bottom halves divide and rejoin (Severance).               */
/* ------------------------------------------------------------------ */
const TAGLINE_LINE_1 = ["Your", "Perspective", "and", "Mine"];
const TAGLINE_LINE_2 = ["Aren't", "the", "Same."];

const TaglineWords: React.FC<{
  frame: number;
  fps: number;
  start: number;
  allVisible?: boolean;
}> = ({ frame, fps, start, allVisible = false }) => {
  const renderLine = (words: string[], lineOffset: number) => (
    <div
      style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}
    >
      {words.map((word, i) => {
        const index = lineOffset + i;
        const wStart = start + index * 16;
        const s = allVisible
          ? 1
          : spring({
              frame: frame - wStart,
              fps,
              config: { damping: 10, mass: 1, stiffness: 90 },
            });
        const opacity = allVisible
          ? 1
          : interpolate(s, [0, 0.3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
        const y = interpolate(s, [0, 1], [64, 0]);
        const scale = interpolate(s, [0, 1], [1.25, 1]);
        return (
          <span
            key={word}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px) scale(${scale})`,
              marginRight: i < words.length - 1 ? 24 : 0,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
  return (
    <div
      style={{
        color: WHITE,
        fontSize: 72,
        fontWeight: 700,
        fontFamily: FONT,
        lineHeight: 1.3,
        textAlign: "center",
        textShadow: "0 0 50px rgba(127,212,255,0.22)",
      }}
    >
      {renderLine(TAGLINE_LINE_1, 0)}
      {renderLine(TAGLINE_LINE_2, TAGLINE_LINE_1.length)}
    </div>
  );
};

const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [528, 539], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  /* The split: at 470–473 the two halves of the frame divide by a
     few pixels and rejoin — the self, split. */
  const splitShift = inSplit(frame) ? 14 : 0;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          transform: `translateY(${-splitShift}px)`,
          paddingLeft: 140,
          paddingRight: 140,
        }}
      >
        <Flicker frame={frame}>
          <GlitchLayer frame={frame}>
            <TaglineWords frame={frame} fps={fps} start={372} />
          </GlitchLayer>
        </Flicker>
      </div>
      {splitShift > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 2,
            backgroundColor: CYAN,
            boxShadow: "0 0 20px rgba(127,212,255,0.9)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 4 — frames 540–600: hold, violent glitch across ALL layers,  */
/* black cut, title lingers in the dark with the sigil faint behind.  */
/* ------------------------------------------------------------------ */
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame >= 558 && frame < 566) {
    return <AbsoluteFill style={{ backgroundColor: "#000000" }} />;
  }

  if (frame >= 566) {
    const opacity = interpolate(frame, [566, 586], [0, 0.55], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const flick = inGlitch(frame) ? 0.7 + 0.3 * hash(frame * 3) : 1;
    return (
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <Sigil frame={frame} baseOpacity={0.22} />
        <div
          style={{
            color: WHITE,
            fontSize: 46,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: 22,
            opacity: opacity * flick,
            textShadow: "0 0 32px rgba(127,212,255,0.35)",
          }}
        >
          AFTER EXISTENCE
        </div>
      </AbsoluteFill>
    );
  }

  const heavy = frame >= 552;
  const jitterX = heavy ? (hash(frame * 9 + 3) - 0.5) * 30 : 0;
  const jitterY = heavy ? (hash(frame * 13 + 7) - 0.5) * 16 : 0;
  const opacity = heavy ? 0.35 + 0.65 * hash(frame * 4 + 2) : 1;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `translate(${jitterX}px, ${jitterY}px)`,
          paddingLeft: 140,
          paddingRight: 140,
        }}
      >
        <GlitchLayer frame={frame} intensity={heavy ? 2.5 : 1}>
          <TaglineWords frame={frame} fps={fps} start={372} allVisible />
        </GlitchLayer>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* ASSEMBLY — depth camera: background layers push in faster than the  */
/* content, so the frame feels like moving THROUGH space.              */
/* ------------------------------------------------------------------ */
export const AfterExistenceV2Video: React.FC = () => {
  const frame = useCurrentFrame();
  /* Slow push-in, stronger on the far layers (parallax). */
  const bgScale = interpolate(frame, [0, 600], [1.0, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const midScale = interpolate(frame, [0, 600], [1.0, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const split = inSplit(frame);
  const frameShiftX = split ? (hash(frame * 19 + 1) - 0.5) * 22 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Far layer: nebula + particles, pushes fastest. */}
      <div
        style={{
          position: "absolute",
          inset: -60,
          transform: `scale(${bgScale}) translateX(${frameShiftX * 0.5}px)`,
        }}
      >
        <Nebula frame={frame} />
        <Starfield frame={frame} />
      </div>
      {/* Mid layer: the sigil, pushes slower. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${midScale})`,
          opacity: frame < 540 ? 1 : 0,
        }}
      >
        <Sigil frame={frame} />
      </div>
      {/* Content layer: scenes, unscaled — the eye stays steady while
          the world moves around it. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${frameShiftX}px)`,
        }}
      >
        {frame < 120 ? <TitleScene /> : null}
        {frame >= 120 && frame < 360 ? <FragmentScene /> : null}
        {frame >= 360 && frame < 540 ? <TaglineScene /> : null}
        {frame >= 540 ? <FinalScene /> : null}
      </div>
      <Atmosphere frame={frame} />
    </AbsoluteFill>
  );
};

export const AfterExistenceV2Composition = () => {
  return (
    <Composition
      id="AfterExistenceV2"
      component={AfterExistenceV2Video}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
