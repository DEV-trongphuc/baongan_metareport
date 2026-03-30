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
const DONG = '\u0111'; // đ
const DONG2 = '\u20ab'; // ₫

const fixes = [];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Pattern: parseInt(x).toLocaleString('vi-VN') + '₫'  or  + "đ"
  content = content.replace(/parseInt\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\+\s*['"]\u0111['"]/g, 'formatMoney($1)');
  content = content.replace(/parseInt\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\+\s*['"]₫['"]/g, 'formatMoney($1)');

  // Pattern: ${parseInt(x).toLocaleString('vi-VN')}đ
  content = content.replace(/\$\{\s*parseInt\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\}\u0111/g, '${formatMoney($1)}');
  content = content.replace(/\$\{\s*parseInt\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\}₫/g, '${formatMoney($1)}');

  // Pattern: ${parseInt(spend).toLocaleString('vi-VN')}₫</p>
  content = content.replace(/\$\{\s*parseInt\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\}₫/g, '${formatMoney($1)}');

  // Pattern: Math.round(x).toLocaleString("vi-VN") + "đ"
  content = content.replace(/Math\.round\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\+\s*['"]\u0111['"]/g, 'formatMoney($1)');

  // Pattern: ${Math.round(x).toLocaleString("vi-VN")}đ
  content = content.replace(/\$\{\s*Math\.round\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\}\u0111/g, '${formatMoney($1)}');

  // Pattern: ${Math.round(x)}đ
  content = content.replace(/\$\{\s*Math\.round\(([^)]+)\)\s*\}\u0111/g, '${formatMoney($1)}');

  // Pattern: x.toLocaleString("vi-VN") + "đ"
  content = content.replace(/([\w\.\[\]]+)\.toLocaleString\(['"]vi-VN['"]\)\s*\+\s*['"]\u0111['"]/g, 'formatMoney($1)');

  // Pattern: ${x.toLocaleString("vi-VN")}đ
  content = content.replace(/\$\{\s*([\w\.\[\]]+)\.toLocaleString\(['"]vi-VN['"]\)\s*\}\u0111/g, '${formatMoney($1)}');

  // Pattern: "0đ"
  content = content.replace(/"0\u0111"/g, '(window.ACCOUNT_CURRENCY === "USD" ? "$0" : "0đ")');

  // Pattern in dailyBudget/lifetimeBudget spans: ${x.toLocaleString("vi-VN")}đ</span>
  content = content.replace(/\$\{\s*([\w\.\[\]]+)\.toLocaleString\(['"]vi-VN['"]\)\s*\}\u0111<\/span>/g, '${formatMoney($1)}</span>');

  // parseInt(val).toLocaleString('vi-VN') + '₫'
  content = content.replace(/parseInt\(([^)]+)\)\.toLocaleString\(['"]vi-VN['"]\)\s*\+\s*['"]₫['"]/g, 'formatMoney($1)');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixes.push(file);
    console.log('Fixed: ' + file);
  }
});

console.log('\nTotal fixed:', fixes.length);
