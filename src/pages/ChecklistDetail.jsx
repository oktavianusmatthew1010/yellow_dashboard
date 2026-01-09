import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, User, CheckCircle, XCircle, Clock, MapPin, Image as ImageIcon, X, ZoomIn } from 'lucide-react';

export default function ChecklistDetail() {
  const { id } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchChecklist();
  }, [id]);

  const fetchChecklist = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/detail/${id}`);
      setChecklist(response.data);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!checklist) {
    return <div className="p-8 text-center text-red-500">Checklist not found</div>;
  }

  // Parse content if it's a string
  let content = checklist.content;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      console.error('Error parsing content:', e);
      return <div className="p-8 text-center text-red-500">Error parsing checklist data</div>;
    }
  }

  if (!content || !content.groups) {
    return <div className="p-8 text-center text-red-500">Invalid checklist format</div>;
  }

  // Helper to convert array-like objects to array
  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) return Object.values(data);
    return [];
  };

  const groups = toArray(content.groups);

  return (
    <div className="space-y-6">
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <button 
              className="absolute -top-10 right-0 md:-right-10 text-white hover:text-gray-300 p-2 focus:outline-none"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size evidence" 
              className="max-w-full max-h-[85vh] rounded shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklist Detail</h1>
          <p className="text-gray-500 flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(checklist.date)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Submitted by</p>
              <p className="font-medium">{checklist.user ? checklist.user.username : 'Unknown User'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Synced</p>
            <p className="font-medium flex items-center justify-end">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              {new Date(checklist.lastSyncedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">
                {group.title || group.name}
              </div>
              <div className="divide-y">
                {toArray(group.items).map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-start justify-between hover:bg-gray-50">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap break-words">{item.title}</p>
                      
                      <div className="mt-2 space-y-2">
                        {item.lastCheckedAt && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Checked: {new Date(item.lastCheckedAt).toLocaleString()}
                          </p>
                        )}
                        
                        {(item.gpsLat !== undefined && item.gpsLon !== undefined) && (
                          <a 
                            href={`https://www.google.com/maps?q=${item.gpsLat},${item.gpsLon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 flex items-center hover:underline"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Location: {item.gpsLat}, {item.gpsLon}
                          </a>
                        )}

                        {item.photoUri && (
                          <div className="mt-2">
                            {item.photoUri.startsWith('blob:') || item.photoUri.startsWith('file:') ? (
                              <div className="flex items-center text-xs text-gray-400 italic bg-gray-100 p-2 rounded">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Image stored locally on device
                              </div>
                            ) : (
                              <div 
                                className="relative group cursor-pointer inline-block mt-2"
                                onClick={() => setSelectedImage(item.photoUri)}
                              >
                                <img 
                                  src={item.photoUri} 
                                  alt="Checklist evidence" 
                                  className="h-32 w-auto rounded border border-gray-200 object-cover transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.onerror = null; 
                                    // Fallback to a placeholder that indicates the image is missing/broken
                                    e.target.src = 'https://placehold.co/400x300?text=Image+Missing+on+Server';
                                    // Optional: Add a class to indicate error state if needed
                                    e.target.className = "h-32 w-auto rounded border border-red-200 object-cover opacity-50";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center rounded">
                                   <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 h-8 w-8 drop-shadow-lg" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {item.missedAt && (
                        <p className="text-xs text-red-500 mt-2">
                          Missed at: {new Date(item.missedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {item.status === 'done' ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="text-xs font-medium">Done</span>
                        </div>
                      ) : item.status === 'missed' ? (
                        <div className="flex items-center text-red-500">
                          <XCircle className="h-5 w-5 mr-1" />
                          <span className="text-xs font-medium">Missed</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-1"></div>
                          <span className="text-xs font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
