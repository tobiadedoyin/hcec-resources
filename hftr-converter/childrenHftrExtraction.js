// childrenHftrExtraction.js
const fs = require('fs');
const path = require('path');

/**
 * Main entry - read file and extract lessons as JSON objects
 * @param {string} filePath - path to the text file to parse
 * @returns {Array<object>}
 */
function childrenHftrExtraction(filePath) {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');

  // Normalize common issues: CR, multiple blank lines, tabs -> single spaces
  const normalized = raw
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();

  // Split by the literal "Lesson" header (case-insensitive). Keep only non-empty blocks.
  const blocks = normalized
    .split(/\nLesson\s*/i)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map(parseLessonBlock);
}

/* ----------------- PARSING ----------------- */

function parseLessonBlock(block) {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    lesson: extractLesson(lines),
    date: extractDate(lines),
    topic: extractTopic(block),
    objective: extractSection(block, 'Objective:', [
      'Memory Verse:',
      'MemoryVerse:',
      'MemoryVerse',
      'Verse:',
      'Text:',
      'Introduction',
      'Focus',
      'Questions',
      'Points for Action',
      'Points for Action',
    ]),
    memoryVerse: extractSection(block, 'Memory Verse:', [
      'Verse:',
      'Text:',
      'Introduction',
      'Focus',
      'Questions',
      'Points for Action',
      'Points for Action',
    ]),
    verse: extractVerse(block),
    introduction: extractSection(block, 'Introduction', [
      'Focus',
      'Children',
      "Children's Honey",
      "Children's Honey",
    ]),
    focus: extractAlphaList(block, 'Focus', [
      'Questions',
      'Children',
      "Children's Honey",
      "Children's Honey",
    ]),
    questions: extractNumberList(block, 'Questions', [
      'Points for Action',
      'Points for Action',
      'Children',
      "Children's Honey",
    ]),
    pointForAction: extractPointForAction(block),
  };
}

/* ----------------- SMALL HELPERS FOR FIELDS ----------------- */

function extractLesson(lines) {
  // Prefer the first standalone word (One, Two, Three). Fallback to first non-empty line.
  const candidate = lines.find((l) => /^[A-Za-z]+$/.test(l));
  return candidate || (lines.length ? lines[0] : '');
}

function extractDate(lines) {
  // Matches "4TH JAN., 2026" and variants
  const d = lines.find((l) =>
    /\d{1,2}(st|nd|rd|th)?\s*[A-Za-z]{3,}\.?,?\s*\d{4}/i.test(l),
  );
  return d || '';
}

function extractTopic(block) {
  // Topic commonly appears between the date and the "Objective" header as several uppercase lines.
  // We take the text from the start of the block up to "Objective:" and collect uppercase lines,
  // then join them (stripping trailing digits).
  const stopIdx = block.search(/\bObjective\s*:/i);
  const beforeObjective =
    stopIdx === -1 ? block.slice(0, 300) : block.slice(0, stopIdx);
  const lines = beforeObjective
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const topicLines = lines.filter(
    (l) =>
      l === l.toUpperCase() &&
      !/\d/.test(l) &&
      l.length > 2 &&
      !/Lesson/i.test(l) &&
      !/JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/i.test(l),
  );

  // join and strip stray trailing numbers (like "CHRIST 23")
  const joined = (topicLines.join(' ') || '').replace(/\s+\d+\s*$/, '').trim();
  return toTitleCase(joined);
}

function extractVerse(block) {
  // Prefer explicit "Text:" or "Verse:" label; capture the immediate scripture ref (stop at newline or period)
  const m = block.match(/\b(?:Text|Verse)\s*:\s*([^\n]+)/i);
  if (m) return clean(m[1]).replace(/\.$/, '');
  // fallback: sometimes the verse is inline after Memory Verse or Text; try searching for pattern like "Luke 17:11-19"
  const ref = block.match(/\b[A-Za-z]{3,}\s+\d{1,3}[:]\d{1,3}(?:-\d{1,3})?/);
  return ref ? clean(ref[0]) : '';
}

/* ----------------- SECTION EXTRACTION ----------------- */

