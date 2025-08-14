"use client"

import Fare from "@/components/Dashboard/Book/Fare"

export default function checkoutLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
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