import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DEEP = "#0A4D8C";
const MID = "#0B5FA5";
const LIGHT = "#7FB8E8";
const PALE = "#BFE0F7";
const AQUA = "#5ED3F3";
const WHITE = "#FFFFFF";
const SOFT = "#D6EAFB";

const FONT = "Arial, Helvetica, sans-serif";

/* Deterministic pseudo-random from a seed (pure function, no Math.random). */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- Shared background: gradient sky, waves, bubbles, bokeh ---------- */

const BUBBLES = Array.from({ length: 46 }, (_, i) => ({
  x: rand(i + 1) * 1920,
  r: 5 + rand(i + 101) * 24,
  speed: 0.6 + rand(i + 201) * 1.6,
  offset: rand(i + 301) * 900,
  opacity: 0.15 + rand(i + 401) * 0.35,
}));

const BOKEH = Array.from({ length: 8 }, (_, i) => ({
  x: rand(i + 901) * 1920,
  y: rand(i + 1001) * 1080,
  r: 60 + rand(i + 1101) * 90,
  speed: 0.15 + rand(i + 1201) * 0.3,
  offset: rand(i + 1301) * 900,
  opacity: 0.05 + rand(i + 1401) * 0.06,
  aqua: rand(i + 1501) > 0.5,
}));

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  x: rand(i + 501) * 1920,
  y: rand(i + 601) * 1080,
  size: 10 + rand(i + 701) * 14,
  phase: rand(i + 801) * 60,
}));

const Waves: React.FC<{ frame: number; baseY: number }> = ({
  frame,
  baseY,
}) => {
  const buildPath = (
    phase: number,
    amp: number,
    wavelength: number,
  ): string => {
    let d = `M 0 ${baseY}`;
    for (let x = 0; x <= 1920; x += 48) {
      const y =
        baseY +
        Math.sin((x + frame * 2.2 + phase) / wavelength) * amp +
        Math.sin((x * 0.5 + frame * 1.1 + phase) / 90) * amp * 0.4;
      d += ` L ${x} ${y.toFixed(1)}`;
    }
    d += ` L 1920 1080 L 0 1080 Z`;
    return d;
  };

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <path d={buildPath(0, 26, 260)} fill={MID} opacity={0.55} />
      <path d={buildPath(180, 34, 200)} fill={LIGHT} opacity={0.45} />
      <path d={buildPath(360, 22, 320)} fill={PALE} opacity={0.5} />
      <path d={buildPath(540, 18, 380)} fill={WHITE} opacity={0.16} />
      <path d={buildPath(720, 14, 460)} fill={AQUA} opacity={0.16} />
    </svg>
  );
};

const Bubbles: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {BUBBLES.map((b, i) => {
        const travel = ((frame * b.speed + b.offset) % 1150) + 60;
        const y = 1080 - travel;
        const wobble = Math.sin((frame + b.offset) / 40) * 14;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x + wobble,
              top: y,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: "50%",
              border: `2px solid rgba(255,255,255,${b.opacity})`,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
        );
      })}
    </>
  );
};

const Bokeh: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {BOKEH.map((b, i) => {
        const travel = ((frame * b.speed + b.offset) % 1250) + 40;
        const y = 1120 - travel;
        const wobble = Math.sin((frame + b.offset) / 60) * 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x + wobble - b.r,
              top: y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${
                b.aqua
                  ? `rgba(94,211,243,${b.opacity + 0.05})`
                  : `rgba(255,255,255,${b.opacity})`
              } 0%, rgba(255,255,255,0) 70%)`,
            }}
          />
        );
      })}
    </>
  );
};

const Sparkles: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {SPARKLES.map((s, i) => {
        const opacity = 0.2 + 0.35 * (0.5 + 0.5 * Math.sin((frame + s.phase) / 24));
        const y = s.y + Math.sin((frame + s.phase) / 40) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: y,
              width: s.size,
              height: s.size,
              opacity,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: s.size / 2 - 1,
                width: s.size,
                height: 2,
                backgroundColor: PALE,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: s.size / 2 - 1,
                height: s.size,
                width: 2,
                backgroundColor: PALE,
              }}
            />
          </div>
        );
      })}
    </>
  );
};

const LightGlow: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: -260,
        right: -180,
        width: 760,
        height: 760,
        background:
          "radial-gradient(circle, rgba(94,211,243,0.35) 0%, rgba(94,211,243,0.08) 45%, rgba(94,211,243,0) 70%)",
      }}
    />
    {[-32, -12, 8, 28].map((deg, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          top: 110,
          right: 90,
          width: 10,
          height: 520,
          transform: `rotate(${deg}deg)`,
          transformOrigin: "top center",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0))",
        }}
      />
    ))}
  </>
);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #06396B 0%, ${DEEP} 45%, ${MID} 100%)`,
      }}
    >
      <LightGlow />
      <Bokeh frame={frame} />
      <Sparkles frame={frame} />
      <Bubbles frame={frame} />
      <Waves frame={frame} baseY={830} />
    </AbsoluteFill>
  );
};

