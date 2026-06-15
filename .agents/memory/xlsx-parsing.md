---
name: Parsing xlsx in this environment
description: How to read .xlsx attachments when xlsx npm pkg, python, and unzip are all unavailable
---

This environment has NO `xlsx` npm package, NO `python3`, and NO `unzip` binary by default.

To read an `.xlsx` attachment, parse it as a ZIP archive directly in Node using the
built-in `zlib`. Steps:
- Read the file buffer, find the End-Of-Central-Directory record (sig `0x06054b50`) by
  scanning backwards.
- Walk the central directory entries (sig `0x02014b50`); for each, read the local header
  to find the compressed data offset, then `zlib.inflateRawSync` (method 8) or copy raw
  (method 0).
- The useful members: `xl/workbook.xml` (sheet names), `xl/worksheets/sheetN.xml` (cell
  data), `xl/sharedStrings.xml` (shared strings, may be empty if cells use inline `t="str"`).

**Why:** Replit Excel-export files often store cell values inline as `<x:c ... t="str"><x:v>VALUE</x:v></x:c>`
with an EMPTY sharedStrings table, and use the `x:` namespace prefix on every tag. Regexes
must account for the `x:` prefix and for inline string values, not just shared-string indices.

**How to apply:** When a user attaches an `.xlsx`, parse columns by matching
`<x:c r="B<row>"...><x:v>(...)</x:v>` per row. Skip the header row.
