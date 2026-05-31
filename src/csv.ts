export type Row = Record<string, string>;

export function parseCSV(text: string): { headers: string[]; rows: Row[] } {
  const records = splitRecords(text);
  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0];
  const rows = records.slice(1).map((r) => {
    const o: Row = {};
    headers.forEach((h, i) => (o[h] = r[i] ?? ""));
    return o;
  });
  return { headers, rows };
}

// A small state machine over the characters: tracks whether we are inside a
// quoted field, so commas and newlines inside quotes are preserved.
function splitRecords(text: string): string[][] {
  const out: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      record.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      out.push(record);
      field = "";
      record = [];
    } else {
      field += c;
    }
  }
  if (field.length || record.length) {
    record.push(field);
    out.push(record);
  }
  return out.filter((r) => r.length > 1 || r[0] !== "");
}

export function toCSV(headers: string[], rows: Row[]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const head = headers.map(esc).join(",");
  const body = rows.map((r) => headers.map((h) => esc(r[h] ?? "")).join(",")).join("\n");
  return head + "\n" + body;
}
