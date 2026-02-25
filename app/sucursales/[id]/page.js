export default function DetalleSucursalPage({ params }) {
  const id = params?.id || "N/A";
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Detalle Sucursal</h1>
        <p className="text-base-content/70">
          Página de detalle de sucursal - ID: {id}
        </p>
      </div>
    </div>
  );
}
