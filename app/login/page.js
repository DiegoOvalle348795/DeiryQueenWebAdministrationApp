"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import config from "@/config";
import fondoPc from "../../components/images/fondo_2_pc_sin_gemini.png";
import fondoCel from "../../components/images/fondo_cel_sin_gemini.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: config.auth.callbackUrl,
      });

      if (res?.error) {
        toast.error("Correo o contraseña incorrectos.");
        return;
      }

      window.location.href = res?.url || config.auth.callbackUrl;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo para desktop */}
      <div
        className="hidden md:block absolute inset-0"
        style={{
          backgroundImage: `url(${fondoPc.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Fondo para móvil */}
      <div
        className="block md:hidden absolute inset-0"
        style={{
          backgroundImage: `url(${fondoCel.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Capa oscura para mejorar contraste */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-md bg-base-100/90 shadow-2xl backdrop-blur-md">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-2 justify-center">
              Iniciar sesión
            </h2>
            <p className="text-base-content/80 text-center mb-6">
              Accede al panel de administración de Dairy Queen.
            </p>

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={() =>
                signIn("google", { callbackUrl: config.auth.callbackUrl })
              }
            >
              Continuar con Google
            </button>

            <div className="divider my-4">o</div>

            <form className="form-control space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="label">
                  <span className="label-text">Correo electrónico</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="tucorreo@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Contraseña</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <div className="mt-4 text-sm text-center space-y-1">
              <p>
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="link link-primary">
                  Regístrate
                </Link>
              </p>
              <p>
                <Link href="/change-password" className="link link-primary">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
