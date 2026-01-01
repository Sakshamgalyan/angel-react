
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
        return NextResponse.json({ authenticated: false, locked: false });
    }
    
    // Parse cookies manually or use a library, but simplest is to check for auth-token
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    const userId = match ? match[1] : null;

    if (!userId) {
      return NextResponse.json({ authenticated: false, locked: false });
    }

    const db = await getDatabase();
    // Assuming userId is an ObjectId string
    let objectId;
    try {
        objectId = new ObjectId(userId);
    } catch (e) {
        return NextResponse.json({ authenticated: false, locked: false });
    }

    const user = await db.collection("users").findOne({ _id: objectId });

    if (!user) {
      return NextResponse.json({ authenticated: false, locked: false });
    }

    let isLocked = !!user.isLocked || !!user.locked; 
    let lockedAt = user.lockedAt || user.isLockedAt;

    if (isLocked && lockedAt) {
        const lockTime = new Date(lockedAt).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - lockTime > twentyFourHours) {
            // Unlock user
            await db.collection("users").updateOne(
                { _id: user._id },
                { 
                    $set: { isLocked: false, locked: false },
                    $unset: { lockedAt: "", isLockedAt: "" } // Optional: clear timestamp
                }
            );
            isLocked = false;
        }
    }
    
    const responseLockedAt = isLocked ? (lockedAt || new Date().toISOString()) : null;

    return NextResponse.json({ 
        authenticated: true, 
        locked: isLocked, 
        lockedAt: responseLockedAt,
        role: user.role || 'merchant' 
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ authenticated: false, locked: false }, { status: 500 });
  }
}
