import React from 'react';
import { Train, Clock, MapPin, Calendar, User } from 'lucide-react';

const TrainCard = ({ trainInfo }: { trainInfo: any }) => {
  const sampleData = {
    distance: "460",
    dstn_stn_code: "KLK",
    dstn_stn_name: "Kalka",
    from_stn_code: "ASN",
    from_stn_name: "Asansol Jn",
    from_time: "00:27",
    halts: 10,
    running_days: "1111111",
    source_stn_code: "HWH",
    source_stn_name: "Howrah Jn",
    to_stn_code: "DDU",
    to_stn_name: "Dd Upadhyaya Jn",
    to_time: "08:05",
    train_name: "NETAJI EXPRESS",
    train_no: "12312",
    travel_time: "07:38 hrs"
  };

  const data = trainInfo || sampleData;

  const formatRunningDays = (days: any) => {
    const dayNames = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' , 'Sun'];
    return dayNames.filter((_, index) => days[index] === '1').join(', ');
  };

  return (
    <div className="bg-white border rounded-lg p-5 mb-5 shadow-sm">
      {/* Train header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Train className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold">{data.train_name}</h3>
            <p className="text-sm text-gray-500">Train No: {data.train_no}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{data.distance} km</span>
      </div>

      {/* Route */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>From</span>
          </div>
          <p className="font-medium">{data.from_stn_name}</p>
          <p className="text-sm text-gray-500">{data.from_stn_code}</p>
          <div className="flex items-center space-x-1 mt-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{data.from_time}</span>
          </div>
        </div>

        <div className="text-center">
          <Train className="w-5 h-5 text-gray-500 mx-auto" />
          <p className="text-sm text-gray-500">{data.travel_time}</p>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1 justify-end text-gray-500 text-sm">
            <span>To</span>
            <MapPin className="w-4 h-4" />
          </div>
          <p className="font-medium">{data.to_stn_name}</p>
          <p className="text-sm text-gray-500">{data.to_stn_code}</p>
          <div className="flex items-center space-x-1 justify-end mt-1 text-gray-600">
            <span>{data.to_time}</span>
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Extra info */}
      <div className="border-t mt-4 pt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-gray-500">Running Days</p>
            <p className="font-medium">{formatRunningDays(data.running_days)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-gray-500">Halts</p>
            <p className="font-medium">{data.halts} stations</p>
          </div>
        </div>
      </div>

      {/* Button */}
      <button className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 rounded transition-colors">
        View Details & Book
      </button>
    </div>
  );
};

export default TrainCard;
