"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Crosshair, MapPinned, Navigation, RefreshCw } from "lucide-react";

import { getBusinessById, MATNOG_COORDINATES } from "@/features/business-registry/business-data";

import detailStyles from "../../../applications/[id]/application-detail.module.css";
import mapStyles from "./map.module.css";

const BusinessMapClient = dynamic(
  () => import("./map-client").then((module) => module.BusinessMapClient),
  { ssr: false },
);

export default function BusinessMapPage() {
  const params = useParams<{ id: string }>();
  const business = getBusinessById(params.id);
  const selectedMarker = {
    id: business.id,
    name: business.businessName,
    barangay: business.barangay,
    lineOfBusiness: business.lineOfBusiness,
    status: business.status,
    latitude: Number(business.latitude),
    longitude: Number(business.longitude),
  };
  const markers = [
    selectedMarker,
    ...MATNOG_COORDINATES.filter((marker) => marker.id !== business.id),
  ];

  return (
    <main className={detailStyles.page}>
      <div className={detailStyles.hero}>
        <div className={detailStyles.heroInner}>
          <div className={detailStyles.heroText}>
            <Link className={detailStyles.btnSecondary} href={`/businesses/${business.id}`}>
              <ArrowLeft size={14} /> Back to profile
            </Link>
            <h1>Map Location</h1>
            <div className={detailStyles.heroSub}>
              <span><MapPinned size={14} /> {business.businessName}</span>
              <span><Navigation size={14} /> {business.latitude}, {business.longitude}</span>
            </div>
          </div>
          <div className={detailStyles.heroActions}>
            <Link className={detailStyles.btnPrimary} href={`/applications/renewals?businessId=${business.id}`}>
              <RefreshCw size={15} /> Start Renewal
            </Link>
            <Link className={detailStyles.btnSecondary} href={`/businesses/${business.id}/edit`}>
              <Building2 size={15} /> Edit Registry
            </Link>
          </div>
        </div>
      </div>

      <div className={detailStyles.body}>
        <div className={mapStyles.mapLayout}>
          <section className={mapStyles.mapPanel}>
            <BusinessMapClient business={business} markers={markers} />
          </section>

          <aside className={mapStyles.sidePanel}>
            <div className={mapStyles.sideHeader}>
              <h3>Matnog GIS Preview</h3>
              <p>Dummy coordinates only. Markers are constrained around Matnog, Sorsogon for UI validation.</p>
            </div>
            <div className={detailStyles.detailCardBody}>
              <dl className={detailStyles.dataList}>
                <div className={detailStyles.dataRow}><dt>Selected business</dt><dd>{business.businessName}</dd></div>
                <div className={detailStyles.dataRow}><dt>Barangay</dt><dd>{business.barangay}</dd></div>
                <div className={detailStyles.dataRow}><dt>Line of business</dt><dd>{business.lineOfBusiness}</dd></div>
                <div className={detailStyles.dataRow}><dt>Status</dt><dd>{business.status}</dd></div>
                <div className={detailStyles.dataRow}><dt>Coordinates</dt><dd>{business.latitude}, {business.longitude}</dd></div>
              </dl>
            </div>
            <div className={mapStyles.sideHeader}>
              <h3>Nearby dummy markers</h3>
              <p>{markers.length} sample business points loaded.</p>
            </div>
            <div className={mapStyles.mapList}>
              {markers.map((marker) => (
                <div className={mapStyles.mapItem} key={marker.id}>
                  <strong>{marker.name}</strong>
                  <span>{marker.barangay} | {marker.lineOfBusiness}</span>
                  <span><Crosshair size={11} /> {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)} | {marker.status}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
