// File: app/api/login/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        // Securely compare the submitted credentials with the environment variables
        const isUsernameCorrect = username === process.env.ADMIN_USERNAME;
        const isPasswordCorrect = password === process.env.ADMIN_PASSWORD;

        if (isUsernameCorrect && isPasswordCorrect) {
            // If credentials are correct, send a success response
            return NextResponse.json({ success: true });
        } else {
            // If they are incorrect, send an unauthorized error
            return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}