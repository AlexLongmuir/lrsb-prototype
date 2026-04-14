type HeaderProps = {
  homeTeam: string;
  awayTeam: string;
};

export function Header({ homeTeam, awayTeam }: HeaderProps) {
  return (
    <div className="bg-header-bg text-white">
      <div className="flex items-center px-3 py-2 gap-2">
        {/* Left: back + search */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[11px] font-bold">Back</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Center: logo */}
        <div className="flex-1 flex justify-center">
          <span className="text-[14px] text-primary-red font-black tracking-wider">SPREADEX</span>
        </div>
        {/* Right: balance + avatar */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="text-right leading-tight">
            <p className="text-[8px] text-gray-400">Spr Bal: -£188.74</p>
            <p className="text-[8px] text-gray-400">Spr Av: £4,811.26</p>
            <p className="text-[8px] text-gray-400">FO Bal: £3,049.36</p>
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
