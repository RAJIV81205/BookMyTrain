import { NextResponse } from "next/server";
import z from "zod";
import connectDB from "@/lib/db/db";
import Admin from "@/lib/db/model/Admin";
import bcrypt from "bcryptjs";

export async function POST(request:Request){
    const body = await request.json();

}