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
            
            // Find the menu
            const menuRegex = /<ul class="navbar__menu"[\s\S]*?<\/ul>/;
            let match = content.match(menuRegex);
            if (match) {
                let menuHtml = match[0];
                // Remove it from current place (inside navbar__inner)
                content = content.replace(menuHtml, '');
                
                // Insert it after the entire <header>...</header> block
                // Let's find the closing </header> tag
                content = content.replace('</header>', '</header>\n\n    ' + menuHtml);
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Moved nav menu in:', filePath);
            }
        }
    });
}
processFiles(__dirname);
