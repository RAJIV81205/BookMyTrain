"use client"

import Fare from "@/components/Book/Fare"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { useBooking } from "@/context/BookingContext"

export default function checkoutLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true)
    const { bookingData } = useBooking();


    const verifyToken = async (t: string) => {
        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${t}`
                }
            })

            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            return await response.json()
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        toast.promise(
            verifyToken(token),
            {
                loading: "Verifying Token",
                success: "Token Verified",
                error: "Token Expired"
            }
        ).then(() => {
            setLoading(false)
        }).catch(() => {
            localStorage.removeItem("token");
            router.push("/auth/login");
        })

    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <div className="h-96 bg-gray-200 animate-pulse"></div>
                        </div>
                        <div className="lg:w-80">
                            <div className="h-96 bg-gray-200 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50 font-poppins">
            <div className="max-w-7xl mx-auto p-4">
                {/* Header */}
                <div className="mb-6">


                    {/* Progress Steps */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center space-x-4">
                            <div className={`flex items-center ${bookingData.currentStep === "seats" ? "text-blue-600" : bookingData.currentStep === "passengers" || bookingData.currentStep === "payment" ? "text-green-600" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingData.currentStep === "seats" ? "bg-blue-100 border-2 border-blue-600" : bookingData.currentStep === "passengers" || bookingData.currentStep === "payment" ? "bg-green-100 border-2 border-green-600" : "bg-gray-100 border-2 border-gray-400"}`}>
                                    1
                                </div>
                                <span className="ml-2 font-medium">Select Seats</span>
                            </div>
                            <div className={`w-8 h-0.5 ${bookingData.currentStep === "passengers" || bookingData.currentStep === "payment" ? "bg-green-600" : "bg-gray-300"}`}></div>
                            <div className={`flex items-center ${bookingData.currentStep === "passengers" ? "text-blue-600" : bookingData.currentStep === "payment" ? "text-green-600" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingData.currentStep === "passengers" ? "bg-blue-100 border-2 border-blue-600" : bookingData.currentStep === "payment" ? "bg-green-100 border-2 border-green-600" : "bg-gray-100 border-2 border-gray-400"}`}>
                                    2
                                </div>
                                <span className="ml-2 font-medium">Passenger Details</span>
                            </div>
                            <div className={`w-8 h-0.5 ${bookingData.currentStep === "payment" ? "bg-green-600" : "bg-gray-300"}`}></div>
                            <div className={`flex items-center ${bookingData.currentStep === "payment" ? "text-green-600" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingData.currentStep === "payment" ? "bg-green-100 border-2 border-green-600" : "bg-gray-100 border-2 border-gray-400"}`}>
                                    3
                                </div>
                                <span className="ml-2 font-medium">Payment</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        {children}
                    </div>
                    <div className="lg:w-80 ">
                        <Fare />
                    </div>
                </div>
            </div>
        </div>
    )
}