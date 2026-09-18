import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.userId as string),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      playlists: user.playlists ?? null,
      favorites: user.favorites ?? null,
    });
  } catch (error) {
    console.error("GET /api/user/library error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { playlists, favorites } = body;

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (Array.isArray(playlists)) {
      updateFields.playlists = playlists;
    }
    if (Array.isArray(favorites)) {
      updateFields.favorites = favorites;
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId as string) },
      { $set: updateFields },
    );

    return NextResponse.json({
      message: "Library updated successfully",
      playlists: updateFields.playlists,
      favorites: updateFields.favorites,
    });
  } catch (error) {
    console.error("PUT /api/user/library error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
