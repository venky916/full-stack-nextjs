import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request:NextRequest) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);
        
        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return NextResponse.json({
                success: false,
                message:"User not found"
            },{status:400})
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save()

            return NextResponse.json({
                success: true,
                message:"Account Verified successfully"
            },{status:200})
        } else if (!isCodeNotExpired) {
            return NextResponse.json({
                success: false,
                message:"Verification code as expired Please sign up again to get a new code"
            },{status:400})
        } else {
            return NextResponse.json({
                success: false,
                message:"Incorrect Verification code"
            },{status:400})
        }
        
    } catch (error) {
        console.error("Verifying user", error);
        return NextResponse.json({
            success: false,
            message:"Error Verifying user"
        },{status:500})
    }
}