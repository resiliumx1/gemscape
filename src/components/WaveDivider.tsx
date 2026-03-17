interface WaveDividerProps {
  fillColor: string;
}

const WaveDivider = ({ fillColor }: WaveDividerProps) => (
  <div
    style={{
      position: "absolute",
      bottom: "-1px",
      left: "-5%",
      width: "110%",
      overflow: "visible",
      lineHeight: 0,
      zIndex: 3,
    }}
  >
    <svg
      className="wave-svg"
      viewBox="0 0 1440 45"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "45px", display: "block" }}
    >
      <path
        d="M0,18 C240,42 480,0 720,22 C960,44 1200,4 1440,18 L1440,45 L0,45 Z"
        fill={fillColor}
      />
      <path
        d="M0,22 C200,6 440,40 720,18 C1000,0 1240,38 1440,22 L1440,45 L0,45 Z"
        fill={fillColor}
        opacity="0.35"
      />
    </svg>
  </div>
);

export default WaveDivider;
