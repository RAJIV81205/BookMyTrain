import React from "react";

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
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-40 bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-auto flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Coach Positions (in sequence)</h2>
        <div className="flex gap-2 w-full overflow-x-auto py-4">
          {sorted.map((coach, idx) => (
            <div
              key={coach.position + coach.number + idx}
              className="flex flex-col items-center w-[80px]"
            >
              <div className="bg-blue-100 border-blue-500 border-2 rounded-md px-4 py-4 flex flex-col items-center shadow-lg">
                <span className="font-bold text-lg text-blue-700">{coach.number}</span>
                <span className="text-blue-500 text-xs">{coach.type}</span>
              </div>
              <span className="text-xs mt-1 text-gray-500">{coach.position}</span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default CoachPosition;
