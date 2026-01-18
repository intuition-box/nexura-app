export default function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(circle at 80% 10%, rgba(102, 0, 153, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 20% 90%, rgba(48, 0, 96, 0.4) 0%, transparent 70%),
          linear-gradient(135deg, #000000 50%, #000000 50%)
        `,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        // REMOVE overlay blend mode
        // backgroundBlendMode: "overlay", 
        animation: "bg-pan 60s linear infinite",
      }}
    />
  );
}
