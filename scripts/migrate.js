const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourcePublic = path.join(projectRoot, 'beyond-waitlist-lp', 'public');
const targetPublic = path.join(projectRoot, 'public');
const sourceComponents = path.join(projectRoot, 'beyond-waitlist-lp', 'src', 'components');
const targetComponents = path.join(projectRoot, 'src', 'components');

// Function to copy all files recursively
function copyRecursively(src, dest) {
    if (!fs.existsSync(src)) return;
    const isDirectory = fs.statSync(src).isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursively(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Function to copy components and prepend "use client";
function copyComponents(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyComponents(srcPath, destPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(srcPath, 'utf8');
            if (!content.includes('"use client"') && !content.includes("'use client'")) {
                fs.writeFileSync(destPath, '"use client";\n\n' + content);
            } else {
                fs.writeFileSync(destPath, content);
            }
        }
    }
}

// 1. Copy Public Assets
console.log('Copying public assets...');
copyRecursively(sourcePublic, targetPublic);

// 2. Copy Components
console.log('Copying components and adding use client...');
copyComponents(sourceComponents, targetComponents);

console.log('Migration complete.');
