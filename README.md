# AIESEC in Hadrumet: Open opportunities
React + Tailwind CSS page that promotes AIESEC in Hadrumet and lists open opportunities from a Google Sheet.

## Setup
1. `npm install`
2. In the Google Sheet: File > Share > Publish to web > choose the sheet tab and CSV > Publish. Copy the link.
3. Paste the link into `SHEET_CSV_URL` in `src/App.jsx` and match the names in `COLS` to your column headers.
4. `npm run dev` to test, `npm run build` to build.
