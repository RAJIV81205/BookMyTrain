import {NextResponse} from "next/server";
import connectDB from "@/lib/db/db";
import verifyAdmin from "@/lib/db/middleware/verifyAdmin";
import Train from "@/lib/db/model/Train";
import User from "@/lib/db/model/User";

export async function GET(request:Request){
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if(!token) return NextResponse.json({error:"Unauthorized"},{status:401});

    const adminResult = await verifyAdmin(token);
    if(adminResult.error) return NextResponse.json({error:adminResult.error},{status:adminResult.status || 401});

    try{
        await connectDB();
        const trains = await Train.countDocuments({});
        const users = await User.countDocuments({});
        return NextResponse.json({trains,users},{status:200});
    }catch(error){
        console.error("Error fetching analytics:",error);
        return NextResponse.json({error:"Failed to fetch analytics"},{status:500});
    }

}