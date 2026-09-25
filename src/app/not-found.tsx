import Link from "next/link";

import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "60vh", textAlign: "center", gap: 12, padding: 32, color: "#27304a" }}>
      <Compass size={44} />
      <h1 style={{ fontSize: 22, fontWeight: 650, margin: 0 }}>Page not found</h1>
      <p style={{ color: "#6b7187", margin: 0 }}>This page isn't part of the current preview.</p>
      <Link href="/" style={{ marginTop: 8, padding: "8px 20px", borderRadius: 8, background: "#7047d7", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
        Return to Dashboard
      </Link>
    </main>
  );
}
