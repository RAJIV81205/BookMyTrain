"use client"

import Fare from "@/components/Dashboard/Book/Fare"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function checkoutLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true)


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
            router.push("/login");
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
                        <div className="lg:w-80 lg:mt-28">
                            <div className="h-96 bg-gray-200 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        {children}
                    </div>
                    <div className="lg:w-80 lg:mt-28">
                        <Fare />
                    </div>
                </div>
            </div>
        </div>
    )
}