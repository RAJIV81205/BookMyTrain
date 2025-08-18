



interface TrainStatsBoxesProps {
    station: number;
    train: number;
}

export default function TrainStatsBoxes({ station, train }: TrainStatsBoxesProps) {
    return (
        <div className="hidden md:flex flex-row w-full gap-6 max-w-6xl mx-auto mb-15">
            {/* Total Trains */}
            <div className="flex flex-1 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl p-4 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-500">
                <div className="flex flex-col items-center text-center w-full">
                    <div className="bg-blue-200/50 rounded-full p-2 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold mb-1">Total Trains</h3>
                    <div className="text-2xl font-bold mb-1">{train.toLocaleString()}</div>
                    <p className="text-xs opacity-80">Active trains nationwide</p>
                </div>
            </div>

            {/* Total Stations */}
            <div className="flex flex-1 bg-gradient-to-br from-pink-50 to-red-100 rounded-xl p-4 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-500">
                <div className="flex flex-col items-center text-center w-full">
                    <div className="bg-pink-200/50 rounded-full p-2 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold mb-1">Total Stations</h3>
                    <div className="text-2xl font-bold mb-1">{station.toLocaleString()}</div>
                    <p className="text-xs opacity-80">Railway stations</p>
                </div>
            </div>

            {/* Popular Routes */}
            <div className="flex flex-1 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-4 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-500">
                <div className="flex flex-col items-center text-center w-full">
                    <div className="bg-cyan-200/50 rounded-full p-2 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold mb-1">Popular Routes</h3>
                    <div className="text-2xl font-bold mb-1">245</div>
                    <p className="text-xs opacity-80">High traffic routes</p>
                </div>
            </div>

            {/* Daily Passengers */}
            <div className="flex flex-1 bg-gradient-to-br from-green-50 to-teal-100 rounded-xl p-4 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-500">
                <div className="flex flex-col items-center text-center w-full">
                    <div className="bg-green-200/50 rounded-full p-2 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold mb-1">Daily Passengers</h3>
                    <div className="text-2xl font-bold mb-1">23M</div>
                    <p className="text-xs opacity-80">Average daily travelers</p>
                </div>
            </div>
        </div>
    );
}