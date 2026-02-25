"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";

const DEFAULT_GEOJSON_URL =
	"https://gist.githubusercontent.com/Tlaloc-Es/5c82834e5e4a9019a91123cb11f598c0/raw/709ce9126861ef7a7c7cc4afd6216a6750d4bbe1/mexico.geojson";

function getStateName(feature) {
	return (
		feature?.properties?.ENTIDAD ||
		feature?.properties?.name ||
		feature?.properties?.NOMBRE ||
		"Estado"
	);
}

function getStateKey(feature, idx) {
	return feature?.properties?.CVE_EDO || feature?.id || `${idx}`;
}

export default function MexicoMap({
	geojsonUrl = DEFAULT_GEOJSON_URL,
	onSelect,
}) {
	const [data, setData] = useState(null);
	const [hovered, setHovered] = useState(null);
	const [selected, setSelected] = useState(null);
	const [status, setStatus] = useState("loading"); // loading | ready | error

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				setStatus("loading");
				const res = await fetch(geojsonUrl);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				if (!isMounted) return;
				setData(json);
				setStatus("ready");
			} catch (e) {
				if (!isMounted) return;
				setStatus("error");
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [geojsonUrl]);

	const { pathGenerator, features, width, height } = useMemo(() => {
		const w = 800;
		const h = 520;
		const feats = Array.isArray(data?.features) ? data.features : [];

		if (!data) {
			return {
				pathGenerator: null,
				features: [],
				width: w,
				height: h,
			};
		}

		const projection = geoMercator();
		// fitSize muta el projection internamente
		projection.fitSize([w, h], data);
		const pg = geoPath(projection);

		return { pathGenerator: pg, features: feats, width: w, height: h };
	}, [data]);

	if (status === "loading") {
		return (
			<div className="w-full rounded-xl bg-transparent p-6">
				<div className="font-semibold">Mapa de México</div>
				<div className="text-sm text-base-content/70">Cargando…</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="w-full rounded-xl bg-transparent p-6">
				<div className="font-semibold">Mapa de México</div>
				<div className="text-sm text-error">
					No se pudo cargar el mapa. Revisa tu conexión o la URL del GeoJSON.
				</div>
			</div>
		);
	}

	return (
		<div className="w-full rounded-xl bg-transparent p-4 md:p-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
				<div>
					<div className="font-semibold">Mapa de México</div>
					<div className="text-sm text-base-content/70">
						Selecciona tu ubicación.
					</div>
				</div>
				<div className="text-sm">
					<span className="font-semibold">Seleccionado:</span>{" "}
					{selected || "—"}
				</div>
			</div>

			<div className="relative">
				{hovered ? (
					<div className="absolute left-3 top-3 z-10 rounded-lg bg-black/70 text-white px-3 py-1 text-sm">
						{hovered}
					</div>
				) : null}

				<svg
					viewBox={`0 0 ${width} ${height}`}
					className="w-full h-auto"
					role="img"
					aria-label="Mapa de México por estados"
				>
					<rect
						x="0"
						y="0"
						width={width}
						height={height}
						fill="transparent"
					/>
					<g>
						{features.map((feature, idx) => {
							const name = getStateName(feature);
							const key = getStateKey(feature, idx);
							const isSelected = selected === name;

							return (
								<path
									key={key}
									d={pathGenerator ? pathGenerator(feature) : ""}
									fill={isSelected ? "rgba(37, 235, 37, 0.77)" : "rgba(255,255,255,0.35)"}
									stroke="rgba(0, 0, 0, 0.98)"
									strokeWidth={0.8}
									onMouseEnter={() => setHovered(name)}
									onMouseLeave={() => setHovered(null)}
									onClick={() => {
										setSelected(name);
										onSelect?.(feature?.properties || { name });
									}}
									style={{ cursor: "pointer" }}
								/>
							);
						})}
					</g>
				</svg>
			</div>
		</div>
	);
}

