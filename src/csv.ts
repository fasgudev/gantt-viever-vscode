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

export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "MM-DD-YYYY" | "DD/MM/YYYY" | "MM/DD/YYYY";
export type Delimiter = "," | ";";

const DATE_FORMAT_PATTERNS: Record<DateFormat, { regex: RegExp; parse: (match: RegExpMatchArray) => { year: number; month: number; day: number } }> = {
  "YYYY-MM-DD": {
    regex: /^(\d{4})-(\d{2})-(\d{2})$/,
    parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] })
  },
  "DD-MM-YYYY": {
    regex: /^(\d{2})-(\d{2})-(\d{4})$/,
    parse: (m) => ({ year: +m[3], month: +m[2], day: +m[1] })
  },
  "MM-DD-YYYY": {
    regex: /^(\d{2})-(\d{2})-(\d{4})$/,
    parse: (m) => ({ year: +m[3], month: +m[1], day: +m[2] })
  },
  "DD/MM/YYYY": {
    regex: /^(\d{2})\/(\d{2})\/(\d{4})$/,
    parse: (m) => ({ year: +m[3], month: +m[2], day: +m[1] })
  },
  "MM/DD/YYYY": {
    regex: /^(\d{2})\/(\d{2})\/(\d{4})$/,
    parse: (m) => ({ year: +m[3], month: +m[1], day: +m[2] })
  }
};

function isValidDate(date: string, format: DateFormat): boolean {
  const pattern = DATE_FORMAT_PATTERNS[format];
  if (!pattern) return false;

  const match = date.match(pattern.regex);
  if (!match) return false;

  const { year, month, day } = pattern.parse(match);

  // Check if date is valid
  const parsed = new Date(year, month - 1, day);
  if (isNaN(parsed.getTime())) return false;

  // Verify the date wasn't adjusted (e.g., 2024-02-30 -> 2024-03-01)
  return parsed.getFullYear() === year &&
         parsed.getMonth() === month - 1 &&
         parsed.getDate() === day;
}

export function parseTasksFromCsv(
  csv: string,
  dateFormat: DateFormat = "YYYY-MM-DD",
  delimiter: Delimiter = ","
): ParseResult {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { tasks: [], errors: [] };

  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
  const index = (name: string) => headers.indexOf(name);

  const tasks: CsvTask[] = [];
  const errors: string[] = [];

  // Validate delimiter - check if wrong delimiter might be used
  const otherDelimiter: Delimiter = delimiter === "," ? ";" : ",";
  const headersWithOther = lines[0].split(otherDelimiter).map(h => h.trim().toLowerCase());

  if (headers.length === 1 && headersWithOther.length > 1) {
    errors.push(`Delimitador incorrecto: el archivo parece usar "${otherDelimiter}" en lugar de "${delimiter}"`);
    return { tasks: [], errors };
  }

  // Validate required columns
  const requiredColumns = ["id", "name", "start", "end"];
  const missingRequired = requiredColumns.filter(col => index(col) === -1);
  if (missingRequired.length > 0) {
    // Check if columns exist with other delimiter
    const indexOther = (name: string) => headersWithOther.indexOf(name);
    const missingWithOther = requiredColumns.filter(col => indexOther(col) === -1);

    if (missingWithOther.length < missingRequired.length) {
      errors.push(`Delimitador incorrecto: el archivo parece usar "${otherDelimiter}" en lugar de "${delimiter}"`);
    } else {
      errors.push(`Columnas requeridas faltantes: ${missingRequired.join(", ")}`);
    }
    return { tasks: [], errors };
  }

  // Warn about optional columns
  // const optionalColumns = ["progress", "assigned", "category"];
  // const missingOptional = optionalColumns.filter(col => index(col) === -1);
  // if (missingOptional.length > 0) {
  //   errors.push(`Columnas opcionales faltantes: ${missingOptional.join(", ")}`);
  // }

  lines.slice(1).forEach((line, lineIndex) => {
    const cols = line.split(delimiter).map(c => c.trim());
    const rowNum = lineIndex + 2; // +2 because header is line 1

    const id = cols[index("id")];
    const name = cols[index("name")];
    const start = cols[index("start")];
    const end = cols[index("end")];

    // Validate required fields are not empty
    const emptyFields: string[] = [];
    if (!id) emptyFields.push("id");
    if (!name) emptyFields.push("name");
    if (!start) emptyFields.push("start");
    if (!end) emptyFields.push("end");

    if (emptyFields.length > 0) {
      errors.push(`Fila ${rowNum}: campos vacíos (${emptyFields.join(", ")})`);
      return;
    }

    // Validate date format
    if (!isValidDate(start, dateFormat)) {
      errors.push(`Fila ${rowNum}: fecha inicio "${start}" no tiene formato ${dateFormat}`);
      return;
    }
    if (!isValidDate(end, dateFormat)) {
      errors.push(`Fila ${rowNum}: fecha fin "${end}" no tiene formato ${dateFormat}`);
      return;
    }

    // Validate: start should not be greater than end
    if (new Date(start) > new Date(end)) {
      errors.push(`Fila ${rowNum}: fecha inicio (${start}) mayor a fecha fin (${end})`);
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