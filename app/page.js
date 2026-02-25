import Image from "next/image";
import bgDesktop from "@/components/images/background desktop.png";
import bgMobile from "@/components/images/wallpaper_1080x1920.png";
import MexicoMap from "@/components/MexicoMap";

export const metadata = {
  title: "Elegir Ubicación - Dairy Queen",
  description: "Selecciona tu ubicación para encontrar tu Dairy Queen más cercano",
};

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Background solo en la página principal */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={bgMobile}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <Image
          src={bgDesktop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Elegir Ubicación</h1>
          <p className="text-base-content/70">
            Página principal - Selecciona tu ubicación
          </p>

          <div className="mt-8">
            <MexicoMap />
          </div>
        </div>
      </div>
    </main>
  );
}
