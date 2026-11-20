/** Reliable course art — CSS/SVG inline, no external image request. */
export function CourseCover({
  title,
  className = "",
}: {
  title?: string | null;
  className?: string;
}) {
  const short =
    title?.includes("Python")
      ? "6.100L"
      : title?.includes("Linear")
        ? "LinAlg"
        : title
          ? title.slice(0, 18)
          : "OSSU";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(circle at 22% 18%, #2aa39a 0%, transparent 42%), linear-gradient(165deg, #0e6b66 0%, #0a3f3d 70%)",
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 320 400"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="36" y="72" width="248" height="168" rx="18" fill="#fffaf3" opacity="0.94" />
        <text x="56" y="128" fill="#0a3f3d" fontFamily="ui-monospace, monospace" fontSize="22">
          def learn():
        </text>
        <text x="72" y="168" fill="#0e6b66" fontFamily="ui-monospace, monospace" fontSize="18">
          return True
        </text>
        <text x="56" y="208" fill="#9c4a32" fontFamily="ui-monospace, monospace" fontSize="16">
          # keep going
        </text>
        <circle cx="260" cy="320" r="48" fill="#d7a15e" opacity="0.35" />
        <text
          x="36"
          y="340"
          fill="#f6f3ea"
          fontFamily="Georgia, serif"
          fontSize="28"
          fontWeight="600"
        >
          {short}
        </text>
      </svg>
    </div>
  );
}
