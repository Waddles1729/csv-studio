import { useMemo, useState, type ChangeEvent } from "react";
import { parseCSV, toCSV, type Row } from "./csv";

export default function App() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [trim, setTrim] = useState(true);
  const [dedupe, setDedupe] = useState(false);
  const [fileName, setFileName] = useState("");

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCSV(String(reader.result));
      setHeaders(parsed.headers);
      setRows(parsed.rows);
    };
    reader.readAsText(f);
  }

  const cleaned = useMemo(() => {
    let r = rows;
    if (trim) {
      r = r.map(
        (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.trim()])) as Row,
      );
    }
    if (dedupe) {
      const seen = new Set<string>();
      r = r.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return r;
  }, [rows, trim, dedupe]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cleaned;
    return cleaned.filter((row) => headers.some((h) => (row[h] ?? "").toLowerCase().includes(q)));
  }, [cleaned, query, headers]);

  function download() {
    const blob = new Blob([toCSV(headers, cleaned)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.csv$/i, "") || "cleaned") + ".cleaned.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="wrap">
      <header>
        <h1>CSV Studio</h1>
        <p>ブラウザ内でCSVを開いて、整形して、書き出す。データはどこにも送信されません。</p>
      </header>

      {headers.length === 0 ? (
        <label className="drop">
          <input type="file" accept=".csv,text/csv" onChange={onFile} hidden />
          <span>CSVファイルを選択</span>
        </label>
      ) : (
        <>
          <div className="bar">
            <input
              className="search"
              placeholder="検索…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label>
              <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> 空白trim
            </label>
            <label>
              <input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} /> 重複行を除去
            </label>
            <span className="count">
              {visible.length} / {rows.length} 行
            </span>
            <button onClick={download}>整形済みCSVを書き出す</button>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.slice(0, 500).map((row, i) => (
                  <tr key={i}>
                    {headers.map((h) => (
                      <td key={h}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length > 500 && (
              <p className="more">先頭500行を表示（書き出しは全 {cleaned.length} 行）</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
