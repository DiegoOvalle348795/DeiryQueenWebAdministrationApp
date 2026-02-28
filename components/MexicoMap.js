"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";

const MAP_PRESETS = {
  mexico: {
    url: "https://gist.githubusercontent.com/Tlaloc-Es/5c82834e5e4a9019a91123cb11f598c0/raw/709ce9126861ef7a7c7cc4afd6216a6750d4bbe1/mexico.geojson",
    nameKeys: ["ENTIDAD", "name", "NOMBRE"],
    keyKeys: ["CVE_EDO", "id"],
  },
  usa: {
    url: "https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson",
    nameKeys: ["name", "NAME"],
    keyKeys: ["iso_3166_2", "adm1_code", "id"],
  },
  canada: {
    url: "https://raw.githubusercontent.com/CyperPunk001/Immigration-to-CA-from-RSA/master/canada_provinces.geojson",
    nameKeys: ["name", "NAME", "province", "Province"],
    keyKeys: ["id", "code"],
  },
  germany: {
    url: "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/3_mittel.geo.json",
    nameKeys: ["name", "NAME"],
    keyKeys: ["id"],
  },
  china: {
    url: "https://raw.githubusercontent.com/echarts/echarts/master/map/json/china.json",
    nameKeys: ["name", "NAME", "NL_NAME_1"],
    keyKeys: ["id", "NAME_1"],
  },
};

function getFeatureName(feature, nameKeys) {
  const p = feature?.properties;
  if (!p) return "—";
  for (const key of nameKeys) {
    if (p[key]) return p[key];
  }
  return feature?.id ?? "—";
}

function getFeatureKey(feature, idx, keyKeys) {
  const p = feature?.properties;
  for (const key of keyKeys) {
    if (p?.[key] != null) return String(p[key]);
  }
  if (feature?.id != null) return String(feature.id);
  return `${idx}`;
}
export default function InteractiveMap({
  country = "mexico",
  selectedState = null,
  onSelect,
  onRegionsReady,
}) {
  const preset = MAP_PRESETS[country];
  const nameKeys = preset?.nameKeys ?? ["name", "ENTIDAD", "NOMBRE"];
  const keyKeys = preset?.keyKeys ?? ["id", "CVE_EDO"];

  const [data, setData] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [status, setStatus] = useState("loading");

  // Reset cuando cambia el país
  useEffect(() => {
    setData(null);
    setStatus("loading");
  }, [country]);

  useEffect(() => {
    if (!preset?.url) return;
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(preset.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let json = await res.json();

        // TopoJSON → GeoJSON
        if (json.type === "Topology" && json.objects) {
          const obj = Object.values(json.objects)[0];
          if (obj?.geometries) {
            json = {
              type: "FeatureCollection",
              features: obj.geometries
                .map((g, i) => ({
                  type: "Feature",
                  properties: g.properties || { name: `Region ${i + 1}` },
                  geometry:
                    g.type === "Polygon"
                      ? { type: "Polygon", coordinates: g.coordinates ?? g.arcs }
                      : g.type === "MultiPolygon"
                      ? { type: "MultiPolygon", coordinates: g.coordinates ?? [g.arcs] }
                      : null,
                }))
                .filter((f) => f.geometry),
            };
          }
        }

        if (!isMounted) return;
        setData(json);
        setStatus("ready");

        // Notificar lista de regiones al padre
        if (onRegionsReady && json.features) {
          const names = json.features.map((f) => getFeatureName(f, nameKeys)).filter(Boolean);
          onRegionsReady(names);
        }
      } catch {
        if (!isMounted) return;
        setStatus("error");
      }
    })();

    return () => { isMounted = false; };
  }, [preset?.url]);

  const { pathGenerator, features, width, height } = useMemo(() => {
    const w = 800;
    const h = 520;
    const feats = Array.isArray(data?.features) ? data.features : [];
    if (!data) return { pathGenerator: null, features: [], width: w, height: h };

    const projection = geoMercator().fitSize([w, h], data);
    const pg = geoPath(projection);
    return { pathGenerator: pg, features: feats, width: w, height: h };
  }, [data]);

  if (status === "loading") {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Cargando mapa…</span>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <span className="text-red-400 text-sm">No se pudo cargar el mapa.</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg shadow-black/40">
      {hovered && (
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-black/85 text-white px-3 py-1.5 text-sm font-medium shadow-md pointer-events-none border border-black/30">
          {hovered}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Mapa interactivo"
      >
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        <g>
          {features.map((feature, idx) => {
            const name = getFeatureName(feature, nameKeys);
            const key = getFeatureKey(feature, idx, keyKeys);
            const isSelected = selectedState === name;
            const isHovered = hovered === name;

            return (
              <path
                key={key}
                d={pathGenerator ? pathGenerator(feature) : ""}
                fill={
                  isSelected
                    ? "rgba(250, 200, 0, 0.9)"
                    : isHovered
                    ? "rgb(199, 195, 195)"
                    : "rgb(255, 255, 255)"
                }
                stroke="#000"
                strokeWidth={1.2}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  onSelect?.(name, feature?.properties || { name });
                }}
                style={{
                  cursor: "pointer",
                  transition: "fill 150ms ease",
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
