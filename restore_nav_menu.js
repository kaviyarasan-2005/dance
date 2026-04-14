const fs = require('fs');
const path = require('path');

function processFiles(dir) {
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        let filePath = path.join(dir, file);
        let stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) { 
            if (filePath.includes('pages')) {
                processFiles(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Find the menu outside the header
            const menuRegex = /<\/header>\n\n\s*(<ul class="navbar__menu"[\s\S]*?<\/ul>)/;
            let match = content.match(menuRegex);
            if (match) {
                let menuHtml = match[1];
                // Remove it from outside
                content = content.replace(menuHtml, '');
                
                // Put it back inside navbar__inner
                // It was before navbar__actions usually
                content = content.replace('<div class="navbar__actions">', menuHtml + '\n        <div class="navbar__actions">');
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Restored nav menu in:', filePath);
            }
        }
    });
}
processFiles(__dirname);
