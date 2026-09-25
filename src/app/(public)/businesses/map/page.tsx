"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Building2, Crosshair, Download, MapPinned, RefreshCw } from "lucide-react";

import { MATNOG_COORDINATES } from "@/features/business-registry/business-data";

import detailStyles from "../../applications/[id]/application-detail.module.css";
import mapStyles from "../[id]/map/map.module.css";

const BusinessRegistryMapClient = dynamic(
  () => import("./map-client").then((module) => module.BusinessRegistryMapClient),
  { ssr: false },
);

export default function BusinessRegistryMapPage() {
  const activeCount = MATNOG_COORDINATES.filter((marker) => marker.status === "Active").length;
  const watchCount = MATNOG_COORDINATES.filter((marker) => marker.status !== "Active").length;

  return (
    <main className={detailStyles.page}>
      <div className={detailStyles.hero}>
        <div className={detailStyles.heroInner}>
          <div className={detailStyles.heroText}>
            <Link className={detailStyles.btnSecondary} href="/businesses">
              <ArrowLeft size={14} /> Back to registry
            </Link>
            <h1>Business Map View</h1>
            <div className={detailStyles.heroSub}>
              <span><MapPinned size={14} /> Matnog, Sorsogon GIS preview</span>
              <span><Building2 size={14} /> {MATNOG_COORDINATES.length} dummy business points</span>
            </div>
          </div>
          <div className={detailStyles.heroActions}>
            <Link className={detailStyles.btnPrimary} href="/applications/renewals">
              <RefreshCw size={15} /> Renew Business
            </Link>
            <button className={detailStyles.btnSecondary} type="button">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className={detailStyles.body}>
        <div className={mapStyles.mapLayout}>
          <section className={mapStyles.mapPanel}>
            <BusinessRegistryMapClient markers={MATNOG_COORDINATES} />
          </section>

          <aside className={mapStyles.sidePanel}>
            <div className={mapStyles.sideHeader}>
              <h3>Matnog Business GIS</h3>
              <p>Dummy Leaflet markers only, constrained around Matnog barangays for UI validation.</p>
            </div>
            <div className={detailStyles.detailCardBody}>
              <dl className={detailStyles.dataList}>
                <div className={detailStyles.dataRow}><dt>Total markers</dt><dd>{MATNOG_COORDINATES.length}</dd></div>
                <div className={detailStyles.dataRow}><dt>Active</dt><dd>{activeCount}</dd></div>
                <div className={detailStyles.dataRow}><dt>Watchlist</dt><dd>{watchCount}</dd></div>
                <div className={detailStyles.dataRow}><dt>Map center</dt><dd>12.5828, 124.0809</dd></div>
              </dl>
            </div>
            <div className={mapStyles.sideHeader}>
              <h3>Business markers</h3>
              <p>Select a profile from the list or map popup.</p>
            </div>
            <div className={mapStyles.mapList}>
              {MATNOG_COORDINATES.map((marker) => (
                <Link className={mapStyles.mapItem} href={`/businesses/${marker.id}`} key={marker.id}>
                  <strong>{marker.name}</strong>
                  <span>{marker.barangay} | {marker.lineOfBusiness}</span>
                  <span><Crosshair size={11} /> {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)} | {marker.status}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
