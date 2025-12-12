import React, { useEffect, useState } from "react";
import { useBooking, Gender } from "@/context/BookingContext";
import { User, AlertCircle, CheckCircle2, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";

interface PassengerDetailsFormProps {
  selectedSeats: number[];
  onComplete: () => void;
}

const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({ selectedSeats, onComplete }) => {
  const { addPassenger, bookingData, removePassenger } = useBooking();

  const [passengers, setPassengers] = useState(() =>
    selectedSeats.map((seatNumber) => ({
      id: `p-${seatNumber}`,
      name: "",
      age: "",
      gender: "Male" as Gender,
      seatNumber,
    }))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Clear existing passengers for these seats and reset form
    bookingData.passengers
      .filter((p) => selectedSeats.includes(p.seatNumber))
      .forEach((p) => removePassenger(p.id));

    setPassengers(
      selectedSeats.map((seatNumber) => {
        const existing = bookingData.passengers.find((p) => p.seatNumber === seatNumber);
        return existing
          ? { ...existing, age: existing.age.toString() }
          : { id: `p-${seatNumber}`, name: "", age: "", gender: "Male" as Gender, seatNumber };
      })
    );
    setErrors({});
    setTouched({});
  }, [selectedSeats]);

  const handleChange = (index: number, field: string, value: string) => {
    const passengerId = passengers[index].id;
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    
    // Clear error when user starts typing
    if (errors[`${passengerId}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${passengerId}-${field}`];
        return newErrors;
      });
    }
    
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [`${passengerId}-${field}`]: true }));
  };

  const validateField = (index: number, field: string, value: string): string | null => {
    const passengerId = passengers[index].id;
    
    if (field === "name") {
      if (!value.trim()) return "Name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (value.trim().length > 50) return "Name is too long";
      if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return "Name can only contain letters, spaces, and basic punctuation";
    }
    
    if (field === "age") {
      if (!value) return "Age is required";
      const ageNum = Number(value);
      if (isNaN(ageNum)) return "Age must be a number";
      if (ageNum < 1) return "Age must be at least 1";
      if (ageNum > 120) return "Age must be less than 120";
      if (!Number.isInteger(ageNum)) return "Age must be a whole number";
    }
    
    return null;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    passengers.forEach((p, index) => {
      const nameError = validateField(index, "name", p.name);
      const ageError = validateField(index, "age", p.age);
      
      if (nameError) newErrors[`${p.id}-name`] = nameError;
      if (ageError) newErrors[`${p.id}-age`] = ageError;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (index: number, field: string) => {
    const passenger = passengers[index];
    const value = passenger[field as keyof typeof passenger] as string;
    const error = validateField(index, field, value);
    
    if (error) {
      setErrors((prev) => ({ ...prev, [`${passenger.id}-${field}`]: error }));
    }
    
    setTouched((prev) => ({ ...prev, [`${passenger.id}-${field}`]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Please fix all errors before continuing");
      return;
    }

    setSubmitting(true);
    try {
      // Clear existing passengers for these seats
      bookingData.passengers
        .filter((p) => selectedSeats.includes(p.seatNumber))
        .forEach((p) => removePassenger(p.id));

      // Add new passengers
      passengers.forEach((p) => {
        addPassenger({
          ...p,
          age: Number(p.age),
          gender: p.gender as Gender,
        });
      });

      toast.success("Passenger details saved successfully!");
      onComplete();
    } catch (error) {
      toast.error("Failed to save passenger details");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-700" />
          Passenger Details
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Please provide details for {passengers.length} passenger{passengers.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {passengers.map((p, i) => {
            const nameError = errors[`${p.id}-name`];
            const ageError = errors[`${p.id}-age`];
            const nameTouched = touched[`${p.id}-name`];
            const ageTouched = touched[`${p.id}-age`];

            return (
              <div
                key={p.id}
                className="border border-gray-200 rounded-lg p-5 bg-gray-50 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Passenger {i + 1}</div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                        <Ticket className="w-3.5 h-3.5" />
                        Seat {p.seatNumber}
                      </div>
                    </div>
                  </div>
                  {!nameError && !ageError && p.name && p.age && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Valid</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleChange(i, "name", e.target.value)}
                        onBlur={() => handleBlur(i, "name")}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          nameError && nameTouched
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : nameTouched && !nameError
                            ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                            : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                        }`}
                        placeholder="Enter full name"
                        required
                      />
                      {nameError && nameTouched && (
                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-red-600 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {nameError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Age Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={p.age}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (Number(val) >= 1 && Number(val) <= 120)) {
                            handleChange(i, "age", val);
                          }
                        }}
                        onBlur={() => handleBlur(i, "age")}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          ageError && ageTouched
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : ageTouched && !ageError
                            ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                            : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                        }`}
                        placeholder="Age"
                        min={1}
                        max={120}
                        required
                      />
                      {ageError && ageTouched && (
                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-red-600 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {ageError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={p.gender}
                      onChange={(e) => handleChange(i, "gender", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting || Object.keys(errors).length > 0}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-md shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="loader"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Save & Continue to Payment
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PassengerDetailsForm;
