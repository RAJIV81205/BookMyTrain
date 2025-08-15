import { NextResponse } from "next/server";
import verifyToken from "@/lib/db/middleware/verifyToken";
import z from "zod";
import Train from "@/lib/db/model/Train";
import connectDB from "@/lib/db/db";

const schema = z.object({
    trainNo: z.string().length(5, "Train number must be exactly 5 digits").regex(/^\d+$/, "Train number must be numeric"),
    date: z.string()
});

export async function POST(request: Request) {
    
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        
        if (!token) return NextResponse.json({ error: "No Token Provided" }, { status: 401 });

        const user = await verifyToken(token);
        
        if (!user) return NextResponse.json({ error: "Invalid Token or User" }, { status: 401 });

        const body = await request.json();
        

        const validation = schema.safeParse(body);
        if (!validation.success) {
            
            return NextResponse.json({ error: validation.error.issues }, { status: 400 });
        }

        const result = await getAvailableSeats(body.trainNo, body.date);
        return result;
    } catch (err: any) {
       
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}

async function getAvailableSeats(trainNo: string, date: string) {
   

    try {
        
        await connectDB();
        

      
        const train = await Train.findOne({ trainNo: Number(trainNo) }); // ensure numeric match
   

        if (!train) {
            
            return NextResponse.json({ error: "Train not found" }, { status: 404 });
        }

       
        return NextResponse.json({ classes: train.classes }, { status: 200 });

    } catch (error: any) {
        console.error("💥 Error fetching available seats:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch available seats" }, { status: 500 });
    }
}
