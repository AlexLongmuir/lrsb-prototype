type MatchTitleProps = {
  homeTeam: string;
  awayTeam: string;
};

export function MatchTitle({ homeTeam, awayTeam }: MatchTitleProps) {
  return (
    <div className="bg-surface flex items-center justify-between px-m py-2 border-b border-border">
      <div className="flex items-center gap-1">
        <span className="text-body font-bold text-text-primary">
          {homeTeam} v {awayTeam}
        </span>
        <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
