import { useState } from "react";
import ReportCard from "@/components/admin/ReportCard";
import ReportDateFilter from "@/components/admin/ReportDateFilter";

const REPORT_TYPES = [
  { type: 'revenue', title: 'Revenue Report', description: 'Total earnings, refunds, payment methods & monthly projections', lastRun: 'Today at 09:14', formats: ['PDF','CSV','XLSX'] },
  { type: 'bookings', title: 'Bookings Report', description: 'All reservations, occupancy rates, cancellations & lead sources', lastRun: 'Yesterday at 17:30', formats: ['PDF','CSV','XLSX'] },
  { type: 'customers', title: 'Customer Report', description: 'Guest profiles, repeat visit rates & satisfaction scores', lastRun: '3 days ago', formats: ['PDF','CSV'] },
  { type: 'tours', title: 'Tour Performance', description: 'Top tours by revenue, ratings, route efficiency & guide performance', lastRun: 'This week', formats: ['PDF','XLSX'] },
  { type: 'vehicles', title: 'Vehicle Utilisation', description: 'Fleet usage, rental duration, mileage & maintenance flags', lastRun: '2 weeks ago', formats: ['PDF','CSV','XLSX'] },
  { type: 'overview', title: 'Executive Overview', description: 'One-page summary: all KPIs, trends & recommendations', lastRun: 'Last month', formats: ['PDF'] },
];

const RECENT_DOWNLOADS = [
  { name: 'Revenue Report — March 2026', fmt: 'PDF', time: 'Today 09:14', size: '142 KB' },
  { name: 'Bookings Report — March 2026', fmt: 'XLSX', time: 'Yesterday 17:30', size: '89 KB' },
  { name: 'Executive Overview — Q1 2026', fmt: 'PDF', time: 'Mar 24', size: '210 KB' },
];

const AdminReports = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [dateFilter, setDateFilter] = useState({ range: 'this-month', from: '', to: '' });

  const handleGenerate = async (type: string, format: string) => {
    console.log('Generate', type, format, dateFilter);
  };

  return (
    <div>
      {/* Date filter */}
      <div className="aura-glass" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, color: 'var(--aura-text)', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
          Report Period
        </p>
        <ReportDateFilter onChange={setDateFilter} />
      </div>

      {/* Report grid */}
      <div className="aura-glass" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, color: 'var(--aura-text)', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
          Available Reports
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          {REPORT_TYPES.map(r => (
            <ReportCard key={r.type} {...r} onGenerate={handleGenerate} />
          ))}
        </div>
      </div>

      {/* Recent downloads */}
      <div className="aura-glass" style={{ padding: '18px 20px' }}>
        <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, color: 'var(--aura-text)', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
          Recent Downloads
        </p>
        {RECENT_DOWNLOADS.map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0',
            borderBottom: i < RECENT_DOWNLOADS.length - 1 ? '1px solid var(--aura-glass-border)' : 'none',
          }}>
            <span style={{ fontSize: 18 }}>
              {h.fmt === 'PDF' ? '📄' : h.fmt === 'XLSX' ? '📑' : '📋'}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 500, color: 'var(--aura-text)' }}>{h.name}</p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: 'var(--aura-text)', opacity: 0.55, marginTop: 1 }}>{h.time} · {h.size}</p>
            </div>
            <span style={{
              padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: 'rgba(60,200,184,0.12)', color: 'var(--aura-teal)',
              border: '1px solid rgba(60,200,184,0.2)', cursor: 'pointer',
              fontFamily: "var(--aura-font-body)",
            }}>
              Re-download
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
