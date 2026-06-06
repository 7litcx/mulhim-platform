const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Apply bulk update to buttons (Yellow to Teal)
        content = content.replace(/bg-accent-yellow hover:bg-primary-yellow text-white/g, 'bg-accent-teal hover:bg-primary-teal text-white');
        content = content.replace(/bg-accent-yellow text-white hover:bg-primary-yellow/g, 'bg-accent-teal text-white hover:bg-primary-teal');
        content = content.replace(/bg-accent-yellow border-accent-yellow text-white/g, 'bg-accent-teal border-accent-teal text-white');
        
        // Ensure any remaining yellow buttons or badges that use text-white get text-primary-navy for contrast
        let chunks = content.split('className=');
        for (let i = 1; i < chunks.length; i++) {
            let quoteChar = chunks[i][0];
            let closingQuoteIndex = -1;
            
            if (quoteChar === '"' || quoteChar === "'" || quoteChar === "`" || quoteChar === "{") {
                closingQuoteIndex = chunks[i].indexOf("}", 1);
                if (closingQuoteIndex === -1 || quoteChar !== "{") {
                     closingQuoteIndex = chunks[i].indexOf(quoteChar, 1);
                }
                
                if (closingQuoteIndex !== -1) {
                    let classNameStr = chunks[i].substring(0, closingQuoteIndex + 1);
                    if (classNameStr.includes('bg-accent-yellow') && classNameStr.includes('text-white')) {
                        let newClassNameStr = classNameStr.replace(/text-white/g, 'text-primary-navy');
                        chunks[i] = newClassNameStr + chunks[i].substring(closingQuoteIndex + 1);
                    }
                }
            }
        }
        content = chunks.join('className=');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Modified:', filePath);
        }
    }
});
