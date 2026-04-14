type HeaderProps = {
  homeTeam: string;
  awayTeam: string;
};

export function Header({ homeTeam, awayTeam }: HeaderProps) {
  return (
    <div className="bg-header-bg text-white">
      {/* Top bar: back, search, logo, balance, avatar */}
      <div className="flex items-center justify-between px-m py-2">
        <div className="flex items-center gap-3">
          <span className="text-body">&#x276E;</span>
          <span className="text-sub font-bold">Back</span>
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-page-title text-primary-red font-bold tracking-wide">SPREADEX</span>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-legal text-gray-400">Spr Bal: -£188.74</p>
            <p className="text-legal text-gray-400">Spr Av: £4,811.26</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
