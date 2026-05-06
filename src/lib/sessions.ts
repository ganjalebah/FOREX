
export type TradingSession = 'ASIA' | 'LONDON' | 'NEW_YORK' | 'OVERLAP' | 'WEEKEND' | 'TRANSITION';

export interface SessionInfo {
  type: TradingSession;
  label: string;
  color: string;
  dotColor: string;
}

export function getCurrentSession(): SessionInfo {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();

  // Weekend check (Saturday and Sunday UTC)
  if (utcDay === 0 || utcDay === 6) {
    if (!(utcDay === 0 && utcHour >= 21)) { // Sunday opening
       return { type: 'WEEKEND', label: 'Weekend / Closed', color: 'text-slate-500', dotColor: 'bg-slate-500' };
    }
  }

  if (utcHour >= 0 && utcHour < 8) {
    return { type: 'ASIA', label: 'Asia Session', color: 'text-blue-400', dotColor: 'bg-blue-400' };
  }
  if (utcHour >= 8 && utcHour < 13) {
    return { type: 'LONDON', label: 'London Session', color: 'text-emerald-400', dotColor: 'bg-emerald-400' };
  }
  if (utcHour >= 13 && utcHour < 17) {
    return { type: 'OVERLAP', label: 'London & NY Overlap', color: 'text-rose-400', dotColor: 'bg-rose-400' };
  }
  if (utcHour >= 17 && utcHour < 22) {
    return { type: 'NEW_YORK', label: 'New York Session', color: 'text-amber-400', dotColor: 'bg-amber-400' };
  }
  
  return { type: 'TRANSITION', label: 'Market Transition', color: 'text-slate-400', dotColor: 'bg-slate-400' };
}
