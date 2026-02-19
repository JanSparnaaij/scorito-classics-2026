import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Race } from 'core';

interface Rider {
  id: string;
  name: string;
  team?: string;
  races: number;
  teams: Set<string>;
}

function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/races')
      .then(res => res.json())
      .then(async (allRaces: Race[]) => {
        const riderMap = new Map<string, Rider>();

        for (const race of allRaces) {
          const startlist = await fetch(
            `http://localhost:3000/api/races/${race.slug}/startlist`
          ).then(res => res.json());

          startlist.forEach((entry: any) => {
            if (!riderMap.has(entry.rider.id)) {
              riderMap.set(entry.rider.id, {
                id: entry.rider.id,
                name: entry.rider.name,
                team: entry.team,
                races: 0,
                teams: new Set(),
              });
            }
            const rider = riderMap.get(entry.rider.id)!;
            rider.races++;
            rider.teams.add(entry.team);
          });
        }

        const riderList = Array.from(riderMap.values())
          .map(rider => ({
            ...rider,
            teams: rider.teams,
          }))
          .sort((a, b) => b.races - a.races);

        setRiders(riderList);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRiders = riders.filter(rider =>
    rider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            ← Back to Races
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Riders</h1>
          <div className="w-32"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredRiders.length} renners
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="text"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading riders...</p>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {searchTerm
                ? 'No riders found matching your search.'
                : 'Geen renners gevonden. Klik op "Sync All Races" om data in te laden.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-600 text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Name</th>
                    <th className="px-6 py-4 text-left font-bold">Team</th>
                    <th className="px-6 py-4 text-center font-bold">Races</th>
                    <th className="px-6 py-4 text-left font-bold">Teams</th>
                    <th className="px-6 py-4 text-center font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRiders.map(rider => (
                    <tr
                      key={rider.id}
                      className="hover:bg-indigo-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {rider.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {rider.team || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {rider.races}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(rider.teams)
                            .slice(0, 2)
                            .map(team => (
                              <span
                                key={team}
                                className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {team}
                              </span>
                            ))}
                          {rider.teams.size > 2 && (
                            <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                              +{rider.teams.size - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/rider/${rider.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Riders;
