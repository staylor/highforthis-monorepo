import { plainDate, plainTime, instantMilliseconds } from '@highforthis/shared/time';
interface BulkShowInput {
  artists: string[];
  attended: boolean;
  schedule: { localDate: string; localTime: string | null; startsAt?: number };
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

const INVALID_DATE = 'Date must be valid, such as 1/1/26 or 2026-01-01.';
const UTC_DATE =
  "Date can't be a time in UTC. Give the venue's time, with its offset if you know it: 2026-01-01T20:00-05:00.";

/** A show's schedule from its date, or what's wrong with the date */
function parseDate(value: string): BulkShowInput['schedule'] | string {
  const shorthand = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value);
  if (shorthand) {
    const [, month, day, year] = shorthand;
    const century = year.length === 2 ? (Number(year) <= 49 ? '20' : '19') : '';
    value = `${century}${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const parts =
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)(Z|[+-]\d{2}:\d{2})?)?$/.exec(
      value
    );
  if (!parts) return INVALID_DATE;
  const [, day, time, offset] = parts;
  // The date and time are kept as written, as the venue's clocks read, and Z or a zero offset
  // says they're UTC's: 8 PM in New York, written 2026-01-02T01:00Z, would be saved as 1 AM the
  // next day
  if (offset && /^(?:Z|[+-]00:00)$/.test(offset)) return UTC_DATE;
  try {
    return {
      localDate: plainDate(day).toString(),
      localTime: time ? plainTime(time) : null,
      ...(offset && { startsAt: instantMilliseconds(`${day}T${time}${offset}`) }),
    };
  } catch {
    return INVALID_DATE;
  }
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
    if (typeof date === 'string') {
      errors.push({ line: record.line, message: date });
    }
    if (attended === null) {
      errors.push({
        line: record.line,
        message: 'Attended must be yes/no, true/false, or 1/0.',
      });
    }

    if (artists.length > 0 && venue && typeof date !== 'string' && attended !== null) {
      shows.push({ artists, attended, schedule: date, venue });
    }
  }

  return { errors, shows };
}
