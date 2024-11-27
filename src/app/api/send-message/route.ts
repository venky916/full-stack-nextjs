import { Message } from "@/model/User";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request:NextRequest) {
    await dbConnect();

    const { username, content } = await request.json();
    
    try {
        const user = await UserModel.findOne({ username });

        if (!user) {
            return NextResponse.json({
            success: false,
            message:"User not found"
        },{status:404})
        }

        // is user accepting the messages

        if (!user.isAcceptingMessage) {
            return NextResponse.json({
            success: false,
            message:"User is not accepting messages"
        },{status:403})
        }

        const newMessage = { content, createdAt: new Date() }
        
        user.messages.push(newMessage as Message)

        await user.save();

        return NextResponse.json({
            success: true,
            message:"message sent successfully"
        },{status:500})
        
    } catch (error) {
        console.log("Error adding messages",error)
        return NextResponse.json({
            success: false,
            message:"Internal server error"
        },{status:500})
    }
}