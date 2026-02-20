import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

interface Price {
  id: string;
  amountEUR: number;
  source: string;
  capturedAt: string;
}

interface Rider {
  id: string;
  name: string;
  team?: string;
  pcsId: string;
  prices?: Price[];
  _count?: {
    startlistEntries: number;
  };
}

function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'races' | 'pricePerRace'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch(`${API_URL}/api/riders`)
      .then(res => res.json())
      .then((data: Rider[]) => {
        setRiders(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (amountEUR: number) => {
    if (amountEUR >= 1000000) {
      return `€${(amountEUR / 1000000).toFixed(1)}M`;
    }
    return `€${(amountEUR / 1000).toFixed(0)}K`;
  };

  const getPrice = (rider: Rider): number | null => {
    if (!rider.prices || rider.prices.length === 0) return null;
    return rider.prices[0].amountEUR;
  };

  const getRaceCount = (rider: Rider): number => {
    return rider._count?.startlistEntries || 0;
  };

  const getPricePerRace = (rider: Rider): number | null => {
    const price = getPrice(rider);
    const raceCount = getRaceCount(rider);
    if (!price || raceCount === 0) return null;
    return price / raceCount;
  };

  const handleSort = (newSort: 'name' | 'price' | 'races' | 'pricePerRace') => {
    if (sortBy === newSort) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortDirection('desc');
    }
  };

  const filteredRiders = riders
    .filter(rider =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'price') {
        const priceA = getPrice(a) || 0;
        const priceB = getPrice(b) || 0;
        comparison = priceB - priceA;
      } else if (sortBy === 'races') {
        comparison = getRaceCount(b) - getRaceCount(a);
      } else if (sortBy === 'pricePerRace') {
        const perRaceA = getPricePerRace(a) || 0;
        const perRaceB = getPricePerRace(b) || 0;
        comparison = perRaceB - perRaceA;
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      
      return sortDirection === 'asc' ? -comparison : comparison;
    });

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
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('name')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'name'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sort by Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('price')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'price'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sort by Price {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('races')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'races'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sort by Races {sortBy === 'races' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('pricePerRace')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'pricePerRace'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sort by Price/Race {sortBy === 'pricePerRace' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
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
                    <th className="px-6 py-4 text-right font-bold">Price</th>
                    <th className="px-6 py-4 text-right font-bold">Price/Race</th>
                    <th className="px-6 py-4 text-center font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRiders.map(rider => {
                    const price = getPrice(rider);
                    const raceCount = getRaceCount(rider);
                    const pricePerRace = getPricePerRace(rider);
                    return (
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
                          <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                            {raceCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {price ? (
                            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                              {formatPrice(price)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {pricePerRace ? (
                            <span className="text-sm text-gray-600">
                              {formatPrice(pricePerRace)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
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
                    );
                  })}
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
