export default function HomeBackground() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(circle at 10% 15%, rgba(120, 0, 180, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(90, 0, 150, 0.10) 0%, transparent 45%),
          linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.85) 100%)
        `,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
  );
}
