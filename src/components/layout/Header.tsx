type HeaderProps = {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickOff: string;
};

export function Header({ homeTeam, awayTeam, competition, kickOff }: HeaderProps) {
  return (
    <div className="bg-teal-600 text-white p-m">
      <p className="text-sub opacity-80">{competition}</p>
      <h1 className="text-page-title">
        {homeTeam} vs {awayTeam}
      </h1>
      <p className="text-sub opacity-80">{kickOff}</p>
    </div>
  );
}
