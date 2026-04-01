import { useState } from "react";
import { toast } from "sonner";

const icons: Record<string, string> = {
  revenue: '📊', bookings: '📅', customers: '👥',
  tours: '🗺️', vehicles: '🚗', overview: '📋',
};

const gradients: Record<string, string[]> = {
  revenue:   ['rgba(26,138,158,0.22)','rgba(26,138,158,0.07)','0 4px 12px rgba(26,138,158,0.2)','rgba(94,200,224,0.25)'],
  bookings:  ['rgba(201,168,76,0.22)','rgba(201,168,76,0.07)','0 4px 12px rgba(201,168,76,0.2)','rgba(232,201,106,0.25)'],
  customers: ['rgba(45,212,160,0.22)','rgba(45,212,160,0.07)','0 4px 12px rgba(45,212,160,0.2)','rgba(167,243,208,0.25)'],
  tours:     ['rgba(167,139,250,0.22)','rgba(167,139,250,0.07)','0 4px 12px rgba(167,139,250,0.2)','rgba(196,180,252,0.25)'],
  vehicles:  ['rgba(251,191,36,0.22)','rgba(251,191,36,0.07)','0 4px 12px rgba(251,191,36,0.2)','rgba(253,230,138,0.25)'],
  overview:  ['rgba(251,113,133,0.22)','rgba(251,113,133,0.07)','0 4px 12px rgba(251,113,133,0.2)','rgba(253,164,175,0.25)'],
};

const fmtColors: Record<string, { bg: string; color: string; border: string }> = {
  PDF:  { bg: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' },
  CSV:  { bg: 'rgba(45,212,160,0.12)',  color: '#2dd4a0', border: '1px solid rgba(45,212,160,0.25)' },
  XLSX: { bg: 'rgba(201,168,76,0.12)',  color: '#E8C96A', border: '1px solid rgba(201,168,76,0.25)' },
};

interface ReportCardProps {
  type: string;
  title: string;
  description: string;
  lastRun: string;
  formats?: string[];
  onGenerate?: (type: string, format: string) => Promise<void>;
}

export default function ReportCard({ type, title, description, lastRun, formats = ['PDF','CSV','XLSX'], onGenerate }: ReportCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [g0, g1, g2, g3] = gradients[type] || gradients.revenue;

  const handleGenerate = async (format: string) => {
    setLoading(format);
    toast(`Generating ${title}...`, { description: `Preparing ${format} file` });
    await new Promise(r => setTimeout(r, 1800));
    if (onGenerate) await onGenerate(type, format);
    toast(`${title} ready!`, { description: `${format} file downloaded successfully` });
    setLoading(null);
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${g0}, ${g1})`,
        border: '1px solid var(--aura-glass-border)',
        borderRadius: 13, padding: 16, cursor: 'pointer',
        transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(26,138,158,0.35)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, background: `linear-gradient(135deg,${g0},${g1})`,
        boxShadow: `${g2},inset 0 1px 0 ${g3}`,
      }}>
        {icons[type]}
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--aura-text)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--aura-text)', opacity: 0.65, lineHeight: 1.45, marginBottom: 12 }}>{description}</p>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {formats.map(fmt => (
          <button
            key={fmt}
            disabled={!!loading}
            onClick={(e) => { e.stopPropagation(); handleGenerate(fmt); }}
            style={{
              padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
              fontSize: 10, fontWeight: 700, transition: 'all 0.15s',
              opacity: loading && loading !== fmt ? 0.5 : 1,
              background: fmtColors[fmt]?.bg || 'rgba(26,138,158,0.12)',
              color: fmtColors[fmt]?.color || '#5ec8e0',
              border: fmtColors[fmt]?.border || '1px solid rgba(94,200,224,0.2)',
            }}
          >
            {loading === fmt ? '...' : `↓ ${fmt}`}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 9.5, color: 'var(--aura-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--aura-success)', boxShadow: '0 0 5px var(--aura-success)', display: 'inline-block' }} />
        Last generated: {lastRun}
      </p>
    </div>
  );
}
