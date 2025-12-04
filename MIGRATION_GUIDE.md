# Migration Guide: React to Node.js/Express/EJS or Next.js

## Option 1: Next.js (Recommended for SSR with React)

### Why Next.js?
- Keep your React components and knowledge
- True server-side rendering (SSR)
- Static site generation (SSG) for better SEO
- API routes built-in
- Easy Supabase integration

### Migration Steps

1. **Export from Lovable**
   - Go to Settings → GitHub → Connect to GitHub
   - Create a repository with your code

2. **Clone and Setup Next.js**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   
   # Create new Next.js project
   npx create-next-app@latest car-street-nextjs --typescript --tailwind --eslint
   cd car-street-nextjs
   ```

3. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js react-hook-form zod framer-motion lucide-react
   npm install @supabase/ssr  # For SSR auth
   ```

4. **Project Structure (Next.js App Router)**
   ```
   /app
     /page.tsx              → Homepage (SSR)
     /inventory/page.tsx    → Inventory listing
     /vehicle/[id]/page.tsx → Vehicle detail (dynamic SSR)
     /pre-approval/page.tsx → Finance form
     /about/page.tsx        → About page
     /contact/page.tsx      → Contact page
     /auth/page.tsx         → Login/Signup
     /admin/
       /page.tsx            → Dashboard
       /inventory/page.tsx  → Inventory management
       /leads/page.tsx      → Leads management
       /users/page.tsx      → User management
     /api/
       /vehicles/route.ts   → API endpoints
       /leads/route.ts
   /components              → Migrate your React components here
   /lib
     /supabase.ts           → Supabase client setup
   ```

5. **Convert Pages to Server Components**
   ```tsx
   // app/inventory/page.tsx
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';

   export const metadata = {
     title: 'Used Car Inventory | Car Street',
     description: 'Browse our selection of quality pre-owned vehicles...',
   };

   export default async function InventoryPage() {
     const supabase = createServerComponentClient({ cookies });
     
     const { data: vehicles } = await supabase
       .from('vehicles')
       .select('*')
       .eq('status', 'available')
       .order('created_at', { ascending: false });

     return (
       <main>
         {/* Your inventory grid - rendered on server */}
         {vehicles?.map(vehicle => (
           <VehicleCard key={vehicle.id} vehicle={vehicle} />
         ))}
       </main>
     );
   }
   ```

6. **Dynamic Vehicle Pages with SEO**
   ```tsx
   // app/vehicle/[id]/page.tsx
   import { Metadata } from 'next';

   export async function generateMetadata({ params }): Promise<Metadata> {
     const vehicle = await getVehicle(params.id);
     return {
       title: `${vehicle.year} ${vehicle.make} ${vehicle.model} | Car Street`,
       description: `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${vehicle.mileage} km...`,
       openGraph: {
         images: [vehicle.images?.[0] || '/placeholder.jpg'],
       },
     };
   }

   export default async function VehiclePage({ params }) {
     const vehicle = await getVehicle(params.id);
     
     const jsonLd = {
       '@context': 'https://schema.org',
       '@type': 'Vehicle',
       name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
       // ... full structured data
     };

     return (
       <>
         <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
         />
         {/* Vehicle detail content */}
       </>
     );
   }
   ```

7. **Deploy**
   - Vercel (recommended): `vercel deploy`
   - Self-host: `npm run build && npm run start`

---

## Option 2: Node.js + Express + EJS (Full Server-Side)

### Project Structure
```
/server
  server.js              → Main Express app
  /routes
    public.js            → Public page routes
    admin.js             → Admin routes
    api.js               → API endpoints
  /controllers
    vehicleController.js
    leadController.js
    authController.js
  /middleware
    auth.js              → Admin authentication
    rateLimit.js         → Rate limiting
  /services
    supabase.js          → Supabase client
    email.js             → Nodemailer setup

/views
  /layouts
    main.ejs             → Base layout
    admin.ejs            → Admin layout
  /public
    index.ejs            → Homepage
    inventory.ejs        → Inventory listing
    vehicle.ejs          → Vehicle detail
    pre-approval.ejs     → Finance form
    about.ejs            → About page
    contact.ejs          → Contact page
    auth.ejs             → Login/Signup
    404.ejs              → Error page
  /admin
    dashboard.ejs
    inventory.ejs
    leads.ejs
    users.ejs
  /partials
    header.ejs
    footer.ejs
    vehicle-card.ejs
    seo-head.ejs

/public
  /css
    styles.css           → Tailwind output
  /js
    main.js              → Client-side JS (minimal)
  /uploads               → Vehicle images

/utils
  seo.js                 → SEO helper functions
  sitemap.js             → Sitemap generator
```

