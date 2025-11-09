// halsteadMetrics.js
const fs = require("fs");
const path = require("path");

// -----------------------------------------------------------
// Recursively collect all JS/TS files (skip node_modules)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Analyze one code file for Halstead metrics
// -----------------------------------------------------------
function analyzeCode(code) {
  const operatorsList =
    code.match(
      /\b(if|else|for|while|switch|case|return|=|\+|-|\*|\/|%|&&|\|\||!|>|<)\b/g
    ) || [];
  const operandsList = code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

  const n1 = new Set(operatorsList).size;
  const n2 = new Set(operandsList).size;
  const N1 = operatorsList.length;
  const N2 = operandsList.length;

  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = vocabulary > 0 ? length * Math.log2(vocabulary) : 0;
  const difficulty = n2 > 0 ? (n1 / 2) * (N2 / n2) : 0;
  const effort = volume * difficulty;
  const time = effort / 18; // seconds
  const bugs = volume / 3000; // estimated defects

  return { n1, n2, N1, N2, length, vocabulary, volume, difficulty, effort, time, bugs };
}

// -----------------------------------------------------------
// Analyze all files and compute averages
// -----------------------------------------------------------
const folder = "./";
const files = getAllFiles(folder);

let total = {
  n1: 0,
  n2: 0,
  N1: 0,
  N2: 0,
  length: 0,
  vocabulary: 0,
  volume: 0,
  difficulty: 0,
  effort: 0,
  time: 0,
  bugs: 0,
};
let count = 0;

for (const file of files) {
  try {
    const code = fs.readFileSync(file, "utf8");
    const m = analyzeCode(code);
    count++;
    for (const k in total) total[k] += m[k];
  } catch {}
}

// -----------------------------------------------------------
// Pretty print the result in plain white, aligned output
// -----------------------------------------------------------
if (count > 0) {
  for (const k in total) total[k] = parseFloat((total[k] / count).toFixed(2));

  const metrics = [
    ["Distinct Operators (n1)", total.n1],
    ["Distinct Operands (n2)", total.n2],
    ["Total Operators (N1)", total.N1],
    ["Total Operands (N2)", total.N2],
    ["Program Length", total.length],
    ["Program Vocabulary", total.vocabulary],
    ["Program Volume", total.volume],
    ["Difficulty", total.difficulty],
    ["Effort", total.effort],
    ["Time (sec)", total.time],
    ["Estimated Bugs", total.bugs],
  ];

  console.log("\n==============================================================");
  console.log("                   HALSTEAD METRICS REPORT                    ");
  console.log("==============================================================");
  console.log("File Count:", count);
  console.log("--------------------------------------------------------------");
  console.log(
    padRight("METRIC", 30) + padLeft("AVERAGE VALUE", 20)
  );
  console.log("--------------------------------------------------------------");

  metrics.forEach(([name, value]) => {
    console.log(padRight(name, 30) + padLeft(value.toFixed(2), 20));
  });

  console.log("--------------------------------------------------------------");
} else {
  console.log("No JavaScript or TypeScript files found.\n");
}

// -----------------------------------------------------------
// Helper functions for alignment
// -----------------------------------------------------------
function padRight(str, width) {
  if (str.length >= width) return str;
  return str + " ".repeat(width - str.length);
}
function padLeft(str, width) {
  str = String(str);
  if (str.length >= width) return str;
  return " ".repeat(width - str.length) + str;
}
