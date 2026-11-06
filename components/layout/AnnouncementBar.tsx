export function AnnouncementBar() {
  return (
    <div className="bg-[#111111] text-[#FFFFFF] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase py-2.5 px-4 text-center font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>Complimentary Nationwide Express Shipping</span>
        <span className="hidden sm:inline text-[#777777]">/</span>
        <span className="hidden sm:inline text-[#FFFFFF]/80">Dispatched in 24 Hours</span>
      </div>
    </div>
  );
}
