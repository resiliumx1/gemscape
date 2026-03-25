import { useEffect, useRef, useState, useCallback } from "react";
import WaveDivider from "@/components/WaveDivider";

type Stage = "playing" | "fadeVideo" | "ripple" | "curtain" | "done";

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState<Stage>("playing");
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Show skip button after 2s
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const triggerExit = useCallback(() => {
    if (stage !== "playing") return;
    setStage("fadeVideo");

    // Stage 1: fade video (400ms), Stage 2: ripple simultaneously (300ms)
    setTimeout(() => {
      setStage("ripple");
    }, 50);

    // Stage 3: curtain up after fade+ripple
    setTimeout(() => {
      setStage("curtain");
    }, 700);

    // Done — remove from DOM
    setTimeout(() => {
      sessionStorage.setItem("introPlayed", "true");
      setStage("done");
      onComplete();
    }, 1650);
  }, [stage, onComplete]);

  const skipIntro = useCallback(() => {
    setStage("curtain");
    setTimeout(() => {
      sessionStorage.setItem("introPlayed", "true");
      setStage("done");
      onComplete();
    }, 950);
  }, [onComplete]);

  if (stage === "done") return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#05181e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: stage === "curtain" ? "translateY(-100%)" : "translateY(0)",
        transition:
          stage === "curtain"
            ? "transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)"
            : "none",
      }}
    >
      {/* Wave background at bottom 35% */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "35%",
          pointerEvents: "none",
        }}
      >
        <WaveDivider variant="teal" height={9999} />
      </div>

      {/* Ripple effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 2,
            height: 2,
            borderRadius: "50%",
            boxShadow:
              stage === "ripple" || stage === "curtain"
                ? "0 0 120px 60px rgba(26,138,158,0.4)"
                : "0 0 0px rgba(26,138,158,0)",
            transition: "box-shadow 0.3s ease-out",
            opacity: stage === "curtain" ? 0 : 1,
          }}
        />
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={triggerExit}
        style={{
          position: "relative",
          zIndex: 2,
          width: "auto",
          height: "70vh",
          maxWidth: "80vw",
          objectFit: "contain",
          opacity: stage === "playing" ? 1 : 0,
          transition: "opacity 0.4s ease-out",
        }}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Skip button */}
      {showSkip && stage === "playing" && (
        <button
          onClick={skipIntro}
          style={{
            position: "absolute",
            bottom: 32,
            right: 32,
            zIndex: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "inherit",
            padding: "8px",
          }}
        >
          SKIP INTRO ›
        </button>
      )}
    </div>
  );
};

export default IntroSplash;
