import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Race } from 'core';

interface Team {
  name: string;
  races: number;
  riders: number;
}

function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/races')
      .then(res => res.json())
      .then(async (allRaces: Race[]) => {
        const teamMap = new Map<string, { races: number; riders: number }>();

        for (const race of allRaces) {
          const startlist = await fetch(
            `http://localhost:3000/api/races/${race.slug}/startlist`
          ).then(res => res.json());

          startlist.forEach((entry: any) => {
            if (!teamMap.has(entry.team)) {
              teamMap.set(entry.team, { races: 0, riders: 0 });
            }
            const stats = teamMap.get(entry.team)!;
            stats.riders++;
            stats.races = new Set(
              [...Array.from(teamMap.values())].map(v => v.races)
            ).size;
          });

          // Count unique races per team
          const teamRaces = new Map<string, Set<string>>();
          startlist.forEach((entry: any) => {
            if (!teamRaces.has(entry.team)) {
              teamRaces.set(entry.team, new Set());
            }
            teamRaces.get(entry.team)!.add(race.id);
          });

          // Update races count
          teamRaces.forEach((raceSet, teamName) => {
            const current = teamMap.get(teamName)!;
            current.races = raceSet.size;
          });
        }

        const teamList = Array.from(teamMap.entries())
          .map(([name, stats]) => ({
            name,
            races: stats.races,
            riders: stats.riders,
          }))
          .sort((a, b) => b.riders - a.riders);

        setTeams(teamList);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            ← Back to Races
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
          <div className="w-32"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {teams.length} teams
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Geen teams gevonden. Klik op "Sync All Races" om data in te laden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Link key={team.name} to={`/team/${encodeURIComponent(team.name)}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    {team.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-100 rounded p-3">
                      <p className="text-2xl font-bold text-indigo-600">
                        {team.races}
                      </p>
                      <p className="text-xs text-indigo-700">race{team.races !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-purple-100 rounded p-3">
                      <p className="text-2xl font-bold text-purple-600">
                        {team.riders}
                      </p>
                      <p className="text-xs text-purple-700">renners</p>
                    </div>
                  </div>
                  <div className="mt-4 inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    View →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Teams;
