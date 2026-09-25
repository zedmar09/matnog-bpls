"use client";

import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { MapBusiness } from "@/features/business-registry/business-data";

import styles from "../[id]/map/map.module.css";

function markerClass(status: string) {
  if (status === "Active") return styles.markerActive;
  if (status === "For Renewal" || status === "With Deficiency") return styles.markerWarning;
  if (status === "Expired" || status === "Suspended" || status === "Closed") return styles.markerDanger;
  return "";
}

function iconFor(marker: MapBusiness) {
  return L.divIcon({
    className: "",
    html: `<span class="${styles.marker} ${markerClass(marker.status)}">${marker.id.replace("BUS-", "")}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

export function BusinessRegistryMapClient({ markers }: { markers: MapBusiness[] }) {
  return (
    <MapContainer className={styles.mapCanvas} center={[12.5828, 124.0809]} zoom={13} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={iconFor(marker)}>
          <Popup>
            <strong>{marker.name}</strong>
            <br />
            {marker.barangay} | {marker.lineOfBusiness}
            <br />
            {marker.status}
            <br />
            <Link href={`/businesses/${marker.id}`}>View profile</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
