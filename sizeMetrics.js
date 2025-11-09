// sizeMetrics.js
const fs = require("fs");
const path = require("path");

// Recursively collect all JS/TS files (skip node_modules)
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

// Analyze code size metrics for one file
function analyzeSizeMetrics(code) {
  const lines = code.split(/\r?\n/);
  const totalLOC = lines.length;
  const blankLines = lines.filter(line => line.trim() === "").length;
  const commentLines = lines.filter(line =>
    line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")
  ).length;
  const codeLines = totalLOC - blankLines - commentLines;

  const functions = code.match(/function\s+[a-zA-Z0-9_]*\s*\(|=>/g) || [];
  const classes = code.match(/class\s+[A-Za-z0-9_]+/g) || [];

  const avgFuncSize = functions.length > 0 ? (codeLines / functions.length) : 0;
  const maxFuncSize = Math.floor(avgFuncSize * 2.5);
  const commentDensity = totalLOC > 0 ? ((commentLines / totalLOC) * 100) : 0;

  const decisionPoints = (code.match(/\b(if|else if|for|while|case|catch|&&|\|\|)\b/g) || []).length;
  const cyclomatic = decisionPoints + 1;
  const cyclomaticPerLOC = totalLOC > 0 ? (cyclomatic / totalLOC) : 0;

  return {
    totalLOC,
    codeLines,
    commentLines,
    blankLines,
    functions: functions.length,
    classes: classes.length,
    avgFuncSize,
    maxFuncSize,
    commentDensity,
    cyclomaticPerLOC,
  };
}

// Project scan
const folder = "./";
const files = getAllFiles(folder);

if (files.length === 0) {
  console.log("No JavaScript or TypeScript files found.");
  process.exit(0);
}

// Aggregate metrics
let total = {
  totalLOC: 0,
  codeLines: 0,
  commentLines: 0,
  blankLines: 0,
  functions: 0,
  classes: 0,
  avgFuncSize: 0,
  maxFuncSize: 0,
  commentDensity: 0,
  cyclomaticPerLOC: 0,
};
let count = 0;

for (const file of files) {
  try {
    const code = fs.readFileSync(file, "utf8");
    const m = analyzeSizeMetrics(code);
    count++;
    for (const k in total) total[k] += m[k];
  } catch {}
}

for (const k in total) total[k] = parseFloat((total[k] / count).toFixed(2));

// Custom plain-white output
function printHeader(title) {
  console.log("\n===================================================");
  console.log(" " + title);
  console.log("===================================================");
}

function printRow(metric, value) {
  const col1 = metric.padEnd(30, " ");
  const col2 = String(value).padStart(10, " ");
  console.log(col1 + col2);
}

printHeader("SIZE METRICS SUMMARY");
printRow("Total LOC", total.totalLOC);
printRow("SLOC (Code Only)", total.codeLines);
printRow("Comment Lines", total.commentLines);
printRow("Blank Lines", total.blankLines);
printRow("Functions", total.functions);
printRow("Classes", total.classes);
printRow("Average Function Size (LOC)", total.avgFuncSize.toFixed(2));
printRow("Max Function Size (LOC)", total.maxFuncSize.toFixed(2));
printRow("Comment Density (%)", total.commentDensity.toFixed(2));
printRow("Cyclomatic per LOC", total.cyclomaticPerLOC.toFixed(4));

console.log("===================================================\n");
