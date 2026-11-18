interface BulkShowInput {
  artists: string[];
  attended: boolean;
  date: number;
  venue: string;
}

interface BulkCsvError {
  line: number;
  message: string;
}

interface CsvRecord {
  fields: string[];
  line: number;
}

interface CsvParseResult {
  errors: BulkCsvError[];
  records: CsvRecord[];
}

interface BulkShowsCsvResult {
  errors: BulkCsvError[];
  shows: BulkShowInput[];
}

const HEADER_ALIASES = {
  artists: ['artist', 'artists'],
  attended: ['attended'],
  date: ['date'],
  venue: ['venue'],
} as const;

function parseCsv(csv: string): CsvParseResult {
  const errors: BulkCsvError[] = [];
  const records: CsvRecord[] = [];
  let field = '';
  let fields: string[] = [];
  let inQuotes = false;
  let line = 1;
  let recordLine = 1;

  const finishRecord = () => {
    fields.push(field);
    if (fields.some((value) => value.trim())) {
      records.push({ fields, line: recordLine });
    }
    field = '';
    fields = [];
    recordLine = line + 1;
  };

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (inQuotes) {
      if (character === '"') {
        if (csv[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
        if (character === '\n') line += 1;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      inQuotes = true;
    } else if (character === ',') {
      fields.push(field);
      field = '';
    } else if (character === '\n') {
      finishRecord();
      line += 1;
      recordLine = line;
    } else if (character !== '\r') {
      field += character;
    }
  }

  if (inQuotes) {
    errors.push({ line: recordLine, message: 'Quoted field is not closed.' });
  } else if (field.length > 0 || fields.length > 0) {
    finishRecord();
  }

  return { errors, records };
}

function normalizedHeader(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, '');
}

function headerIndex(fields: string[], aliases: readonly string[]) {
  return fields.findIndex((field) => aliases.includes(normalizedHeader(field)));
}

function getHeader(fields: string[]) {
  const artists = headerIndex(fields, HEADER_ALIASES.artists);
  const date = headerIndex(fields, HEADER_ALIASES.date);
  const venue = headerIndex(fields, HEADER_ALIASES.venue);
  if (artists < 0 || date < 0 || venue < 0) return null;

  return {
    artists,
    attended: headerIndex(fields, HEADER_ALIASES.attended),
    date,
    venue,
  };
}

function localShowDate(year: number, month: number, day: number): number | null {
  const date = new Date(year, month - 1, day, 20);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date.getTime();
}

function parseDate(value: string): number | null {
  const shorthand = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value);
  if (shorthand) {
    const [, month, day, yearValue] = shorthand;
    const shortYear = Number(yearValue);
    const year =
      yearValue.length === 2 ? (shortYear <= 49 ? 2000 + shortYear : 1900 + shortYear) : shortYear;
    return localShowDate(year, Number(month), Number(day));
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return localShowDate(Number(year), Number(month), Number(day));
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function parseAttended(value: string): boolean | null {
  const normalized = value.trim().toLocaleLowerCase();
  if (!normalized || ['false', 'no', 'n', '0'].includes(normalized)) return false;
  if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
  return null;
}

export function parseBulkShowsCsv(csv: string): BulkShowsCsvResult {
  const { errors, records } = parseCsv(csv.trim());
  const shows: BulkShowInput[] = [];
  if (errors.length > 0 || records.length === 0) {
    if (records.length === 0 && errors.length === 0) {
      errors.push({ line: 1, message: 'Enter at least one show.' });
    }
    return { errors, shows };
  }

  const header = getHeader(records[0].fields);
  const columns = header ?? { artists: 0, venue: 1, date: 2, attended: 3 };
  const showRecords = header ? records.slice(1) : records;

  if (showRecords.length === 0) {
    return {
      errors: [{ line: records[0].line, message: 'Enter at least one show after the header.' }],
      shows,
    };
  }

  for (const record of showRecords) {
    const artistsValue = record.fields[columns.artists]?.trim() ?? '';
    const venue = record.fields[columns.venue]?.trim() ?? '';
    const dateValue = record.fields[columns.date]?.trim() ?? '';
    const attendedValue =
      columns.attended >= 0 ? (record.fields[columns.attended]?.trim() ?? '') : '';
    const artists = artistsValue
      .split(/\s*[;|]\s*/)
      .map((artist) => artist.trim())
      .filter(Boolean);
    const date = parseDate(dateValue);
    const attended = parseAttended(attendedValue);

    if (artists.length === 0) {
      errors.push({ line: record.line, message: 'At least one artist is required.' });
    }
    if (!venue) {
      errors.push({ line: record.line, message: 'Venue is required.' });
    }
    if (date === null) {
      errors.push({
        line: record.line,
        message: 'Date must be valid, such as 1/1/26 or 2026-01-01.',
      });
    }
    if (attended === null) {
      errors.push({
        line: record.line,
        message: 'Attended must be yes/no, true/false, or 1/0.',
      });
    }

    if (artists.length > 0 && venue && date !== null && attended !== null) {
      shows.push({ artists, attended, date, venue });
    }
  }

  return { errors, shows };
}
