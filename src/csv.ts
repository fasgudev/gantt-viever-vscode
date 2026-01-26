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

export type ParseResult = {
  tasks: CsvTask[];
  errors: string[];
};

export function parseTasksFromCsv(csv: string): ParseResult {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { tasks: [], errors: [] };

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const index = (name: string) => headers.indexOf(name);

  const tasks: CsvTask[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, lineIndex) => {
    const cols = line.split(",").map(c => c.trim());
    const rowNum = lineIndex + 2; // +2 because header is line 1

    const id = cols[index("id")];
    const name = cols[index("name")];
    const start = cols[index("start")];
    const end = cols[index("end")];

    if (!id || !name) return;
    if (!start || !end) return;

    // Validate: start should not be greater than end
    if (new Date(start) > new Date(end)) {
      errors.push(`Fila ${rowNum}: tiene fecha inicio mayor a fecha fin`);
      return;
    }

    tasks.push({
      id,
      name,
      start,
      end,
      progress: Number(cols[index("progress")] ?? 0),
      assigned: cols[index("assigned")] ?? "",
      category: cols[index("category")] ?? "",
      depends: (cols[index("depends")] ?? "").split("|").filter(Boolean)
    });
  });

  return { tasks, errors };
}