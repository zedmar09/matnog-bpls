"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { BusinessRecord, MapBusiness } from "@/features/business-registry/business-data";

import styles from "./map.module.css";

function markerClass(status: string) {
  if (status === "Active") return styles.markerActive;
  if (status === "For Renewal" || status === "With Deficiency") return styles.markerWarning;
  if (status === "Expired" || status === "Suspended" || status === "Closed") return styles.markerDanger;
  return "";
}

function iconFor(marker: MapBusiness, activeId: string) {
  return L.divIcon({
    className: "",
    html: `<span class="${styles.marker} ${marker.id === activeId ? styles.markerActive : markerClass(marker.status)}">${marker.id.replace("BUS-", "")}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

export function BusinessMapClient({ business, markers }: { business: BusinessRecord; markers: MapBusiness[] }) {
  const center: [number, number] = [Number(business.latitude), Number(business.longitude)];

  return (
    <MapContainer className={styles.mapCanvas} center={center} zoom={14} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={iconFor(marker, business.id)}
        >
          <Popup>
            <strong>{marker.name}</strong>
            <br />
            {marker.barangay} | {marker.lineOfBusiness}
            <br />
            {marker.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
