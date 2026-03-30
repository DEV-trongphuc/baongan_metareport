const fs = require('fs'), path = require('path');

function walk(dir) {
  let r = [];
  try {
    fs.readdirSync(dir).forEach(f => {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) r = r.concat(walk(full));
      else if (f.endsWith('.js')) r.push(full);
    });
  } catch (e) {}
  return r;
}

const files = [...walk('js'), 'main.js'];
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;
    // Match lines with Vietnamese dong symbol (đ or ₫) in code context
    if (t.includes('\u20ab') || // ₫
        t.match(/[`"']\u0111/) || // ends with đ in string
        t.match(/\u0111[`"']/) || // đ in string
        t.match(/}\u0111/) || // }đ template literal
        t.match(/\u0111;/) // đ before semicolon
    ) {
      console.log(file + ':' + (i + 1) + ' | ' + t.substring(0, 140));
    }
  });
});
