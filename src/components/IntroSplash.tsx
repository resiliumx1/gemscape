import { useEffect, useRef, useState, useCallback } from "react";
import WaveDivider from "@/components/WaveDivider";

type Stage = "playing" | "fadeVideo" | "ripple" | "curtain" | "done";

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState<Stage>("playing");
  const [showSkip, setShowSkip] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const [imgError, setImgError] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Show skip button after 2s
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss after 9s (full animation duration)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (stage === "playing") {
        sessionStorage.setItem("introPlayed", "true");
        setStage("done");
        onComplete();
      }
    }, 9000);
    return () => clearTimeout(timeout);
  }, [stage, onComplete]);

  const triggerExit = useCallback(() => {
    if (stage !== "playing") return;
    setStage("fadeVideo");

    setTimeout(() => {
      setStage("ripple");
    }, 50);

    setTimeout(() => {
      setStage("curtain");
    }, 700);

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

  const handleImgError = useCallback(() => {
    setImgError(true);
    setTimeout(() => {
      sessionStorage.setItem("introPlayed", "true");
      setStage("curtain");
      setTimeout(() => {
        setStage("done");
        onComplete();
      }, 950);
    }, 3000);
  }, [onComplete]);

  if (stage === "done") return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#ffffff",
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

      {/* Logo fallback — shows until image is ready */}
      <img
        src="/images/gemscape-logo.png"
        alt="Gemscape Travel and Tours"
        className="bg-transparent"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: 80,
          width: "auto",
          zIndex: 1,
          opacity: (stage === "playing" && !imgReady) || imgError ? 1 : 0,
          transition: "opacity 0.4s ease-out",
          pointerEvents: "none",
          background: "none",
          backgroundColor: "transparent",
        }}
      />

      {/* Animated WebP — plays natively, no autoplay policy issues */}
      <img
        src="/images/intro.webp"
        alt=""
        aria-hidden="true"
        onLoad={() => setImgReady(true)}
        onError={handleImgError}
        style={{
          position: "relative",
          zIndex: 2,
          width: "auto",
          height: "60vh",
          maxWidth: "80vw",
          objectFit: "contain",
          opacity: imgReady && !imgError ? 1 : 0,
          transition: "opacity 0.4s ease-out",
        }}
      />

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
            color: "rgba(0,0,0,0.35)",
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
