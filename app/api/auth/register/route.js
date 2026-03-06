import { NextResponse } from "next/server";
import connectMongoose from "@/libs/mongoose";
import User from "@/models/User";
import { hash } from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = (body?.password ?? "").toString();

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }
    if (!email || !/^.+@.+\..+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    await connectMongoose();

    const exists = await User.findOne({ email }).select("_id").lean();
    if (exists) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "user",
    });

    return NextResponse.json({ ok: true, userId: user._id.toString() });
  } catch (e) {
    return NextResponse.json({ error: "No se pudo registrar el usuario." }, { status: 500 });
  }
}

