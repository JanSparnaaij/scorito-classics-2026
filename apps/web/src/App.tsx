import { useState, useEffect } from 'react';
import { Race } from 'core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [startlist, setStartlist] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/races`)
      .then(res => res.json())
      .then(data => setRaces(data));
  }, []);

  const handleSync = async () => {
    await fetch(`${API_URL}/api/races/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    alert('Sync complete!');
  };

  const fetchStartlist = (slug: string) => {
    fetch(`${API_URL}/api/races/${slug}/startlist`)
      .then(res => res.json())
      .then(data => {
        setStartlist(data);
        setSelectedRace(races.find(r => r.slug === slug) || null);
      });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white p-4">
        <h1 className="text-xl font-bold mb-4">Scorito Classics 2026</h1>
        <nav>
          <ul>
            {races.map(race => (
              <li key={race.id} className="mb-2">
                <a href="#" onClick={() => fetchStartlist(race.slug)} className="text-blue-600 hover:underline">
                  {race.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button onClick={handleSync} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sync All Races
        </button>
      </aside>
      <main className="flex-1 p-8">
        {selectedRace ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedRace.name} Startlist</h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Dorsal</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Team</th>
                </tr>
              </thead>
              <tbody>
                {startlist.map(entry => (
                  <tr key={entry.id}>
                    <td className="py-2 px-4 border-b text-center">{entry.dorsal}</td>
                    <td className="py-2 px-4 border-b">{entry.rider.name}</td>
                    <td className="py-2 px-4 border-b">{entry.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">Select a race to view the startlist.</div>
        )}
      </main>
    </div>
  );
}

export default App;