### Key Files

**server.js**
```javascript
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Security
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.use('/', require('./routes/public'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('public/404', { 
    title: 'Page Not Found | Car Street' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**routes/public.js**
```javascript
const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { generateSEO, generateVehicleJsonLd } = require('../../utils/seo');

// Homepage
router.get('/', async (req, res) => {
  const { data: featured } = await supabase
    .from('vehicles')
    .select('*')
    .eq('featured', true)
    .eq('status', 'available')
    .limit(6);

  res.render('public/index', {
    ...generateSEO({
      title: 'Car Street - Quality Used Cars in Langton, Ontario',
      description: 'Find quality pre-owned vehicles at Car Street...'
    }),
    featured
  });
});

// Inventory
router.get('/inventory', async (req, res) => {
  const { make, model, minPrice, maxPrice, page = 1 } = req.query;
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('vehicles')
    .select('*', { count: 'exact' })
    .eq('status', 'available');

  if (make) query = query.eq('make', make);
  if (model) query = query.ilike('model', `%${model}%`);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);

  const { data: vehicles, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  res.render('public/inventory', {
    ...generateSEO({
      title: 'Used Car Inventory',
      description: 'Browse our selection of quality pre-owned vehicles...'
    }),
    vehicles,
    pagination: { page: parseInt(page), total: Math.ceil(count / limit) },
    filters: { make, model, minPrice, maxPrice }
  });
});

// Vehicle Detail
router.get('/vehicle/:id', async (req, res) => {
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (!vehicle) return res.status(404).render('public/404');

  const { data: images } = await supabase
    .from('vehicle_images')
    .select('*')
    .eq('vehicle_id', vehicle.id)
    .order('display_order');

  const { data: similar } = await supabase
    .from('vehicles')
    .select('*')
    .eq('make', vehicle.make)
    .neq('id', vehicle.id)
    .eq('status', 'available')
    .limit(4);

  res.render('public/vehicle', {
    ...generateSEO({
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description: `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${vehicle.mileage.toLocaleString()} km...`,
      image: images?.[0]?.image_url
    }),
    jsonLd: generateVehicleJsonLd(vehicle, images?.[0]?.image_url),
    vehicle,
    images,
    similar
  });
});

module.exports = router;
```

**views/partials/seo-head.ejs**
```ejs
<title><%= title %></title>
<meta name="description" content="<%= description %>">
<meta name="keywords" content="<%= keywords || 'used cars, car dealership, Langton Ontario' %>">
<link rel="canonical" href="<%= canonical || 'https://carstreet.com' + url %>">

<!-- Open Graph -->
<meta property="og:type" content="<%= ogType || 'website' %>">
<meta property="og:url" content="<%= canonical || 'https://carstreet.com' + url %>">
<meta property="og:title" content="<%= title %>">
<meta property="og:description" content="<%= description %>">
<meta property="og:image" content="<%= ogImage || 'https://carstreet.com/og-image.jpg' %>">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<%= title %>">
<meta name="twitter:description" content="<%= description %>">
<meta name="twitter:image" content="<%= ogImage || 'https://carstreet.com/twitter-image.jpg' %>">

<% if (typeof jsonLd !== 'undefined' && jsonLd) { %>
<script type="application/ld+json"><%- JSON.stringify(jsonLd) %></script>
<% } %>
```

### Deployment Files

**Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server/server.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

**.env.example**
```
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Session
SESSION_SECRET=your-super-secret-key

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Recommendation

**For SEO-critical sites like car dealerships:**

1. **If you want to keep React knowledge**: Use **Next.js** with App Router
   - Easier migration from existing components
   - Great SEO with SSR/SSG
   - Vercel deployment is seamless

2. **If you want maximum control**: Use **Node.js + Express + EJS**
   - Complete server-side rendering
   - No JavaScript required for content
   - Full control over HTML output

Both options will significantly improve SEO compared to client-side React routing.
