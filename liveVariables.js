const fs = require("fs");
const path = require("path");

// Recursively get all JS/TS files
function getAllFiles(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== "node_modules") files.push(...getAllFiles(full));
    } else if (f.endsWith(".js") || f.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

// Analyze live variables for a single file
function analyzeLiveVariables(code) {
  const variables = code.match(/\b(let|const|var)\s+([a-zA-Z0-9_]+)/g) || [];
  const varNames = variables.map(v => v.split(/\s+/)[1]);

  const usageCounts = {};
  for (const v of varNames) {
    const regex = new RegExp(`\\b${v}\\b`, "g");
    usageCounts[v] = (code.match(regex) || []).length;
  }

  const liveVars = Object.values(usageCounts).filter(c => c > 1).length;
  const totalVars = varNames.length;
  const avgLiveVars = totalVars > 0 ? (liveVars / totalVars) * 100 : 0;

  return { totalVars, liveVars, avgLiveVars };
}

// Scan project folder
const folder = "./";
const files = getAllFiles(folder);

if (files.length === 0) {
  console.log("No JavaScript or TypeScript files found.");
  process.exit(0);
}

// Prepare data
const rows = [];
files.forEach(file => {
  try {
    const code = fs.readFileSync(file, "utf8");
    const m = analyzeLiveVariables(code);
    rows.push({
      file: file, // full path
      totalVars: m.totalVars,
      liveVars: m.liveVars,
      avgLiveVars: m.avgLiveVars.toFixed(2)
    });
  } catch {}
});

// Fixed widths for numbers
const numWidth = 15;

// Compute max width for file path
const fileColWidth = Math.max(...rows.map(r => r.file.length), "File Path".length) + 2;

// Helper to print header
function printHeader(title) {
  console.log("\n" + "=".repeat(fileColWidth + numWidth * 3 + 6));
  console.log(" " + title);
  console.log("=".repeat(fileColWidth + numWidth * 3 + 6));
}

// Helper to print a row
function printRow(file, totalVars, liveVars, avgLiveVars) {
  console.log(
    file.padEnd(fileColWidth, " ") +
    String(totalVars).padStart(numWidth, " ") +
    String(liveVars).padStart(numWidth, " ") +
    (String(avgLiveVars) + "%").padStart(numWidth, " ")
  );
}

// Print table
printHeader("LIVE VARIABLE ANALYSIS (PER FILE)");
printRow("File Path", "Total Vars", "Live Vars", "Avg Live Vars (%)");
console.log("-".repeat(fileColWidth + numWidth * 3 + 6));
rows.forEach(r => {
  printRow(r.file, r.totalVars, r.liveVars, r.avgLiveVars);
});
console.log("=".repeat(fileColWidth + numWidth * 3 + 6) + "\n");
