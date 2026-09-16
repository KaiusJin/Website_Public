export const defaultProfile = {
  heading: 'A curious mind, always on the move.',
  intro: 'I am a Computer Science student at the University of Waterloo. I enjoy turning complex backend workflows and infrastructure challenges into clear, reliable tools.',
  bio: 'My focus is backend systems, cloud infrastructure, and AI-powered applications. I am always eager to collaborate on challenging projects, co-op opportunities, and open-source work.',
  location: 'Waterloo, Canada',
  email: 'kaius.jin@outlook.com',
  github: 'https://github.com/KaiusJin',
  linkedin: 'https://www.linkedin.com/in/kaixuan-jin/',
};

// An existing record owns its blank fields too: clearing content must stay cleared.
export function resolveProfile(records, defaults = defaultProfile) {
  return records[0] ?? defaults;
}

export function dateRange(record, present = 'Present') {
  return [record.start_date, record.is_present ? present : record.end_date].filter(Boolean).join(' — ');
}
