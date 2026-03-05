 "use client";

import Link from "next/link";
import fondoPc from "../../components/images/fondo_2_pc_sin_gemini.png";
import fondoCel from "../../components/images/fondo_cel_sin_gemini.png";

export default function ChangePasswordPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí se integrará la lógica real de cambio de contraseña.
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
              Cambiar contraseña
            </h2>
            <p className="text-base-content/80 text-center mb-6">
              Ingresa tu correo y una nueva contraseña.
            </p>

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
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Nueva contraseña</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Confirmar nueva contraseña</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Repite la contraseña"
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">
                Guardar contraseña
              </button>
            </form>

            <p className="mt-4 text-sm text-center">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="link link-primary">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