function extractSection(block, startLabel, stopLabels = []) {
  const stopPattern = stopLabels.map((s) => escapeRegExp(s)).join('|') || '$';
  const regex = new RegExp(
    escapeRegExp(startLabel) + '([\\s\\S]*?)(?=(?:' + stopPattern + ')|$)',
    'i',
  );
  const m = block.match(regex);
  return m ? clean(m[1]) : '';
}

function extractAlphaList(block, startLabel, stopLabels = []) {
  const section = extractSection(block, startLabel, stopLabels);
  if (!section) return [];

  // Split by A., B., C., D. (allow missing newline)
  const parts = section
    .split(/\b[A-D]\.\s*/g)
    .map(clean)
    .filter(Boolean);
  return parts;
}

function extractNumberList(block, startLabel, stopLabels = []) {
  const section = extractSection(block, startLabel, stopLabels);
  if (!section) return [];

  // Split by numeric markers "1. ", "2. "
  const parts = section
    .split(/\b\d+\.\s*/g)
    .map(clean)
    .filter(Boolean);
  return parts;
}

/* ----------------- POINTS FOR ACTION (ROBUST) ----------------- */

function extractPointForAction(block) {
  // Capture the whole Points for Action section until next Lesson or Children's Honey or end-of-block
  const m = block.match(
    /\bPoints?\s+for\s+Action\b([\s\S]*?)(?=(?:\bLesson\b|Children's Honey\b|Children\b|$))/i,
  );
  if (!m) return [];

  let section = m[1].trim();

  // If section begins with stray numeric markers like "2." on its own line, keep them for the numeric-splitting logic.
  // Use a global regex to capture all numeric items: "1. ...", "2. ...", etc.
  const itemRegex = /\d+\.\s*([\s\S]*?)(?=(?:\d+\.\s*)|$)/g;
  const items = [];
  let it;
  while ((it = itemRegex.exec(section)) !== null) {
    // it[1] is the content for the item
    const cleaned = clean(it[1])
      .replace(/\d+\.\s*$/g, '')
      .trim();
    if (cleaned) items.push(cleaned);
  }

  if (items.length > 0) {
    return items;
  }

  // Fallback: if no numeric markers found, split by newlines in a forgiving way.
  // Join lines into sentences but break where there is a clear sentence end or blank line.
  const lines = section
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // If there are multiple lines, treat each non-empty line as an item (then merge short lines that likely belong together).
  if (lines.length > 1) {
    // Merge lines that do not end with punctuation with the next line
    const merged = [];
    for (let i = 0; i < lines.length; i++) {
      const cur = lines[i];
      if (cur.match(/[.?!]$/) || cur.length > 60) {
        merged.push(cur);
      } else {
        // try to merge with next
        const next = lines[i + 1] || '';
        merged.push((cur + ' ' + next).trim());
        i++; // skip next as it's merged
      }
    }
    return merged.map(clean).filter(Boolean);
  }

  // Last fallback: split by sentence-ending punctuation (period/semicolon/newline) but not by comma.
  const sentenceParts = section
    .split(/(?:\r?\n|[.;]\s+)/)
    .map(clean)
    .filter(Boolean);

  return sentenceParts;
}

/* ----------------- UTILITIES ----------------- */

function clean(s) {
  if (!s && s !== '') return '';
  return s
    .replace(/Children's Honey\s*from\s*the\s*Rock\s*\d+/gi, '')
    .replace(/Children's Honeyfrom the Rock\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\d\.\s]+/, '') // leading numbering leftover
    .replace(/[\d\.\s]+$/, '') // trailing numbering leftover
    .trim();
}

function toTitleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ----------------- EXPORT ----------------- */

module.exports = { childrenHftrExtraction };

const inputFile = './lesson.txt';
const outputFile = './children-hftr-lessons.json';

const lessons = childrenHftrExtraction(inputFile);

fs.writeFileSync(
  path.resolve(outputFile),
  JSON.stringify(lessons, null, 2),
  'utf-8',
);
// // Extract from file
// const lessons = childrenHftrExtraction('./lesson.txt');

// // Optionally save as JSON
// childrenHftrExtraction.toJSON(lessons, './output.json');
