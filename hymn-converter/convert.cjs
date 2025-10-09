// convert_txt_to_json_uppercase.js
// Usage: node convert_txt_to_json_uppercase.js [input_txt] [output_json]
// Default: ./hymns-input.txt -> ./hymns.json

const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const INPUT = path.resolve(argv[0] || './hymns-input.txt');
const OUTPUT = path.resolve(argv[1] || './hymns.json');

if (!fs.existsSync(INPUT)) {
  console.error('Input file not found:', INPUT);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT, 'utf8');

// regex helpers
const NUMBER_LINE_RE = /^\s*(\d{1,4})\.\s*(.*)$/;   // "1.  ...", heading or verse
const VERSE_RE = /^\s*(\d+)\.\s*(.*)$/;             // "1.  First line..."
const METER_RE = /\b\d+s\.\s*\d*s\.?|\bC\.?\s*M\.?/i;
const BIBLE_RE = /[A-Za-z]{1,20}\.?\s*\d+:\d+/;
const AUTHOR_RE = /^(?:Author|By|Written by)\s*[:\-]\s*(.+)$/i;
const TRAILING_AUTHOR_RE = /^[\-\u2014\—]\s*(.+)$/;
const CHORUS_RE = /^(?:Chorus|Chr:|Ref:|Refrain)\b[:\- ]?/i;

function cleanLineKeepEmpty(s = '') {
  if (s === null || s === undefined) return '';
  return String(s).replace(/\u00A0/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ').replace(/\u200B/g, '').trim();
}

// uppercase heuristic: line considered a "title" if letters exist and uppercase letters / letters >= threshold
function isUppercaseTitle(line, threshold = 0.6) {
  if (!line) return false;
  const letters = line.replace(/[^A-Za-z]/g, '');
  if (letters.length === 0) return false;
  const uppers = line.replace(/[^A-Z]/g, '');
  return (uppers.length / letters.length) >= threshold;
}

// split into paragraphs but preserve blanks so we can detect boundaries
const parasRaw = raw.split(/\r?\n/);
const paras = parasRaw.map(cleanLineKeepEmpty);

const hymns = [];
let idx = 0;
const n = paras.length;

while (idx < n) {
  const para = paras[idx];

  // detect uppercase title line as hymn start
  if (isUppercaseTitle(para)) {
    // Title found
    const title = para;
    // search backwards up to 3 lines for a hymn number like "1." or "1.   12s. 10s."
    let hymnNumber = null;
    for (let b = Math.max(0, idx - 3); b < idx; b++) {
      const m = paras[b].match(NUMBER_LINE_RE);
      if (m) {
        hymnNumber = parseInt(m[1], 10);
        break;
      }
    }

    // create hymn object
    const hymn = {
      language: 'yoruba',
      title: title,
      number: hymnNumber,
      tune: null,
      author: null,
      bibleVerse: null,
      tags: [],
      verses: []
    };

    // scan forward for possible tune, bible ref etc before first verse
    let j = idx + 1;
    while (j < n) {
      const p = paras[j];
      if (!p) { j++; continue; } // skip blanks
      // stop if we hit next uppercase title (another hymn)
      if (isUppercaseTitle(p)) break;
      // if we find a verse start, stop metadata scan
      if (VERSE_RE.test(p)) break;
      if (!hymn.tune && METER_RE.test(p)) {
        hymn.tune = (p.match(METER_RE) || [null])[0];
        j++;
        continue;
      }
      const bmatch = p.match(BIBLE_RE);
      if (bmatch && !hymn.bibleVerse) {
        hymn.bibleVerse = bmatch[0];
        j++;
        continue;
      }
      const auth = p.match(AUTHOR_RE) || p.match(TRAILING_AUTHOR_RE);
      if (auth && !hymn.author) {
        hymn.author = auth[1].trim();
        j++;
        continue;
      }
      // otherwise stop metadata scan (it might be verse content)
      break;
    }

    // Now parse verses for this hymn starting from j (or idx+1)
    let k = Math.max(idx + 1, j);
    let currentVerse = null;
    while (k < n) {
      const cur = paras[k];
      // if next hymn title encountered -> stop hymn parse
      if (isUppercaseTitle(cur) && cur !== title) break;

      // blank line separates stanzas; if we have a currentVerse, finalize it
      if (!cur) {
        if (currentVerse) {
          // finalize (preserve \n internal line breaks)
          currentVerse.text = currentVerse.lines.join('\n').trim();
          hymn.verses.push({
            number: currentVerse.number,
            text: currentVerse.text,
            stanza: currentVerse.number
          });
          currentVerse = null;
        }
        k++;
        continue;
      }

      // verse start?
      const vm = cur.match(VERSE_RE);
      if (vm) {
        // if there was an open verse, finalize first
        if (currentVerse) {
          currentVerse.text = currentVerse.lines.join('\n').trim();
          hymn.verses.push({
            number: currentVerse.number,
            text: currentVerse.text,
            stanza: currentVerse.number
          });
          currentVerse = null;
        }
        const vnum = parseInt(vm[1], 10);
        const firstLine = vm[2] ? vm[2].trim() : '';
        currentVerse = { number: vnum, lines: [] };
        if (firstLine) currentVerse.lines.push(firstLine);
        k++;
        // consume following lines that are not verse starts and not uppercase titles
        while (k < n) {
          const nxt = paras[k];
          if (!nxt) break; // blank = end of stanza (outer loop will flush)
          if (isUppercaseTitle(nxt)) break; // next hymn title -> stop
          // if next line begins with a verse number -> stop continuation for this verse
          if (VERSE_RE.test(nxt)) break;
          // ignore chorus label as tag
          if (CHORUS_RE.test(nxt)) {
            if (!hymn.tags.includes(nxt)) hymn.tags.push(nxt);
            k++;
            continue;
          }
          // else add to current verse lines (preserve line breaks)
          currentVerse.lines.push(nxt);
          k++;
        }
        // do not increment k here because outer loop will continue from current k
        continue;
      }

      // If this line isn't a verse start and we're already in a verse -> continuation
      if (currentVerse) {
        currentVerse.lines.push(cur);
        k++;
        continue;
      }

      // If this line isn't a verse and no current verse exists, it might be stray (treat as tag)
      if (!hymn.tags.includes(cur)) hymn.tags.push(cur);
      k++;
    } // end verses loop

    // finalize last open verse
    if (currentVerse) {
      currentVerse.text = currentVerse.lines.join('\n').trim();
      hymn.verses.push({
        number: currentVerse.number,
        text: currentVerse.text,
        stanza: currentVerse.number
      });
      currentVerse = null;
    }

    // fallback: if no verses found but there are tags with stanza-like lines, join tags into one verse
    if (hymn.verses.length === 0 && hymn.tags.length > 0) {
      const joined = hymn.tags.join('\n').trim();
      if (joined.length > 5) {
        hymn.verses.push({ number: 1, text: joined, stanza: 1 });
        hymn.tags = [];
      }
    }

    // push hymn
    hymns.push(hymn);

    // set idx to k (continue parsing from next hymn start)
    idx = (typeof k !== 'undefined') ? k : (idx + 1);
    continue;
  } // end if uppercase title

  // not a title, move on
  idx++;
}

// Write output
fs.writeFileSync(OUTPUT, JSON.stringify(hymns, null, 2), 'utf8');
console.log(`Wrote ${hymns.length} hymns -> ${OUTPUT}`);
