import { generateToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { message: "Google access token wajib diisi" },
        { status: 400 },
      );
    }

    // Validasi access token sekaligus mendapatkan data user dari Google
    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        { message: "Google access token tidak valid" },
        { status: 401 },
      );
    }

    const googleUser = await googleResponse.json();

    if (!googleUser.email) {
      return NextResponse.json(
        { message: "Email Google tidak ditemukan" },
        { status: 401 },
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    let user = await db.collection("users").findOne({
      email: googleUser.email,
    });

    // Register
    if (!user) {
      const result = await db.collection("users").insertOne({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: "google",
        createdAt: new Date(),
      });

      user = {
        _id: result.insertedId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: "google",
      };
    }

    // Generate JWT berdasarkan user yang sudah diverifikasi
    const token = await generateToken(user._id.toString(), user.email);

    const response = NextResponse.json(
      {
        message: "Berhasil login!",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      },
      { status: 200 },
    );

    // Simpan JWT sebagai HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
