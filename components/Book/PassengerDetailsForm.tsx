import React, { useEffect, useState } from "react";
import { useBooking, Gender } from "@/context/BookingContext";

interface PassengerDetailsFormProps {
  selectedSeats: number[];
  onComplete: () => void;
}

const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({ selectedSeats, onComplete }) => {
  const { addPassenger } = useBooking();

  const [passengers, setPassengers] = useState(() =>
    selectedSeats.map((seatNumber) => ({ id: `p-${seatNumber}`, name: "", age: "", gender: "Male" as Gender, seatNumber }))
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Sync if selectedSeats change
    setPassengers(selectedSeats.map((seatNumber) => ({ id: `p-${seatNumber}`, name: "", age: "", gender: "Male" as Gender, seatNumber })));
  }, [selectedSeats]);

  const handleChange = (index: number, field: string, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const validate = () => passengers.every((p) => p.name.trim() && Number(p.age) > 0 && Number(p.age) < 150);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      alert("Please fill all passenger details correctly");
      return;
    }
    setSubmitting(true);
    try {
      // Add passengers to context — ensure we don't duplicate existing ones for the same seat
      passengers.forEach((p) => {
        // If passenger for seat already exists, we still add to keep behavior deterministic
        addPassenger({ ...p, age: Number(p.age), gender: p.gender as Gender });
      });
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>

      <div className="space-y-4">
        {passengers.map((p, i) => (
          <div key={p.id} className="border rounded p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Passenger {i + 1}</div>
              <div className="text-sm text-gray-500">Seat {p.seatNumber}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full name</label>
                <input value={p.name} onChange={(e) => handleChange(i, "name", e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Name" required />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Age</label>
                <input type="number" value={p.age} onChange={(e) => handleChange(i, "age", e.target.value)} className="w-full px-3 py-2 border rounded" min={1} max={120} required />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Gender</label>
                <select value={p.gender} onChange={(e) => handleChange(i, "gender", e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-60">{submitting ? "Saving..." : "Save & Continue"}</button>
      </div>
    </form>
  );
};

export default PassengerDetailsForm;