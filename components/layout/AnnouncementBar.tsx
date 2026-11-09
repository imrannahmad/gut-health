export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className="bg-[#54232F] text-[#FFFFFF] py-2 sm:py-2.5 px-2 min-[360px]:px-3 sm:px-4 text-center font-medium border-b border-[#3D1822] select-none uppercase whitespace-nowrap overflow-hidden"
      style={{
        fontSize: "clamp(0.5625rem, 2.2vw, 0.6875rem)", // 9px to 11px
        letterSpacing: "clamp(0.08em, 0.4vw, 0.2em)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {/* Full text for viewports ≥ 350px */}
        <span className="hidden min-[350px]:inline truncate">
          COMPLIMENTARY NATIONWIDE EXPRESS SHIPPING
        </span>
        {/* Compact equivalent for ultra-narrow screens (< 350px) to prevent multi-line wrapping */}
        <span className="min-[350px]:hidden truncate">
          COMPLIMENTARY EXPRESS SHIPPING
        </span>
      </div>
    </div>
  );
}
