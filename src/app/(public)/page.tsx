"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileText,
  ScrollText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./dashboard.module.css";

/* ── Monthly revenue data ── */
const REVENUE_DATA = [
  { month: "Jan", collected: 125400, target: 150000 },
  { month: "Feb", collected: 189600, target: 150000 },
  { month: "Mar", collected: 247800, target: 180000 },
  { month: "Apr", collected: 156200, target: 180000 },
  { month: "May", collected: 198500, target: 200000 },
  { month: "Jun", collected: 215300, target: 200000 },
];

/* ── Application trend data ── */
const APP_TREND = [
  { month: "Jan", newApps: 18, renewals: 32, amendments: 5 },
  { month: "Feb", newApps: 22, renewals: 45, amendments: 8 },
  { month: "Mar", newApps: 35, renewals: 58, amendments: 12 },
  { month: "Apr", newApps: 28, renewals: 42, amendments: 7 },
  { month: "May", newApps: 19, renewals: 35, amendments: 6 },
  { month: "Jun", newApps: 24, renewals: 38, amendments: 9 },
];

/* ── Permit types issued ── */
const PERMIT_TYPES = [
  { name: "Mayor's Permit", value: 78, fill: "#1a1a1a" },
  { name: "Business Permit", value: 24, fill: "#666" },
  { name: "Special Permit", value: 12, fill: "#bbb" },
];

/* ── Review by department ── */
const REVIEW_DEPT = [
  { dept: "BPLO", pending: 5, completed: 18 },
  { dept: "Sanitary", pending: 4, completed: 12 },
  { dept: "Fire", pending: 3, completed: 15 },
  { dept: "Zoning", pending: 2, completed: 8 },
];

/* ── Compliance breakdown ── */
const COMPLIANCE_DATA = [
  { name: "Compliant", value: 142, fill: "#14794f" },
  { name: "Non-Compliant", value: 18, fill: "#ef4444" },
  { name: "Under Review", value: 12, fill: "#3b82f6" },
  { name: "Expired Permit", value: 24, fill: "#f59e0b" },
  { name: "Suspended", value: 6, fill: "#888" },
];

/* ── Payment method breakdown ── */
const PAYMENT_METHODS = [
  { method: "Cash", amount: 485200 },
  { method: "Check", amount: 312800 },
  { method: "Bank Transfer", amount: 198500 },
  { method: "GCash", amount: 89400 },
  { method: "Maya", amount: 47000 },
];

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

const PIPELINE = [
  { label: "Draft", count: 12, color: "#d4d4d4" },
  { label: "Submitted", count: 28, color: "#a3a3a3" },
  { label: "Under Review", count: 35, color: "#666" },
  { label: "Assessed", count: 22, color: "#444" },
  { label: "For Payment", count: 15, color: "#333" },
  { label: "For Release", count: 18, color: "#1a1a1a" },
];
const PIPELINE_TOTAL = PIPELINE.reduce((s, p) => s + p.count, 0);

