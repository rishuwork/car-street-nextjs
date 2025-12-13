import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distClientDir = path.resolve(__dirname, '../dist/client');

const oldPath = path.join(distClientDir, 'index.html');
const newPath = path.join(distClientDir, 'index.template.html');

console.log('🚧 Starting post-build cleanup...');

if (fs.existsSync(oldPath)) {
    console.log(`Found static index.html at: ${oldPath}`);
    fs.renameSync(oldPath, newPath);
    console.log('✅ Successfully renamed index.html to index.template.html');
} else {
    console.log('⚠️ Warning: index.html not found. It might have been already renamed or build failed.');
}

// Double check
if (fs.existsSync(oldPath)) {
    console.error('❌ ERROR: index.html still exists! Vercel will serve this statically.');
    process.exit(1);
} else {
    console.log('🎉 Verification passed: index.html is gone.');
}
