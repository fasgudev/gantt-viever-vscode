export type CsvTask = {
  id: string;
  name: string;
  start: string;
  end: string;
  progress?: number;
  assigned?: string;
  category?: string;
  depends?: string[];
};

export function parseTasksFromCsv(csv: string): CsvTask[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  const index = (name: string) => headers.indexOf(name);

  return lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim());

    return {
      id: cols[index("id")],
      name: cols[index("name")],
      start: cols[index("start")],
      end: cols[index("end")],
      progress: Number(cols[index("progress")] ?? 0),
      assigned: cols[index("assigned")] ?? "",
      category: cols[index("category")] ?? "",
      depends: (cols[index("depends")] ?? "").split("|").filter(Boolean)
    };
  }).filter(t => t.id && t.name);
}