const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../pages/admin-dashboard.html');
const userPath = path.join(__dirname, '../pages/dashboard.html');

let adminHtml = fs.readFileSync(adminPath, 'utf8');
let userHtml = fs.readFileSync(userPath, 'utf8');

// 1. Remove the Role Toggle block from both
const roleToggleRegex = /<!-- Role Toggle -->\s*<div.*?<\/div>/s;
// Wait, regex for the block might be fragile if it has nested divs. 
// Let's use simple string replacements based on exact lines.
