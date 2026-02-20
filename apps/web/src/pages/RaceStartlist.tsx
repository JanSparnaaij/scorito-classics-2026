import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Race } from 'core';
import { API_URL } from '../config';

interface Price {
  id: string;
  amountEUR: number;
  source: string;
  capturedAt: string;
}

interface StartlistEntry {
  id: string;
  dorsal: string;
  team: string;
  rider: {
    id: string;
    name: string;
    pcsId: string;
    prices?: Price[];
  };
}

function RaceStartlist() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [race, setRace] = useState<Race | null>(null);
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupByTeam, setGroupByTeam] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Fetch race details
    fetch(`${API_URL}/api/races`)
      .then(res => res.json())
      .then(data => {
        const foundRace = data.find((r: Race) => r.slug === slug);
        setRace(foundRace);
      });

    // Fetch startlist
    fetch(`${API_URL}/api/races/${slug}/startlist`)
      .then(res => res.json())
      .then(data => {
        setStartlist(data.sort((a: StartlistEntry, b: StartlistEntry) => {
          const aDorsal = parseInt(a.dorsal) || 999;
          const bDorsal = parseInt(b.dorsal) || 999;
          return aDorsal - bDorsal;
        }));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const teams = Array.from(new Map(startlist.map(entry => [entry.team, entry.team])).values());
  const sortedTeams = teams.sort();

  const formatPrice = (amountEUR: number) => {
    if (amountEUR >= 1000000) {
      return `€${(amountEUR / 1000000).toFixed(1)}M`;
    }
    return `€${(amountEUR / 1000).toFixed(0)}K`;
  };

  const getPrice = (entry: StartlistEntry): number | null => {
    if (!entry.rider.prices || entry.rider.prices.length === 0) return null;
    return entry.rider.prices[0].amountEUR;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Races
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{race?.name} - Startlist</h1>
          <div className="text-sm text-gray-500">
            {race && new Date(race.date).toLocaleDateString('nl-NL')}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {startlist.length} renners
          </h2>
          <button
            onClick={() => setGroupByTeam(!groupByTeam)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {groupByTeam ? 'Show as List' : 'Group by Team'}
          </button>
        </div>

        {startlist.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Geen startlist beschikbaar. Klik op "Sync All Races" op de startpagina.</p>
          </div>
        ) : groupByTeam ? (
          <div className="space-y-6">
            {sortedTeams.map(team => {
              const teamRiders = startlist.filter(e => e.team === team);
              return (
                <div key={team} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link
                    to={`/team/${encodeURIComponent(team)}`}
                    className="block"
                  >
                    <div className="bg-indigo-600 text-white px-6 py-3 font-bold hover:bg-indigo-700 transition">
                      {team} ({teamRiders.length} renners)
                    </div>
                  </Link>
                  <div className="divide-y">
                    {teamRiders.map(entry => {
                      const price = getPrice(entry);
                      return (
                        <Link
                          key={entry.id}
                          to={`/rider/${entry.rider.id}`}
                          className="flex items-center justify-between px-6 py-3 hover:bg-indigo-50 transition"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-lg font-bold text-indigo-600 w-12">
                              {entry.dorsal || '—'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{entry.rider.name}</p>
                            </div>
                            {price && (
                              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                {formatPrice(price)}
                              </span>
                            )}
                          </div>
                          <div className="text-indigo-600 font-semibold">View →</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Dorsal</th>
                  <th className="px-6 py-3 text-left font-bold">Naam</th>
                  <th className="px-6 py-3 text-left font-bold">Team</th>
                  <th className="px-6 py-3 text-right font-bold">Price</th>
                  <th className="px-6 py-3 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {startlist.map(entry => {
                  const price = getPrice(entry);
                  return (
                    <tr key={entry.id} className="hover:bg-indigo-50 transition">
                      <td className="px-6 py-3 text-lg font-bold text-indigo-600 w-20">
                        {entry.dorsal || '—'}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {entry.rider.name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <Link
                          to={`/team/${encodeURIComponent(entry.team)}`}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {entry.team}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {price ? (
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            {formatPrice(price)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Link
                          to={`/rider/${entry.rider.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          Info →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default RaceStartlist;
