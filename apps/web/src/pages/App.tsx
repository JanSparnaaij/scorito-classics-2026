import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Race } from 'core';

function App() {
  const [races, setRaces] = useState<Race[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/races')
      .then(res => res.json())
      .then(data => setRaces(data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('http://localhost:3000/api/races/sync', { method: 'POST' });
      alert('Sync complete! Refresh the page to see updated data.');
    } catch (error) {
      alert('Sync failed: ' + error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-indigo-600">Scorito Classics 2026</h1>
          <p className="text-gray-500 text-sm mt-1">Volg je favoriete klassiekers</p>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Klassiekers</h2>
          <div className="flex gap-4">
            <Link
              to="/riders"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
            >
              View Riders
            </Link>
            <Link
              to="/teams"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
            >
              View Teams
            </Link>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
            >
              {syncing ? 'Syncing...' : 'Sync All Races'}
            </button>
          </div>
        </div>

        {races.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Geen races gevonden. Klik op "Sync All Races" om de data in te laden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {races.map(race => (
              <Link key={race.id} to={`/race/${race.slug}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{race.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(race.date).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="mt-4 inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    View Startlist →
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

export default App;
