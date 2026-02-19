import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Race } from 'core';
import { API_URL } from '../config';

interface RaceParticipation {
  id: string;
  name: string;
  slug: string;
  date: string;
  riders: number;
}

function TeamDetail() {
  const { teamName } = useParams<{ teamName: string }>();
  const navigate = useNavigate();
  const [races, setRaces] = useState<RaceParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) return;

    const decodedTeamName = decodeURIComponent(teamName);

    // Fetch all races and find ones with this team
    fetch(`${API_URL}/api/races`)
      .then(res => res.json())
      .then(async (allRaces: Race[]) => {
        const teamRaces: RaceParticipation[] = [];

        for (const race of allRaces) {
          const startlist = await fetch(
            `${API_URL}/api/races/${race.slug}/startlist`
          ).then(res => res.json());

          const teamRiders = startlist.filter(
            (entry: any) => entry.team === decodedTeamName
          );

          if (teamRiders.length > 0) {
            teamRaces.push({
              id: race.id,
              name: race.name,
              slug: race.slug,
              date: new Date(race.date).toISOString(),
              riders: teamRiders.length,
            });
          }
        }

        setRaces(
          teamRaces.sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
      })
      .finally(() => setLoading(false));
  }, [teamName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const decodedTeamName = teamName ? decodeURIComponent(teamName) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Races
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {decodedTeamName}
          </h1>
          <p className="text-lg text-gray-600">
            {races.length} race{races.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {races.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                Deze team rijdt in geen gesynde races.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {races.map(race => (
                <Link
                  key={race.id}
                  to={`/race/${race.slug}`}
                  className="block"
                >
                  <div className="px-6 py-4 hover:bg-indigo-50 transition flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {race.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(race.date).toLocaleDateString('nl-NL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {race.riders}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        renner{race.riders !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeamDetail;
