import type { Metadata } from "next";
import {  Poppins, Source_Sans_3 , Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { BookingProvider } from "@/context/BookingContext";


const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const sans3 = Source_Sans_3({
  variable: "--font-sans3",
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookMyTrain",
  description: "Book your train tickets with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${sans3.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            className: "bg-white text-gray-900 shadow-lg",
            style: {
              fontFamily: "var(--font-poppins)",
              fontSize: "14px",
            },
          }}
        />

        <BookingProvider>{children}</BookingProvider>

      </body>
    </html>
  );
}