/* ---------- Hand-drawn inline SVG icons (no external assets) ---------- */

type IconProps = { size: number };

const svgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 120 120",
  fill: "none",
  stroke: WHITE,
  strokeWidth: 6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/* Stylized pool: sun + three wave lines. */
const PoolIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <circle cx={94} cy={24} r={9} />
    <path d="M18 62 q9 -9 18 0 t18 0 t18 0 t18 0 t18 0" />
    <path d="M18 78 q9 -9 18 0 t18 0 t18 0 t18 0 t18 0" />
    <path d="M18 94 q9 -9 18 0 t18 0 t18 0 t18 0 t18 0" />
  </svg>
);

/* Privacy: padlock with keyhole. */
const LockIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <rect x={38} y={56} width={44} height={40} rx={10} />
    <path d="M48 56 V46 a12 12 0 0 1 24 0 V56" />
    <circle cx={60} cy={71} r={5} fill={WHITE} stroke="none" />
    <path d="M60 76 V84" />
  </svg>
);

/* Health: heart with a pulse line. */
const HeartPulseIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <path
      d="M60 102 C34 80 24 60 32 46 C38 35 52 33 60 44 C68 33 82 35 88 46 C96 60 86 80 60 102 Z"
      fill="rgba(255,255,255,0.10)"
    />
    <polyline points="34,64 48,64 54,52 63,76 69,64 86,64" stroke={AQUA} />
  </svg>
);

/* Family: two adults and a child in front. */
const FamilyIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <circle cx={38} cy={38} r={11} />
    <path d="M22 84 A16 16 0 0 1 54 84" />
    <circle cx={82} cy={38} r={11} />
    <path d="M66 84 A16 16 0 0 1 98 84" />
    <circle cx={60} cy={60} r={9} />
    <path d="M48 94 A12 12 0 0 1 72 94" />
  </svg>
);

/* Anytime: clock with a sun and a crescent moon. */
const ClockIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <path
      d="M26 10 A14 14 0 1 0 26 38 Z"
      fill="rgba(255,255,255,0.9)"
      stroke="none"
    />
    <circle cx={96} cy={24} r={10} stroke={AQUA} fill="rgba(94,211,243,0.2)" />
    <path
      d="M96 7 V13 M113 24 H107 M108 12 L104 16 M108 36 L104 32"
      stroke={AQUA}
    />
    <circle cx={60} cy={68} r={32} />
    <path d="M60 68 V50 M60 68 L73 74" />
  </svg>
);

/* Clean water: droplet with a checkmark. */
const DropletIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <path
      d="M60 14 C60 14 32 50 32 70 a28 28 0 0 0 56 0 C88 50 60 14 60 14 Z"
      fill="rgba(255,255,255,0.10)"
    />
    <polyline points="47,70 57,80 75,60" stroke={AQUA} strokeWidth={7} />
  </svg>
);

/* Home value: house with a rising trend arrow. */
const HouseIcon: React.FC<IconProps> = ({ size }) => (
  <svg {...svgProps(size)}>
    <path d="M26 62 L60 32 L94 62" />
    <path d="M34 56 V92 H86 V56" />
    <path d="M53 92 V76 h14 V92" />
    <polyline points="66,50 78,38 86,44 100,26" stroke={AQUA} />
    <polyline points="91,26 100,26 100,35" stroke={AQUA} />
  </svg>
);

const ICONS: Record<string, React.FC<IconProps>> = {
  pool: PoolIcon,
  lock: LockIcon,
  heart: HeartPulseIcon,
  family: FamilyIcon,
  clock: ClockIcon,
  droplet: DropletIcon,
  house: HouseIcon,
};

