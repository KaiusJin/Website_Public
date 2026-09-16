export function resolveProfile(records) {
  return records?.[0] ?? null;
}

export function dateRange(record, present = 'Present') {
  return [record.start_date, record.is_present ? present : record.end_date].filter(Boolean).join(' — ');
}
