import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, CheckCircle, Clock, Filter, X, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    location: ''
  });

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async (currentFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
      if (currentFilters.location) params.append('location', currentFilters.location);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks?${params.toString()}`);
      setChecklists(response.data.rows || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchChecklists(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { startDate: '', endDate: '', location: '' };
    setFilters(emptyFilters);
    fetchChecklists(emptyFilters);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (content) => {
    // Check if content is string and try to parse it (in case of double serialization)
    let data = content;
    if (typeof content === 'string') {
      try {
        data = JSON.parse(content);
      } catch (e) {
        console.error('Error parsing content:', e);
        return 0;
      }
    }

    if (!data || !data.groups) {
      // console.warn('Invalid content structure:', data);
      return 0;
    }

    const toArray = (d) => {
      if (Array.isArray(d)) return d;
      if (typeof d === 'object' && d !== null) return Object.values(d);
      return [];
    };

    let total = 0;
    let completed = 0;
    
    const groups = toArray(data.groups);
    groups.forEach(group => {
      const items = toArray(group.items);
      items.forEach(item => {
        total++;
        if (item.status === 'done') completed++;
      });
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Daily Checklists</h1>
        
        <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Filter by location..."
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm flex items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded text-sm flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <p className="text-gray-500">No checklists found matching your filters.</p>
          <button onClick={clearFilters} className="text-blue-500 text-sm mt-2 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {checklists.map((checklist) => {
          const progress = calculateProgress(checklist.content);
          return (
            <Link 
              key={checklist.id} 
              to={`/checklist/${checklist.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{formatDate(checklist.date)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    progress === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {progress}% Done
                  </span>
                </div>

                <div className="flex items-center mb-4 text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {checklist.user ? checklist.user.username : 'Unknown User'}
                  </span>
                  {checklist.user?.location && (
                    <div className="flex items-center text-xs text-gray-500 ml-3 bg-gray-100 px-2 py-0.5 rounded-full">
                      <MapPin className="h-3 w-3 mr-1" />
                      {checklist.user.location}
                    </div>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last synced: {new Date(checklist.lastSyncedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
