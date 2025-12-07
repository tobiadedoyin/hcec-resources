/**
 * converter.js
 *
 * Usage:
 *   node converter.js input.txt output.json
 *
 * Output: JSON array written to output.json
 *
 * - Parses month headers like "JANUARY 2026"
 * - Parses lessons starting with "LESSON <n>: <title>" or "DAY <n>: <title>"
 * - Extracts Scripture in Focus, Learn by Heart, Challenge, Prayer, and the main body
 * - Produces objects that follow the DailyHoney interface (no _id)
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'input.txt';
const outputPath = process.argv[3] || 'output.json';

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');

// Helper: capitalize month nicely (e.g., JANUARY -> January)
const niceMonth = (m) => {
  const lower = m.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Find all month headers (e.g., "JANUARY 2026"), case-insensitive, whole line
const monthHeaderRegex = /^([A-Z]+)\s+(\d{4})\s*$/gim;

const monthMatches = [];
let m;
while ((m = monthHeaderRegex.exec(raw)) !== null) {
  monthMatches.push({
    monthRaw: m[1],
    month: niceMonth(m[1]),
    year: parseInt(m[2], 10),
    index: m.index,
    headerLength: m[0].length,
  });
}

if (monthMatches.length === 0) {
  console.error('No month headers found (e.g., "JANUARY 2026"). Exiting.');
  process.exit(1);
}

const result = [];

// For each month block, slice content until next month header (or EOF)
for (let i = 0; i < monthMatches.length; i++) {
  const current = monthMatches[i];
  const start = current.index + current.headerLength;
  const end = i + 1 < monthMatches.length ? monthMatches[i + 1].index : raw.length;
  const block = raw.slice(start, end).trim();

  if (!block) continue;

  // Find lessons inside this block
  // Matches "LESSON 1: Title" or "DAY 1: Title" (case-insensitive)
  const lessonHeaderRegex = /(LESSON|DAY)\s+(\d+):\s*(.*)$/gim;

  const lessonHeaders = [];
  let lh;
  while ((lh = lessonHeaderRegex.exec(block)) !== null) {
    // FIX: lh[1] = "LESSON" or "DAY"
    //      lh[2] = the number (e.g., "1")
    //      lh[3] = the topic/title (may be empty)
    lessonHeaders.push({
      type: lh[1].toUpperCase(), // LESSON or DAY
      lessonNumber: parseInt(lh[2], 10), // correct: use lh[2] for the number
      topicRaw: lh[3] ? lh[3].trim() : '', // correct: lh[3] is the topic
      index: lh.index,
      headerLength: lh[0].length,
    });
  }

  // If no lessons found, skip
  if (lessonHeaders.length === 0) continue;

  // Split block into lines once (used later for fallback topic extraction)
  const blockLines = block.split(/\r?\n/);

  for (let j = 0; j < lessonHeaders.length; j++) {
    const L = lessonHeaders[j];
    const lessonStart = L.index + L.headerLength;
    const lessonEnd = j + 1 < lessonHeaders.length ? lessonHeaders[j + 1].index : block.length;
    const lessonBlock = block.slice(lessonStart, lessonEnd).trim();

    // If topic is empty on header line, try to pick the next non-empty line in lessonBlock
    let topic = L.topicRaw;
    if (!topic) {
      // find the header line position in blockLines to look at the following lines
      // compute absolute position of the header line start inside the block
      const headerLineStartPos = L.index;
      // find which line this is
      let cumulative = 0;
      let headerLineIndex = -1;
      for (let li = 0; li < blockLines.length; li++) {
        cumulative += blockLines[li].length + 1; // +1 for newline
        if (cumulative > headerLineStartPos) {
          headerLineIndex = li;
          break;
        }
      }
      // look forward for first non-empty line after header line
      if (headerLineIndex >= 0) {
        for (let k = headerLineIndex + 1; k < blockLines.length; k++) {
          const line = blockLines[k].trim();
          if (line.length > 0) {
            topic = line;
            break;
          }
          // stop if we reached the start index of the next lesson (optional)
        }
      }
    }

    // Extract fields using case-insensitive markers
    const scriptureMatch = lessonBlock.match(/Scripture in Focus:\s*([\s\S]*?)(?=(Learn by Heart:|Challenge:|Prayer:|$))/i);
    const scripture = scriptureMatch ? scriptureMatch[1].trim().replace(/\s+\n/g, '\n') : undefined;

    const learnMatch = lessonBlock.match(/Learn by Heart:\s*([\s\S]*?)(?=(Challenge:|Prayer:|$))/i);
    const learnByHeart = learnMatch ? learnMatch[1].trim().replace(/\s+\n/g, '\n') : undefined;

    const challengeMatch = lessonBlock.match(/Challenge:\s*([\s\S]*?)(?=(Prayer:|$))/i);
    const challenge = challengeMatch ? challengeMatch[1].trim().replace(/\s+\n/g, '\n') : undefined;

    const prayerMatch = lessonBlock.match(/Prayer:\s*([\s\S]*?)$/i);
    const prayer = prayerMatch ? prayerMatch[1].trim() : undefined;

    // body: text between end of Learn by Heart (if exists) and start of Challenge/Prayer/next
    let body = '';
    let bodyStartIdx = 0;

    if (learnMatch && learnMatch.index !== undefined) {
      const lm = new RegExp(/Learn by Heart:\s*([\s\S]*?)(?=(Challenge:|Prayer:|$))/i);
      const lmExec = lm.exec(lessonBlock);
      if (lmExec && lmExec.index !== undefined) {
        bodyStartIdx = lmExec.index + lmExec[0].length;
      }
    } else {
      bodyStartIdx = 0;
    }

    const challengeIdx = challengeMatch && challengeMatch.index !== undefined ? challengeMatch.index : -1;
    const prayerIdx = prayerMatch && prayerMatch.index !== undefined ? prayerMatch.index : -1;

    let bodyEndIdx = lessonBlock.length;
    const candidateEnds = [];
    if (challengeIdx > -1) candidateEnds.push(challengeIdx);
    if (prayerIdx > -1) candidateEnds.push(prayerIdx);
    if (candidateEnds.length > 0) bodyEndIdx = Math.min(...candidateEnds);

    body = lessonBlock.slice(bodyStartIdx, bodyEndIdx).trim();
    body = body.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
    if (body === '') body = undefined;

    const obj = {
      // _id omitted on purpose (MongoDB should generate)
      year: current.year,
      month: current.month,
      day: String(L.lessonNumber), // Lesson 1 -> day "1"
      topic: topic || undefined,
      scriptureInFocus: scripture || undefined,
      learnByHeart: learnByHeart || undefined,
      body: body || undefined,
      challenge: challenge || undefined,
      prayer: prayer || undefined,
      createdAt: new Date().toISOString(),
    };

    // remove keys with undefined to keep JSON tidy (optional)
    Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);

    result.push(obj);
  } // end lessons loop
} // end month blocks loop

// Write out JSON
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`Parsed ${result.length} lesson(s). Output written to ${outputPath}`);