const ACTIVITIES = [
  { icon: FileText, bg: "#f0f0f0", color: "#555", text: "<strong>BP-2025-0027</strong> — Casa Matnog Pension House submitted a new application", time: "10 minutes ago" },
  { icon: CreditCard, bg: "#e2f6ed", color: "#14794f", text: "<strong>OR-2025-001254</strong> — Payment of ₱22,500 received from Matnog Beach Resort", time: "25 minutes ago" },
  { icon: CheckCircle2, bg: "#e5f2fb", color: "#296a96", text: "<strong>BP-2025-0005</strong> — Southern Hardware Supply approved by BPLO", time: "1 hour ago" },
  { icon: ScrollText, bg: "#f0f0f0", color: "#555", text: "<strong>MP-2025-0012</strong> — Mayor's Permit released to Matnog Veterinary Clinic", time: "2 hours ago" },
  { icon: AlertTriangle, bg: "#fff3d8", color: "#916716", text: "<strong>BP-2025-0007</strong> — Matnog Pharmacy sanitary clearance overdue", time: "3 hours ago" },
  { icon: ShieldCheck, bg: "#e2f6ed", color: "#14794f", text: "<strong>MP-2025-0011</strong> — Matnog Lumber passed compliance inspection", time: "4 hours ago" },
];

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1>Dashboard</h1>
            <p>Business Permits and Licensing System — Municipality of Matnog, Sorsogon</p>
            <div className={styles.heroMeta}>
              <span><Calendar size={13} /> FY 2025 — Q2</span>
              <span><Building2 size={13} /> 202 Registered Businesses</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── KPI cards ── */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Applications</span>
              <div className={styles.kpiIconWrap}><FileText size={16} /></div>
            </div>
            <p className={styles.kpiValue}>248</p>
            <div className={styles.kpiMeta}><span className={styles.kpiUp}><ArrowUpRight size={12} /> +12%</span> vs last quarter</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Revenue Collected</span>
              <div className={styles.kpiIconWrap}><CircleDollarSign size={16} /></div>
            </div>
            <p className={styles.kpiValue}>₱1.13M</p>
            <div className={styles.kpiMeta}><span className={styles.kpiUp}><ArrowUpRight size={12} /> +18%</span> vs last quarter</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Permits Issued</span>
              <div className={styles.kpiIconWrap}><ScrollText size={16} /></div>
            </div>
            <p className={styles.kpiValue}>114</p>
            <div className={styles.kpiMeta}><span className={styles.kpiUp}><ArrowUpRight size={12} /> +8%</span> vs last quarter</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Pending Reviews</span>
              <div className={styles.kpiIconWrap}><ClipboardCheck size={16} /></div>
            </div>
            <p className={styles.kpiValue}>35</p>
            <div className={styles.kpiMeta}><span className={styles.kpiDown}><ArrowDownRight size={12} /> -5%</span> vs last quarter</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Compliance Rate</span>
              <div className={styles.kpiIconWrap}><BadgeCheck size={16} /></div>
            </div>
            <p className={styles.kpiValue}>88%</p>
            <div className={styles.kpiMeta}><span className={styles.kpiUp}><ArrowUpRight size={12} /> +3%</span> vs last quarter</div>
          </div>
        </div>

        {/* ── Application Pipeline ── */}
        <div className={styles.panel} style={{ marginBottom: 16 }}>
          <div className={styles.panelHeader}>
            <h3>Application Pipeline</h3>
            <span>{PIPELINE_TOTAL} applications in progress</span>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.pipelineBar}>
              {PIPELINE.map((p) => (
                <div key={p.label} className={styles.pipelineSeg} style={{ width: `${(p.count / PIPELINE_TOTAL) * 100}%`, background: p.color }} />
              ))}
            </div>
            <div className={styles.pipelineLegend}>
              {PIPELINE.map((p) => (
                <div key={p.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: p.color }} />
                  {p.label} <span className={styles.legendValue}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Revenue + Application Trend ── */}
        <div className={styles.grid2}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Revenue Collection</h3>
              <span>Jan – Jun 2025</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => peso(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0" }} />
                    <Area type="monotone" dataKey="target" stroke="#ccc" strokeDasharray="4 4" fill="none" name="Target" />
                    <Area type="monotone" dataKey="collected" stroke="#1a1a1a" strokeWidth={2} fill="url(#gCollected)" name="Collected" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Application Trends</h3>
              <span>Jan – Jun 2025</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={APP_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="renewals" stackId="a" fill="#1a1a1a" radius={[0, 0, 0, 0]} name="Renewals" />
                    <Bar dataKey="newApps" stackId="a" fill="#888" name="New" />
                    <Bar dataKey="amendments" stackId="a" fill="#ccc" radius={[3, 3, 0, 0]} name="Amendments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── Permits + Reviews + Payment Methods ── */}
        <div className={styles.grid3}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Permits by Type</h3>
              <span>{PERMIT_TYPES.reduce((s, p) => s + p.value, 0)} total</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.chartWrapSmall}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PERMIT_TYPES}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {PERMIT_TYPES.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Reviews by Department</h3>
              <span>Current quarter</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.chartWrapSmall}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVIEW_DEPT} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="completed" fill="#1a1a1a" radius={[0, 3, 3, 0]} name="Completed" barSize={16} />
                    <Bar dataKey="pending" fill="#ccc" radius={[0, 3, 3, 0]} name="Pending" barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Payment Methods</h3>
              <span>{peso(PAYMENT_METHODS.reduce((s, p) => s + p.amount, 0))}</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.chartWrapSmall}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PAYMENT_METHODS} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="method" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => peso(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0" }} />
                    <Bar dataKey="amount" fill="#1a1a1a" radius={[4, 4, 0, 0]} name="Amount" barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── Compliance + Recent Activity ── */}
        <div className={styles.gridWide}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Recent Activity</h3>
              <span>Today</span>
            </div>
            {ACTIVITIES.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityIcon} style={{ background: a.bg, color: a.color }}>
                    <Icon size={16} />
                  </div>
                  <div className={styles.activityInfo}>
                    <p dangerouslySetInnerHTML={{ __html: a.text }} />
                    <div className={styles.activityTime}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Compliance Overview</h3>
              <span>202 businesses</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.chartWrapSmall}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={COMPLIANCE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {COMPLIANCE_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {COMPLIANCE_DATA.map((c) => (
              <div key={c.name} className={styles.statRow}>
                <span className={styles.statDot} style={{ background: c.fill }} />
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>{c.name}</span>
                </div>
                <span className={styles.statNum}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
