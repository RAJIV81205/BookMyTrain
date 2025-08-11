// Frontend Component (TrainSection.tsx)
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Train, Edit, Trash2, Search, X } from 'lucide-react';
import availableTrains from "@/lib/constants/trains.json"

interface TrainInfo {
  trainNo: string;
  trainName: string;
}

interface SavedTrain {
  _id?: string;
  id?: number;
  trainNo: string;
  trainName: string;
  classes: Record<string, number>; // Changed from string[] to object with seat counts
  addedDate: string;
}

const defaultSeatCounts: Record<string, number> = {
  '1A': 18,
  '2A': 48,
  '3A': 64,
  'SL': 72
};

const classOptions = ['1A', '2A', '3A', 'SL'];

const TrainSection = () => {
  const [savedTrains, setSavedTrains] = useState<SavedTrain[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<TrainInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trains from API
  const fetchTrains = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken'); // Assuming token is stored in localStorage
      
      const response = await fetch('/api/admin/trains', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trains');
      }

      const data = await response.json();
      setSavedTrains(data.trains || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trains');
      console.error('Error fetching trains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  // Search functionality
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length > 0) {
      const results = availableTrains.filter(train =>
        train.trainNo.includes(term) ||
        train.trainName.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results.slice(0, 10)); // Limit results
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleAddTrain = () => {
    setShowAddPopup(true);
    setSearchTerm('');
    setSelectedTrain(null);
    setSelectedClasses([]);
  };

  const handleClosePopup = () => {
    setShowAddPopup(false);
    setSearchTerm('');
    setSelectedTrain(null);
    setSelectedClasses([]);
    setSearchResults([]);
  };

  const handleTrainSelect = (train: TrainInfo) => {
    setSelectedTrain(train);
    setSearchTerm(train.trainNo);
    setSearchResults([]);
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  const handleSaveTrain = async () => {
    if (!selectedTrain || selectedClasses.length === 0) {
      setError('Please select a train and at least one class');
      return;
    }

    // Check for duplicate train numbers
    if (savedTrains.some(t => t.trainNo === selectedTrain.trainNo)) {
      setError("This train is already saved.");
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      // Build classes object with fixed seat counts
      const classesObject = selectedClasses.reduce((acc, className) => {
        acc[className] = defaultSeatCounts[className];
        return acc;
      }, {} as Record<string, number>);

      const trainData = {
        trainNo: parseInt(selectedTrain.trainNo),
        trainName: selectedTrain.trainName,
        classes: classesObject
      };

      const response = await fetch('/api/admin/trains', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save train');
      }

      // Refresh the trains list
      await fetchTrains();
      handleClosePopup();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save train');
      console.error('Error saving train:', err);
    }
  };

  const handleDeleteTrain = async (trainId: string | number) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/trains/${trainId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete train');
      }

      // Remove from local state
      setSavedTrains(prev => prev.filter(train => 
        (train._id || train.id) !== trainId
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete train');
      console.error('Error deleting train:', err);
    }
  };

  const getClassBadgeColor = (className: string) => {
    const colors: Record<string, string> = {
      '1A': 'bg-purple-100 text-purple-800',
      '2A': 'bg-blue-100 text-blue-800',
      '3A': 'bg-green-100 text-green-800',
      'SL': 'bg-orange-100 text-orange-800'
    };
    return colors[className] || 'bg-gray-100 text-gray-800';
  };

  const getClassFullName = (className: string) => {
    const names: Record<string, string> = {
      '1A': 'First AC',
      '2A': 'Second AC',
      '3A': 'Third AC',
      'SL': 'Sleeper Class'
    };
    return names[className] || className;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Train className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading trains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Train className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Train Management</h1>
            <p className="text-gray-600">Manage trains and their available classes</p>
          </div>
        </div>
        <button
          onClick={handleAddTrain}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Train
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 underline text-sm mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Trains List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900">Saved Trains</h2>
          <p className="text-gray-600">Manage your train inventory</p>
        </div>
        <div className="p-6">
          {savedTrains.length === 0 ? (
            <div className="text-center py-12">
              <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trains added yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first train to the system</p>
              <button
                onClick={handleAddTrain}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Train
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {savedTrains.map((train) => (
                <div key={train._id || train.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{train.trainNo}</h3>
                      <p className="text-gray-600 text-sm">{train.trainName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrain(train._id || train.id!)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Available Classes & Seats:</p>
                    <div className="space-y-2">
                      {Object.entries(train.classes).map(([className, seatCount]) => (
                        <div key={className} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassBadgeColor(className)}`}>
                            {className}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{seatCount} seats</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Added on {new Date(train.addedDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Train Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Train</h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Search Train */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Train
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter train number or name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((train, index) => (
                      <button
                        key={`${train.trainNo}-${index}`}
                        onClick={() => handleTrainSelect(train)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{train.trainNo}</div>
                        <div className="text-sm text-gray-600">{train.trainName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Train */}
              {selectedTrain && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Selected Train:</h3>
                  <p className="text-blue-800">{selectedTrain.trainNo} - {selectedTrain.trainName}</p>
                </div>
              )}

              {/* Class Selection */}
              {selectedTrain && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Available Classes (Fixed Seat Configuration)
                  </label>
                  <div className="space-y-3">
                    {classOptions.map((className) => (
                      <div
                        key={className}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedClasses.includes(className)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleClassToggle(className)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                selectedClasses.includes(className)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedClasses.includes(className) && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{className}</div>
                              <div className="text-xs text-gray-500">
                                {getClassFullName(className)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              {defaultSeatCounts[className]} seats
                            </div>
                            <div className="text-xs text-gray-500">Fixed</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedClasses.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Selected Classes Summary:</p>
                      <div className="space-y-1">
                        {selectedClasses.map((className) => (
                          <div key={className} className="flex justify-between text-sm">
                            <span className="text-gray-700">{className}</span>
                            <span className="font-medium">{defaultSeatCounts[className]} seats</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTrain}
                disabled={!selectedTrain || selectedClasses.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Train
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainSection;