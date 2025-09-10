import * as React from 'react';
import { useBlazeContext } from '../../context/BlazeContext';
import { MapPin, TrendingUp } from 'lucide-react';

export function LiveGames() {
  const { } = useBlazeContext();  // Reserved for future use

  // Mock data - would be fetched from API
  const games = [
    {
      id: '1',
      homeTeam: 'Cardinals',
      awayTeam: 'Cubs',
      homeScore: 5,
      awayScore: 3,
      inning: '7th',
      status: 'live',
      venue: 'Busch Stadium',
      winProbability: { home: 78, away: 22 }
    },
    {
      id: '2',
      homeTeam: 'Titans',
      awayTeam: 'Colts',
      homeScore: 21,
      awayScore: 17,
      quarter: '3rd',
      time: '8:45',
      status: 'live',
      venue: 'Nissan Stadium',
      winProbability: { home: 62, away: 38 }
    },
    {
      id: '3',
      homeTeam: 'Grizzlies',
      awayTeam: 'Lakers',
      homeScore: 98,
      awayScore: 102,
      quarter: '4th',
      time: '2:13',
      status: 'live',
      venue: 'FedExForum',
      winProbability: { home: 35, away: 65 }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-display font-bold mb-4">Live Games</h2>
        
        <div className="grid gap-4">
          {games.map(game => (
            <div key={game.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-500">LIVE</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {game.inning || `${game.quarter} Quarter ${game.time || ''}`}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {game.venue}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <p className="font-medium text-lg">{game.homeTeam}</p>
                  <p className="text-3xl font-bold font-mono mt-1">{game.homeScore}</p>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Win Prob</div>
                    <div className="text-sm font-bold text-green-500">{game.winProbability.home}%</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-gray-400">VS</p>
                </div>

                <div className="text-center">
                  <p className="font-medium text-lg">{game.awayTeam}</p>
                  <p className="text-3xl font-bold font-mono mt-1">{game.awayScore}</p>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Win Prob</div>
                    <div className="text-sm font-bold text-gray-500">{game.winProbability.away}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button className="text-sm text-blaze-orange hover:text-blaze-orange-light font-medium">
                    View Details →
                  </button>
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    AI Tracking Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}