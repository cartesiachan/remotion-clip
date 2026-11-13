import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
} from "remotion";

const BG = "#050506";
const WHITE = "#f2f2f0";
const DIM = "#8f8f96";
const CYAN = "#7fd4ff";
const FONT = "Arial, Helvetica, sans-serif";

/* ------------------------------------------------------------------ */
/* Deterministic helpers — pure functions of the frame number.         */
/* No Math.random(): the same frame always renders the same picture.   */
/* ------------------------------------------------------------------ */
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/* Short windows where reality "tears". */
const GLITCH_WINDOWS: Array<[number, number]> = [
  [16, 19],
  [41, 43],
  [66, 69],
  [104, 108],
  [138, 141],
  [178, 180],
  [224, 227],
  [262, 265],
  [298, 301],
  [332, 334],
  [382, 385],
  [428, 431],
  [470, 473],
  [506, 509],
  [528, 531],
];

const inGlitch = (frame: number): boolean =>
  GLITCH_WINDOWS.some(([s, e]) => frame >= s && frame <= e);

/* ------------------------------------------------------------------ */
/* GlitchLayer: on glitch frames, overlays two horizontally sliced,    */
/* RGB-split copies of its children, displaced from the original.      */
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

/* Opacity dips irregularly on glitch frames, like a losing signal. */
const Flicker: React.FC<{
  frame: number;
  children: React.ReactNode;
}> = ({ frame, children }) => {
  const opacity = inGlitch(frame) ? 0.45 + 0.55 * hash(frame * 5 + 9) : 1;
  return <div style={{ opacity }}>{children}</div>;
};

/* ------------------------------------------------------------------ */
/* Scene 1 — frames 0–120 (0–4s): the title forms out of the void.     */
/* ------------------------------------------------------------------ */
const TITLE = "AFTER EXISTENCE";

const TitleLetters: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", flexDirection: "row" }}>
    {TITLE.split("").map((ch, i) => {
      const start = 10 + i * 3;
      const opacity = interpolate(frame, [start, start + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const y = interpolate(frame, [start, start + 12], [26, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity,
            transform: `translateY(${y}px)`,
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
  /* Slow push inward, like falling into the void. */
  const scale = interpolate(frame, [0, 120], [1.0, 1.09], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [104, 119], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [42, 92], [0, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [42, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
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
              }}
            >
              <TitleLetters frame={frame} />
            </div>
          </GlitchLayer>
        </Flicker>
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: CYAN,
            marginTop: 44,
            opacity: lineOpacity,
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
/* Scene 2 — frames 120–360 (4–12s): fragments appear and dissolve.   */
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
      }}
    >
      <Flicker frame={frame}>
        <GlitchLayer frame={frame}>{children}</GlitchLayer>
      </Flicker>
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
  const jx = (hash(frame * 11 + 4) - 0.5) * 10;
  const jy = (hash(frame * 13 + 8) - 0.5) * 6;
  return (
    <div
      style={{
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translate(${jx}px, ${jy}px)`,
        color: CYAN,
        fontSize: 84,
        fontWeight: 700,
        fontFamily: FONT,
        letterSpacing: 18,
        textAlign: "center",
      }}
    >
      <GlitchLayer frame={frame} intensity={1.6}>
        {name}
      </GlitchLayer>
    </div>
  );
};

const FragmentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const signalOpacity = inGlitch(frame)
    ? 0.3 + 0.7 * hash(frame * 2 + 5)
    : 0.75;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 56,
          color: CYAN,
          fontSize: 22,
          letterSpacing: 6,
          fontFamily: "Courier New, Courier, monospace",
          opacity: signalOpacity,
        }}
      >
        SIGNAL // UNSTABLE
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 — frames 360–540 (12–18s): the tagline assembles.          */
/* ------------------------------------------------------------------ */
const TAGLINE_LINE_1 = ["Your", "Perspective", "and", "Mine"];
const TAGLINE_LINE_2 = ["Aren't", "the", "Same."];

const TaglineWords: React.FC<{
  frame: number;
  start: number;
  allVisible?: boolean;
}> = ({ frame, start, allVisible = false }) => {
  const renderLine = (words: string[], lineOffset: number) => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {words.map((word, i) => {
        const index = lineOffset + i;
        const wStart = start + index * 16;
        const opacity = allVisible
          ? 1
          : interpolate(frame, [wStart, wStart + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
        const y = allVisible
          ? 0
          : interpolate(frame, [wStart, wStart + 12], [22, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
        return (
          <span
            key={word}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px)`,
              marginRight: i < words.length - 1 ? 22 : 0,
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
        fontSize: 68,
        fontWeight: 700,
        fontFamily: FONT,
        lineHeight: 1.3,
        textAlign: "center",
      }}
    >
      {renderLine(TAGLINE_LINE_1, 0)}
      {renderLine(TAGLINE_LINE_2, TAGLINE_LINE_1.length)}
    </div>
  );
};

const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [528, 539], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div style={{ paddingLeft: 140, paddingRight: 140 }}>
        <Flicker frame={frame}>
          <GlitchLayer frame={frame}>
            <TaglineWords frame={frame} start={372} />
          </GlitchLayer>
        </Flicker>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 4 — frames 540–600 (18–20s): hold, one final glitch, black,  */
/* then the title lingers faintly in the dark.                        */
/* ------------------------------------------------------------------ */
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();

  /* 558–566: pure black cut. */
  if (frame >= 558 && frame < 566) {
    return <AbsoluteFill style={{ backgroundColor: "#000000" }} />;
  }

  /* 566–600: the title lingers, faint, in the dark. */
  if (frame >= 566) {
    const opacity = interpolate(frame, [566, 586], [0, 0.55], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const flick = inGlitch(frame) ? 0.7 + 0.3 * hash(frame * 3) : 1;
    return (
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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

  /* 540–552: tagline holds. 552–558: one violent glitch. */
  const heavy = frame >= 552;
  const jitterX = heavy ? (hash(frame * 9 + 3) - 0.5) * 24 : 0;
  const jitterY = heavy ? (hash(frame * 13 + 7) - 0.5) * 12 : 0;
  const opacity = heavy ? 0.35 + 0.65 * hash(frame * 4 + 2) : 1;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
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
          <TaglineWords frame={frame} start={372} allVisible />
        </GlitchLayer>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.6) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const AfterExistenceVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {frame < 120 ? <TitleScene /> : null}
      {frame >= 120 && frame < 360 ? <FragmentScene /> : null}
      {frame >= 360 && frame < 540 ? <TaglineScene /> : null}
      {frame >= 540 ? <FinalScene /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

export const AfterExistenceComposition = () => {
  return (
    <Composition
      id="AfterExistence"
      component={AfterExistenceVideo}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
