export function formatMass(kg: number): string {
  if (Math.abs(kg) >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`;
  }
  return `${Math.round(kg).toLocaleString()} kg`;
}

export function formatPower(kw: number): string {
  return `${kw.toFixed(1)} kW`;
}

export function formatEnergy(kwh: number): string {
  return `${Math.round(kwh).toLocaleString()} kWh`;
}

export function formatDose(msv: number): string {
  return `${msv.toFixed(1)} mSv`;
}

export function formatSol(sol: number): string {
  return `SOL ${String(sol).padStart(3, '0')}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