/* Icon inside decorative rings + sparkles, springing in and gently floating. */
const IconBadge: React.FC<{
  frame: number;
  fps: number;
  size: number;
  delay?: number;
  children: React.ReactNode;
}> = ({ frame, fps, size, delay = 0, children }) => {
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, stiffness: 110 },
  });
  const scale = interpolate(p, [0, 1], [0.6, 1]);
  const opacity = interpolate(p, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const floatY = Math.sin(frame / 28) * 7;
  const ringRot = frame * 0.35;
  const sparkle = 0.4 + 0.35 * Math.sin(frame / 20);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${scale})`,
        opacity,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -26,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.28)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -46,
          borderRadius: "50%",
          border: "2px dashed rgba(127,184,232,0.5)",
          transform: `rotate(${ringRot}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -62,
          top: -34,
          width: 16,
          height: 16,
          opacity: sparkle,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 7,
            width: 16,
            height: 2,
            backgroundColor: AQUA,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 7,
            height: 16,
            width: 2,
            backgroundColor: AQUA,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: -58,
          bottom: -30,
          width: 12,
          height: 12,
          opacity: sparkle,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 5,
            width: 12,
            height: 2,
            backgroundColor: PALE,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 5,
            height: 12,
            width: 2,
            backgroundColor: PALE,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${floatY}px)`,
          filter: "drop-shadow(0 0 16px rgba(94,211,243,0.5))",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- Small helpers ---------- */

const Kicker: React.FC<{ text: string; color?: string }> = ({
  text,
  color = AQUA,
}) => (
  <div
    style={{
      color,
      fontSize: 30,
      letterSpacing: 12,
      fontWeight: 700,
      fontFamily: FONT,
      marginBottom: 28,
    }}
  >
    {text}
  </div>
);

const WordReveal: React.FC<{
  words: string[];
  frame: number;
  fps: number;
  fontSize: number;
  color?: string;
  delayPerWord?: number;
  align?: "center" | "left";
}> = ({
  words,
  frame,
  fps,
  fontSize,
  color = WHITE,
  delayPerWord = 7,
  align = "center",
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: align === "left" ? "flex-start" : "center",
      gap: 24,
    }}
  >
    {words.map((w, i) => {
      const p = spring({
        frame: frame - i * delayPerWord,
        fps,
        config: { damping: 12, stiffness: 120 },
      });
      const y = interpolate(p, [0, 1], [70, 0]);
      const opacity = interpolate(p, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: `translateY(${y}px)`,
            opacity,
            color,
            fontSize,
            fontWeight: 800,
            fontFamily: FONT,
            lineHeight: 1.08,
          }}
        >
          {w}
        </span>
      );
    })}
  </div>
);

/* ---------- Scenes ---------- */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [100, 119], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sub = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [55, 80], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
        paddingLeft: 140,
        paddingRight: 140,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 48 }}>
          <IconBadge frame={frame} fps={fps} size={210}>
            <PoolIcon size={210} />
          </IconBadge>
        </div>
        <Kicker text="YOUR OWN WATER &nbsp;•&nbsp; YOUR OWN TIME" />
        <WordReveal
          words={["Why", "You", "Need", "a", "Private", "Pool"]}
          frame={frame}
          fps={fps}
          fontSize={104}
        />
        <div
          style={{
            opacity: sub,
            transform: `translateY(${subY}px)`,
            color: SOFT,
            fontSize: 36,
            fontFamily: FONT,
            marginTop: 40,
          }}
        >
          Your own place to breathe, swim, and slow down.
        </div>
      </div>
    </AbsoluteFill>
  );
};

type Benefit = {
  num: string;
  kicker: string;
  headline: string[];
  body: string;
  icon: string;
};

const BENEFITS: Benefit[] = [
  {
    num: "01",
    kicker: "PRIVACY",
    headline: ["Your Pool.", "Your Peace."],
    body: "Swim on your own time — no crowds, no waiting, no strangers.",
    icon: "lock",
  },
  {
    num: "02",
    kicker: "HEALTH & FITNESS",
    headline: ["A Workout That", "Feels Like Play"],
    body: "Swimming is a full-body, low-impact workout — right at home.",
    icon: "heart",
  },
  {
    num: "03",
    kicker: "FAMILY TIME",
    headline: ["Where the", "Family Gathers"],
    body: "Your backyard becomes the place everyone wants to be.",
    icon: "family",
  },
  {
    num: "04",
    kicker: "SWIM ANYTIME",
    headline: ["Morning. Evening.", "Whenever."],
    body: "Your pool, your schedule — swim when you want, as long as you want.",
    icon: "clock",
  },
  {
    num: "05",
    kicker: "CLEAN WATER, YOUR CONTROL",
    headline: ["Clean Water,", "Your Rules"],
    body: "You decide the hygiene and care of your own water.",
    icon: "droplet",
  },
  {
    num: "06",
    kicker: "HOME VALUE",
    headline: ["A Home That", "Stands Out"],
    body: "A well-built private pool lifts the appeal and value of your home.",
    icon: "house",
  },
];

const BenefitScene: React.FC<{ benefit: Benefit; startFrame: number }> = ({
  benefit,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const fadeIn = interpolate(local, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(local, [95, 109], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bodyIn = interpolate(local, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bodyY = interpolate(local, [45, 65], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const numProgress = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const numScale = interpolate(numProgress, [0, 1], [0.7, 1]);
  const Icon = ICONS[benefit.icon];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        paddingLeft: 150,
        paddingRight: 150,
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.14)",
          fontSize: 300,
          fontWeight: 800,
          fontFamily: FONT,
          position: "absolute",
          right: 120,
          top: 60,
          transform: `scale(${numScale})`,
          lineHeight: 1,
        }}
      >
        {benefit.num}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 70,
        }}
      >
        <IconBadge frame={local} fps={fps} size={260} delay={5}>
          <Icon size={260} />
        </IconBadge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Kicker text={benefit.kicker} />
          <WordReveal
            words={benefit.headline.join(" ").split(" ")}
            frame={local}
            fps={fps}
            fontSize={92}
            delayPerWord={6}
            align="left"
          />
          <div
            style={{
              opacity: bodyIn,
              transform: `translateY(${bodyY}px)`,
              color: SOFT,
              fontSize: 38,
              fontFamily: FONT,
              marginTop: 44,
              maxWidth: 1050,
              lineHeight: 1.35,
            }}
          >
            {benefit.body}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - 780;
  const fadeIn = interpolate(local, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = 0.5 + Math.sin(local / 12) * 0.25;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
        paddingLeft: 140,
        paddingRight: 140,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <IconBadge frame={local} fps={fps} size={150}>
            <PoolIcon size={150} />
          </IconBadge>
        </div>
        <Kicker text="READY WHEN YOU ARE" />
        <WordReveal
          words={["Build", "Yours", "with"]}
          frame={local}
          fps={fps}
          fontSize={84}
        />
        <div
          style={{
            color: WHITE,
            fontSize: 120,
            fontWeight: 800,
            fontFamily: FONT,
            marginTop: 18,
            textShadow: `0 0 ${Math.round(30 + glow * 40)}px rgba(94,211,243,${
              0.45 + glow * 0.3
            })`,
          }}
        >
          Trijayapool.com
        </div>
        <div
          style={{
            color: SOFT,
            fontSize: 38,
            fontFamily: FONT,
            marginTop: 36,
            opacity: interpolate(local, [50, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Your private pool starts here.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProgressShimmer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = (frame / durationInFrames) * 100;
  const shimmer = (frame % 60) / 60;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 12,
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${AQUA}, #FFFFFF)`,
        opacity: 0.7 + shimmer * 0.3,
      }}
    />
  );
};

