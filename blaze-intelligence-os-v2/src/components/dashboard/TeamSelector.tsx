import * as React from 'react';
import { useBlazeContext } from '../../context/BlazeContext';

const LEAGUES = ['MLB', 'NFL', 'NBA', 'NCAA'];

const TEAMS = {
  MLB: ['Cardinals', 'Yankees', 'Dodgers', 'Astros', 'Red Sox'],
  NFL: ['Titans', 'Chiefs', 'Cowboys', 'Patriots', 'Bills'],
  NBA: ['Grizzlies', 'Lakers', 'Warriors', 'Celtics', 'Nets'],
  NCAA: ['Longhorns', 'Alabama', 'Georgia', 'Michigan', 'Ohio State']
};

export function TeamSelector() {
  const { selectedLeague, setSelectedLeague, selectedTeam, setSelectedTeam } = useBlazeContext();

  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league);
    // Auto-select first team in new league
    const leagueTeams = TEAMS[league as keyof typeof TEAMS];
    if (leagueTeams && leagueTeams.length > 0) {
      setSelectedTeam(leagueTeams[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select League
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LEAGUES.map(league => (
            <button
              key={league}
              onClick={() => handleLeagueChange(league)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLeague === league
                  ? 'bg-blaze-orange text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Team
        </label>
        <div className="grid grid-cols-5 gap-2">
          {TEAMS[selectedLeague as keyof typeof TEAMS]?.map(team => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTeam === team
                  ? 'bg-blaze-blue text-blaze-navy shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}