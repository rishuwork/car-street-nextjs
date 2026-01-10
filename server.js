import 'dotenv/config'; // Load env vars
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const base = process.env.BASE || '/';

export async function createServer() {
    const app = express();

    // Initialize Supabase client for server-side operations
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sitemap Route - Must be defined BEFORE static middleware
    app.get('/sitemap.xml', async (req, res) => {
        try {
            // Fetch all vehicle IDs
            const { data: vehicles } = await supabase
                .from('vehicles')
                .select('id, updated_at')
                .eq('status', 'available');

            const baseUrl = 'https://carstreet.ca';
            const staticPages = [
                '',
                '/inventory',
                '/pre-approval',
                '/sell-your-car',
                '/about',
                '/contact',
                '/privacy-policy'
            ];

            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPages.map(page => `
    <url>
        <loc>${baseUrl}${page}</loc>
        <changefreq>${page === '/inventory' ? 'daily' : 'monthly'}</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>
    `).join('')}
        ${vehicles ? vehicles.map(vehicle => `
    <url>
        <loc>${baseUrl}/vehicle/${vehicle.id}</loc>
        <lastmod>${new Date(vehicle.updated_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    `).join('') : ''}
    </urlset>`;

            res.header('Content-Type', 'application/xml');
            res.send(sitemap);
        } catch (e) {
            console.error('Sitemap generation error:', e);
            res.status(500).send('Error generating sitemap');
        }
    });

    let vite;
    if (!isProduction) {
        const { createServer: createViteServer } = await import('vite');
        vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom',
            base,
        });
        app.use(vite.middlewares);

        // ... (imports)

        // ...

    } else {
        const compression = (await import('compression')).default;
        const sirv = (await import('sirv')).default;
        app.use(compression());

        // In Vercel, dist/client is stripped from the lambda (served by CDN)
        // So we should only use sirv if the directory actually exists (e.g. local prod preview)
        const clientDistPath = './dist/client';
        if (existsSync(clientDistPath)) {
            app.use(base, sirv(clientDistPath, { extensions: [] }));
        }
    }

    app.use('*', async (req, res) => {
        try {
            let url = req.originalUrl;
            if (base !== '/' && url.startsWith(base)) {
                url = url.substring(base.length);
            }

            let template;
            let render;

            if (!isProduction) {
                // Always read fresh template in dev
                template = await fs.readFile(path.resolve(__dirname, 'src/index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
            } else {
                // ROBUST TEMPLATE FINDING STRATEGY
                const templatePath = path.resolve(__dirname, 'api/index.template.html');

                if (existsSync(templatePath)) {
                    console.log(`✅ Using template: ${templatePath}`);
                    template = await fs.readFile(templatePath, 'utf-8');
                } else {
                    console.error(`❌ Template NOT found at: ${templatePath}`);
                    // Fallback to searching
                    const possiblePaths = [
                        path.join(__dirname, 'dist/client/src/index.html'),
                        path.join(__dirname, 'dist/client/index.html'),
                        path.join(__dirname, 'index.template.html')
                    ];
                    for (const p of possiblePaths) {
                        if (existsSync(p)) {
                            console.log(`⚠️ Falling back to template: ${p}`);
                            template = await fs.readFile(p, 'utf-8');
                            break;
                        }
                    }
                }

                if (!template) {
                    // List directories to help debug
                    console.error('Critical Error: Template file missing in production.');
                    throw new Error(`Template not found. Checked api/index.template.html and others.`);
                }

                render = (await import('./dist/server/entry-server.js')).render;
            }

            const helmetContext = {};
            const appHtml = render(url, helmetContext);
            const { helmet } = helmetContext;

            const html = template
                .replace(`<!--app-html-->`, appHtml)
                .replace(
                    `<!--helmet-meta-->`,
                    `
                    ${helmet.title.toString()}
                    ${helmet.priority.toString()}
                    ${helmet.meta.toString()}
                    ${helmet.link.toString()}
                    ${helmet.script.toString()}
`
                );

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            vite?.ssrFixStacktrace(e);
            console.log(e.stack);
            res.status(500).end(e.stack);
        }
    });

    return { app };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    createServer().then(({ app }) =>
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        })
    );
}
