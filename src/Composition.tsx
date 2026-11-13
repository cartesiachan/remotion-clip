import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DARK = "#0b0b0c";
const WHITE = "#ffffff";
const GRAY = "#9a9a9e";
const ACCENT = "#f5c518";

const CALLOUTS = [
  {
    num: "01",
    title: "Muse Spark 1.3",
    body: "Outranks Gemini Flash, DeepSeek and GLM on the latest board.",
  },
  {
    num: "02",
    title: "Diffusion vs Autoregressive",
    body: "Mercury refines in parallel. Classic LLMs write left to right.",
  },
  {
    num: "03",
    title: "How computers work",
    body: "One keypress crosses 7 layers to reach the screen.",
  },
];

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [130, 149], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = spring({ frame, fps, config: { damping: 100 } });
  const y = interpolate(rise, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK,
        justifyContent: "center",
        alignItems: "center",
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <div
        style={{
          transform: `translateY(${y}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: ACCENT,
            fontSize: 34,
            letterSpacing: 14,
            fontFamily: "Arial, sans-serif",
            marginBottom: 28,
          }}
        >
          THE EXPLORATION LAB
        </div>
        <div
          style={{
            color: WHITE,
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          How code
          <br />
          becomes video
        </div>
        <div
          style={{
            color: GRAY,
            fontSize: 36,
            fontFamily: "Arial, sans-serif",
            marginTop: 36,
          }}
        >
          One day of rabbit holes: LLMs, diffusion and computers
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CalloutsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - 150;
  const fadeOut = interpolate(frame, [315, 329], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK,
        justifyContent: "center",
        paddingLeft: 180,
        paddingRight: 180,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          color: ACCENT,
          fontSize: 30,
          letterSpacing: 10,
          fontFamily: "Arial, sans-serif",
          marginBottom: 40,
        }}
      >
        WHAT WE FOUND TODAY
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        {CALLOUTS.map((c, i) => {
          const start = i * 60;
          const progress = spring({
            frame: local - start,
            fps,
            config: { damping: 100 },
          });
          const opacity = interpolate(progress, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(progress, [0, 1], [60, 0]);
          return (
            <div
              key={c.num}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: 32,
              }}
            >
              <div
                style={{
                  color: ACCENT,
                  fontSize: 44,
                  fontWeight: 800,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {c.num}
              </div>
              <div>
                <div
                  style={{
                    color: WHITE,
                    fontSize: 52,
                    fontWeight: 700,
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    color: GRAY,
                    fontSize: 34,
                    fontFamily: "Arial, sans-serif",
                    marginTop: 8,
                  }}
                >
                  {c.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - 330;
  const fadeIn = interpolate(local, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = spring({ frame: local, fps, config: { damping: 100 } });
  const y = interpolate(rise, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          transform: `translateY(${y}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: WHITE,
            fontSize: 88,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
          }}
        >
          Code is the new camera.
        </div>
        <div
          style={{
            color: GRAY,
            fontSize: 36,
            fontFamily: "Arial, sans-serif",
            marginTop: 30,
          }}
        >
          Every frame is a function of time.
        </div>
        <div
          style={{
            color: ACCENT,
            fontSize: 40,
            fontWeight: 700,
            fontFamily: "Arial, sans-serif",
            marginTop: 60,
            letterSpacing: 6,
          }}
        >
          KEEP EXPLORING
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 10,
        width: `${(frame / durationInFrames) * 100}%`,
        backgroundColor: ACCENT,
      }}
    />
  );
};

export const ExplorationLabVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      {frame < 150 ? <TitleScene /> : null}
      {frame >= 150 && frame < 330 ? <CalloutsScene /> : null}
      {frame >= 330 ? <OutroScene /> : null}
      <ProgressBar />
    </AbsoluteFill>
  );
};

export const ExplorationLabComposition = () => {
  return (
    <Composition
      id="ExplorationLab"
      component={ExplorationLabVideo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
