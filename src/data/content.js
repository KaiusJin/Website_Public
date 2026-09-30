export function safeUrl(value, { email = false } = {}) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(
      value,
      typeof window === "undefined"
        ? "https://kaiusjin.com"
        : window.location.origin,
    );
    return ["https:", "http:", ...(email ? ["mailto:"] : [])].includes(
      url.protocol,
    )
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export const experienceTables = [
  "work_experiences",
  "club_experiences",
  "volunteer_experiences",
];

export async function loadContent(client, table, signal) {
  const { data, error } = await client.from(table).select("*")
    .order("order", { ascending: true }).abortSignal(signal);
  if (error) throw error;
  return data || [];
}

export async function loadContentTables(client, tables, signal) {
  const results = await Promise.allSettled(tables.map(table => loadContent(client, table, signal)));
  return {
    data: Object.fromEntries(tables.map((table, index) => [table, results[index].value || []])),
    failedTables: tables.filter((_, index) => results[index].status === "rejected"),
  };
}
