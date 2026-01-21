import React from "react";
import { 
  Train, 
  Accessibility, 
  Armchair, 
  Briefcase, 
  Snowflake, 
  Bed, 
  Users, 
  UtensilsCrossed, 
  Package,
  Circle
} from "lucide-react";

interface Coach {
  type: string;
  number: string;
  position: string | number;
}

interface CoachPositionProps {
  open: boolean;
  onClose: () => void;
  coachPosition: Coach[];
}

const CoachPosition: React.FC<CoachPositionProps> = ({ open, onClose, coachPosition }) => {
  if (!open) return null;

  // Sort coaches by their position (numeric)
  const sorted = [...coachPosition].sort((a, b) => Number(a.position) - Number(b.position));

  // Function to get coach styles based on type
  const getCoachStyle = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('eng') || lowerType.includes('loco')) {
      return {
        bg: 'bg-gradient-to-br from-red-600 to-red-800',
        icon: Train,
        border: 'border-red-700'
      };
    } else if (lowerType.includes('slrd') || lowerType.includes('disabled') || lowerType.includes('divyangjan') || lowerType.includes('divyang')) {
      return {
        bg: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
        icon: Accessibility,
        border: 'border-indigo-700'
      };
    } else if (lowerType.includes('cc') || lowerType.includes('chair car')) {
      return {
        bg: 'bg-gradient-to-br from-teal-500 to-teal-700',
        icon: Armchair,
        border: 'border-teal-600'
      };
    } else if (lowerType.includes('ec') || lowerType.includes('executive') || lowerType.includes('exec')) {
      return {
        bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
        icon: Briefcase,
        border: 'border-amber-700'
      };
    } else if (lowerType.includes('ac') || lowerType.includes('1a') || lowerType.includes('2a') || lowerType.includes('3a') || lowerType.includes('3e')) {
      return {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-700',
        icon: Snowflake,
        border: 'border-blue-600'
      };
    } else if (lowerType.includes('sleeper') || lowerType.includes('sl')) {
      return {
        bg: 'bg-gradient-to-br from-green-500 to-green-700',
        icon: Bed,
        border: 'border-green-600'
      };
    } else if (lowerType.includes('gen') || lowerType.includes('unreserved')) {
      return {
        bg: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
        icon: Users,
        border: 'border-yellow-600'
      };
    } else if (lowerType.includes('pantry') || lowerType.includes('pc')) {
      return {
        bg: 'bg-gradient-to-br from-orange-500 to-orange-700',
        icon: UtensilsCrossed,
        border: 'border-orange-600'
      };
    } else if (lowerType.includes('luggage') || lowerType.includes('brake')) {
      return {
        bg: 'bg-gradient-to-br from-gray-500 to-gray-700',
        icon: Package,
        border: 'border-gray-600'
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-purple-500 to-purple-700',
        icon: Circle,
        border: 'border-purple-600'
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-linear-to-br from-gray-50 to-gray-100 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-3xl font-bold z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          >
            ×
          </button>
          
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            🚆 Train Formation
          </h2>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center gap-1 min-w-max px-4">
              {sorted.map((coach, idx) => {
                const style = getCoachStyle(coach.type);
                return (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                      {/* Coach Card */}
                      <div className={`relative ${style.bg} ${style.border} border-2 rounded-lg shadow-lg transition-transform hover:scale-105`}
                           style={{ width: '200px', height: '100px' }}>
                        {/* Coach Icon */}
                        <div className="absolute top-2 right-3 text-white opacity-80">
                          <style.icon size={28} />
                        </div>
                        
                        {/* Coach Number */}
                        <div className="p-3 flex flex-col justify-center h-full">
                          <div className="text-white font-bold text-xl mb-1">
                            {coach.number}
                          </div>
                          
                          {/* Coach Type */}
                          <div className="text-white text-sm font-medium opacity-90">
                            {coach.type}
                          </div>
                        </div>
                        
                        {/* Wheels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-around px-8 transform translate-y-1/2">
                          <div className="w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-300"></div>
                          <div className="w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-300"></div>
                        </div>
                      </div>
                      
                      {/* Position below coach */}
                      <div className="mt-4 text-sm font-semibold text-gray-700">
                        Position: {coach.position}
                      </div>
                    </div>
                    
                    {/* Connector between coaches */}
                    {idx < sorted.length - 1 && (
                      <div className="flex items-center">
                        <div className="w-8 h-1 bg-gray-600 relative">
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-gray-700 rounded-full border border-gray-500"></div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-700 rounded-full border border-gray-500"></div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <Train size={20} className="text-red-600" />
                <span className="text-gray-700">Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Accessibility size={20} className="text-indigo-600" />
                <span className="text-gray-700">Divyangjan (SLRD)</span>
              </div>
              <div className="flex items-center gap-2">
                <Armchair size={20} className="text-teal-600" />
                <span className="text-gray-700">Chair Car (CC)</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-amber-700" />
                <span className="text-gray-700">Executive (EC)</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake size={20} className="text-blue-600" />
                <span className="text-gray-700">AC Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed size={20} className="text-green-600" />
                <span className="text-gray-700">Sleeper</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-yellow-600" />
                <span className="text-gray-700">General</span>
              </div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-orange-600" />
                <span className="text-gray-700">Pantry</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={20} className="text-gray-600" />
                <span className="text-gray-700">Luggage/Brake</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPosition;