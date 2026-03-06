import { NextResponse } from "next/server";
import connectMongoose from "@/libs/mongoose";
import User from "@/models/User";
import { hash } from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const newPassword = (body?.newPassword ?? "").toString();

    if (!email || !/^.+@.+\..+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    await connectMongoose();
    const user = await User.findOne({ email }).select("_id").lean();
    if (!user) {
      return NextResponse.json(
        { error: "No existe una cuenta con ese correo." },
        { status: 404 }
      );
    }

    const passwordHash = await hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { passwordHash });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo actualizar la contraseña." },
      { status: 500 }
    );
  }
}