/* Thin framed border + aqua corner ornaments, on top of everything. */
const Frame: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 26,
        border: "2px solid rgba(255,255,255,0.20)",
        borderRadius: 28,
        pointerEvents: "none",
      }}
    />
    {[
      { top: 18, left: 18, borderBottom: "none", borderRight: "none" },
      { top: 18, right: 18, borderBottom: "none", borderLeft: "none" },
      { bottom: 18, left: 18, borderTop: "none", borderRight: "none" },
      { bottom: 18, right: 18, borderTop: "none", borderLeft: "none" },
    ].map((pos, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: 46,
          height: 46,
          border: `3px solid ${AQUA}`,
          ...pos,
        }}
      />
    ))}
  </>
);

export const PrivatePoolVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      {frame < 120 ? <HookScene /> : null}
      {BENEFITS.map((b, i) => {
        const start = 120 + i * 110;
        return frame >= start && frame < start + 110 ? (
          <BenefitScene key={b.num} benefit={b} startFrame={start} />
        ) : null;
      })}
      {frame >= 780 ? <CtaScene /> : null}
      <Frame />
      <ProgressShimmer />
    </AbsoluteFill>
  );
};

export const PrivatePoolComposition = () => {
  return (
    <Composition
      id="PrivatePool"
      component={PrivatePoolVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
