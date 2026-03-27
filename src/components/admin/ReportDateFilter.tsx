import { useState } from "react";

interface DateFilterValue {
  range: string;
  from: string;
  to: string;
}

interface ReportDateFilterProps {
  onChange?: (value: DateFilterValue) => void;
}

const presets = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

export default function ReportDateFilter({ onChange }: ReportDateFilterProps) {
  const [range, setRange] = useState('this-month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const apply = (r: string) => {
    setRange(r);
    onChange?.({ range: r, from, to });
  };

  const pillStyle = (v: string): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
    fontSize: 11, fontWeight: 500, transition: 'all 0.15s',
    background: range === v ? 'linear-gradient(135deg,#1a8a9e,#0f6070)' : 'rgba(26,138,158,0.1)',
    color: range === v ? '#fff' : 'rgba(94,200,224,0.8)',
    boxShadow: range === v ? '0 2px 8px rgba(26,138,158,0.4)' : 'none',
  });

  const inputStyle: React.CSSProperties = {
    background: 'rgba(26,138,158,0.08)', border: '1px solid rgba(26,138,158,0.2)',
    borderRadius: 7, padding: '5px 10px', fontSize: 11, color: '#dff3f8',
    colorScheme: 'dark',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {presets.map(p => (
        <button key={p.value} style={pillStyle(p.value)} onClick={() => apply(p.value)}>
          {p.label}
        </button>
      ))}
      {range === 'custom' && (
        <>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: 'rgba(223,243,248,0.4)', fontSize: 11 }}>→</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
          <button style={pillStyle('apply')} onClick={() => onChange?.({ range: 'custom', from, to })}>
            Apply
          </button>
        </>
      )}
    </div>
  );
}
