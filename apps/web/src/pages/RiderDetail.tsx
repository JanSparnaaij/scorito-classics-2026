import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Race } from 'core';

interface RiderInfo {
  id: string;
  name: string;
  team?: string;
  pcsId: string;
}

interface RaceWithRider {
  id: string;
  name: string;
  slug: string;
  date: string;
  dorsal?: string;
  team?: string;
}

function RiderDetail() {
  const { riderId } = useParams<{ riderId: string }>();
  const navigate = useNavigate();
  const [rider, setRider] = useState<RiderInfo | null>(null);
  const [races, setRaces] = useState<RaceWithRider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!riderId) return;

    // Fetch all races and find ones with this rider
    fetch('http://localhost:3000/api/races')
      .then(res => res.json())
      .then(async (allRaces: Race[]) => {
        const riderRaces: RaceWithRider[] = [];

        for (const race of allRaces) {
          const startlist = await fetch(
            `http://localhost:3000/api/races/${race.slug}/startlist`
          ).then(res => res.json());

          const riderEntry = startlist.find(
            (entry: any) => entry.rider.id === riderId
          );

          if (riderEntry) {
            if (!rider) {
              setRider(riderEntry.rider);
            }
            riderRaces.push({
              id: race.id,
              name: race.name,
              slug: race.slug,
              date: new Date(race.date).toISOString(),
              dorsal: riderEntry.dorsal,
              team: riderEntry.team,
            });
          }
        }

        setRaces(
          riderRaces.sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
      })
      .finally(() => setLoading(false));
  }, [riderId]);

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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {rider ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {rider.name}
              </h1>
              {rider.team && (
                <p className="text-lg text-gray-600 mb-4">{rider.team}</p>
              )}
              <div className="bg-indigo-100 text-indigo-700 inline-block px-4 py-2 rounded-lg font-semibold">
                PCS ID: {rider.pcsId}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Races ({races.length})
              </h2>

              {races.length === 0 ? (
                <p className="text-gray-500">
                  Deze renner rijdt in geen gesynde races.
                </p>
              ) : (
                <div className="space-y-4">
                  {races.map(race => (
                    <Link
                      key={race.id}
                      to={`/race/${race.slug}`}
                      className="block"
                    >
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">
                              {race.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {new Date(race.date).toLocaleDateString(
                                'nl-NL',
                                {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            {race.dorsal && (
                              <p className="text-2xl font-bold text-indigo-600">
                                #{race.dorsal}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              {race.team}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Renner niet gevonden.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default RiderDetail;
