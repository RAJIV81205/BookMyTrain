"use client"

import React, { useState } from 'react';
import { getTrainInfo } from 'irctc-connect';

const Trainsearch = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainInfo, setTrainInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e:any) => {
    const value = e.target.value;
    if (/^\d{0,5}$/.test(value)) {
      setTrainNumber(value);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (trainNumber.length !== 5) {
      setError('Please enter exactly 5 digits');
      return;
    }

    setLoading(true);
    setError('');
    setTrainInfo(null);

    try {
      const result = await getTrainInfo(trainNumber);
      setTrainInfo(result);
    } catch (err) {
      setError('Failed to fetch train information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e:any) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🚂 Train Search</h1>
          <p className="text-gray-600">Enter 5-digit train number to get information</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                value={trainNumber}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="12345"
                className="w-full px-4 py-4 text-xl text-center font-mono border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300 tracking-widest"
                maxLength={5}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                {trainNumber.length}/5
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || trainNumber.length !== 5}
              className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                loading || trainNumber.length !== 5
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Searching...
                </div>
              ) : (
                'Search Train'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {trainInfo && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-green-800">Train Information Found!</h3>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200 overflow-hidden">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all overflow-auto max-h-96 font-mono">
                  {JSON.stringify(trainInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trainsearch;
