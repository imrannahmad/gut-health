export function AnnouncementBar() {
  return (
    <div className="bg-[#173D32] text-[#F8F6EF] text-[11px] tracking-[0.2em] uppercase py-2 px-4 text-center font-medium border-b border-[#122e26] transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>Complimentary Nationwide Express Shipping on All Orders</span>
        <span className="hidden sm:inline text-[#A9B9A0]">·</span>
        <span className="hidden sm:inline text-[#A9B9A0]">Dispatched in 24 Hours</span>
      </div>
    </div>
  );
}
