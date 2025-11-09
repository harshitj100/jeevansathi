// informationFlowMetrics.js
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

// Extract import/export relationships
function analyzeDependencies(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const exports = [];

  const importRegex = /import\s+(?:[\w*\s{},]*)\s*from\s*['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  const exportRegex = /export\s+(?:default\s+)?(function|class|const|let|var)?\s*([a-zA-Z0-9_]*)/g;

  let match;
  while ((match = importRegex.exec(code))) imports.push(match[1]);
  while ((match = requireRegex.exec(code))) imports.push(match[1]);
  while ((match = exportRegex.exec(code))) {
    if (match[2]) exports.push(match[2]);
  }

  return { imports, exports };
}

// Compute Fan-In / Fan-Out for all files
function computeInformationFlow(files) {
  const moduleData = {};
  const idMap = {};
  let id = 1;

  // First pass: gather imports/exports
  for (const file of files) {
    const { imports, exports } = analyzeDependencies(file);
    const name = path.basename(file);
    moduleData[file] = {
      id: id++,
      name,
      moduleName: name.replace(/\.(js|ts)$/, ''),
      path: file,
      imports,
      exports,
      fanIn: 0,
      fanOut: imports.length,
    };
    idMap[moduleData[file].moduleName] = file;
  }

  // Second pass: calculate Fan-In
  for (const file in moduleData) {
    const mod = moduleData[file];
    for (const imp of mod.imports) {
      // resolve basename for relative imports and non-relative (keep last segment)
      const importedName = path.basename(imp).replace(/\.(js|ts)$/, '');
      if (idMap[importedName]) {
        moduleData[idMap[importedName]].fanIn++;
      }
    }
  }

  return moduleData;
}

// Helper: truncate with ellipsis
function truncate(str, max) {
  if (str.length <= max) return str;
  if (max <= 1) return str.slice(0, max);
  return str.slice(0, max - 1) + '…';
}

// Print table with dynamic column widths
function printTable(data) {
  const rows = Object.values(data).map(m => ({
    ID: String(m.id),
    FILE: m.name,
    MODULE: m.moduleName,
    FAN_IN: String(m.fanIn),
    FAN_OUT: String(m.fanOut),
    PATH: m.path,
  }));

  // Column keys and human headers
  const cols = [
    { key: 'ID', header: 'ID', max: 4, align: 'right' },
    { key: 'FILE', header: 'FILE', max: 30, align: 'left' },
    { key: 'MODULE', header: 'MODULE', max: 25, align: 'left' },
    { key: 'FAN_IN', header: 'FAN-IN', max: 8, align: 'right' },
    { key: 'FAN_OUT', header: 'FAN-OUT', max: 8, align: 'right' },
    { key: 'PATH', header: 'PATH', max: 80, align: 'left' },
  ];

  // compute widths based on data, capped by max
  for (const c of cols) {
    const contentMax = Math.max(
      c.header.length,
      ...rows.map(r => (r[c.key] ? r[c.key].length : 0))
    );
    c.width = Math.min(c.max, contentMax);
  }

  // If PATH is the widest field, allow it to expand up to its max
  // (recompute PATH width to fit longest path if below max)
  const pathCol = cols.find(c => c.key === 'PATH');
  const longestPathLen = Math.max(...rows.map(r => r.PATH.length), pathCol.header.length);
  pathCol.width = Math.min(pathCol.max, Math.max(pathCol.width, longestPathLen));

  // Build separator lines
  const totalWidth = cols.reduce((s, c) => s + c.width + 1, 1); // spaces/padding
  const sep = '-'.repeat(totalWidth);

  // header row
  function pad(s, width, align) {
    if (s.length > width) s = truncate(s, width);
    return align === 'right' ? s.padStart(width) : s.padEnd(width);
  }

  console.log('\n' + '='.repeat(totalWidth));
  console.log(pad('INFORMATION FLOW METRICS REPORT', totalWidth, 'left'));
  console.log('='.repeat(totalWidth));
  console.log('File Count: ' + rows.length);
  console.log(sep);

  // header labels line
  const headerLine = cols.map(c => pad(c.header, c.width, c.align)).join(' ');
  console.log(headerLine);
  console.log(sep);

  // data lines
  for (const r of rows) {
    const line = cols
      .map(c => {
        const value = r[c.key] || '';
        return pad(truncate(value, c.width), c.width, c.align);
      })
      .join(' ');
    console.log(line);
  }

  console.log(sep);
  console.log('Analysis completed successfully.');
  console.log('');
}

// Execute
const folder = './';
const files = getAllFiles(folder);

if (files.length === 0) {
  console.log('No JavaScript or TypeScript files found.\n');
} else {
  const infoFlowData = computeInformationFlow(files);
  printTable(infoFlowData);
}
