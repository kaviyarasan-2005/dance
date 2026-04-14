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

            // We added the button as: class="btn btn--primary" style="..."
            // We want to add an inline style to override transition or just create a style block.
            // But an easier way is to remove `btn--primary` and put the colors inside style="" so there's no hover state.
            
            const btnRegex = /class="btn btn--primary" style="(padding:0\.5rem 1\.25rem;border-radius:var\(--radius-full\);margin-inline-end:0\.5rem;)"/g;
            
            if (content.match(btnRegex)) {
                content = content.replace(btnRegex, 'class="btn" style="$1background:var(--gradient-primary);color:white;border:none;transition:none;transform:none;box-shadow:none;"');
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Removed hover from login button in:', filePath);
            }
        }
    });
}

processFiles(__dirname);
