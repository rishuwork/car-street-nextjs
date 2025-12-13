import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distClientDir = path.resolve(__dirname, '../dist/client');
const apiDir = path.resolve(__dirname, '../api');

// Vite is preserving the 'src' folder in output because of the input path
const sourcePath = path.join(distClientDir, 'src/index.html');
const destPath = path.join(apiDir, 'index.template.html');

console.log('🚧 Starting post-build cleanup...');

// Ensure api dir exists
if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
}

console.log(`Checking directory: ${distClientDir}`);
if (fs.existsSync(distClientDir)) {
    console.log('Contents:', fs.readdirSync(distClientDir));
} else {
    console.log('❌ Directory dist/client does not exist!');
    // Check parent
    const distDir = path.resolve(__dirname, '../dist');
    if (fs.existsSync(distDir)) {
        console.log('Contents of dist:', fs.readdirSync(distDir));
    }
}

if (fs.existsSync(sourcePath)) {
    console.log(`Found index.html at: ${sourcePath}`);
    // COPY instead of rename/move so Vercel CDN still gets the (now useless) index.html
    // but we have a safe copy for the server
    fs.copyFileSync(sourcePath, destPath);
    // Retrieve: Rename the original to avoid static conflict?
    // YES. We must kill the original index.html so Vercel doesn't serve it.
    // fs.renameSync is risky if Vercel looks for it.
    // Instead, we overwrite it with "Moved".
    fs.writeFileSync(sourcePath, "<!-- Moved to SSR -->");

    console.log(`✅ Copied template to: ${destPath}`);
} else {
    // If not found, maybe we are running locally or it was already moved?
    console.log('⚠️ Warning: index.html not found in dist/client.');
}

// Double check
if (fs.existsSync(destPath)) {
    console.log('🎉 Verification passed: template copied.');
} else {
    // We don't error on sourcePath missing because maybe it wasn't created, but destPath MUST be there if we want server to run
    console.error('❌ ERROR: index.template.html missing in api dir!');
    process.exit(1);
}
