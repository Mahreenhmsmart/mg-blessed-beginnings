# MG Website Cloner — Integration Guide

Yeh guide aapko batata hai ke MG Website Cloner ko apne project mein kaise integrate karein. Teen tareeqe hain — standalone server, Express router, ya embeddable widget.

---

## Method 1: Standalone Server (Sabse Aasaan)

Agar aapko jaldi se cloner chahiye bina kisi existing project ke:

```bash
# Server directory mein jaayein
cd server

# Node.js 20+ zaroori hai — koi npm install nahi chahiye!
node cloner-server.js
```

Server `http://localhost:4600` par start ho jayega. Browser mein open karein aur URL paste karke clone banayein.

### Configuration (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `CLONER_PORT` | `4600` | Server port |
| `CLONER_BANNER` | (empty = on) | Set to `off` to disable the banner on clones |

Example:
```bash
CLONER_PORT=8080 CLONER_BANNER=off node cloner-server.js
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/clone` | Clone a website. Body: `{ "url": "https://..." }` |
| `GET` | `/api/clones` | List all recent clones |
| `GET` | `/api/clone/:id/preview` | Preview a clone in browser |
| `GET` | `/api/clone/:id/download` | Download clone as HTML file |

---

## Method 2: Express Router (Existing Backend Mein)

Agar aapka Express backend already hai, toh cloner routes ko mount karein:

### Step 1: Install Dependencies

Cloner service ko MongoDB chahiye (clones store karne ke liye). Make sure `mongoose` is installed:

```bash
npm install mongoose
```

### Step 2: Import and Mount Routes

```javascript
// In your main Express app file (e.g., app.js or index.ts)
import clonerRouter from './src/routes/clonerRoutes';

// Mount at /api/cloner
app.use('/api/cloner', clonerRouter);
```

### Step 3: Custom Configuration (Optional)

```javascript
import { createClonerRouter } from './src/routes/clonerRoutes';

// With custom options
const clonerRouter = createClonerRouter({
  banner: false,              // Disable banner for paid users
  maxHtmlBytes: 5 * 1024 * 1024,  // 5 MB limit
  timeoutMs: 20000,           // 20 second timeout
});

app.use('/api/cloner', clonerRouter);
```

### Step 4: Auth Middleware (Optional)

Paid users ke liye banner remove karne ke liye:

```javascript
import { createClonerRouter } from './src/routes/clonerRoutes';

const clonerRouter = createClonerRouter({
  requireAuth: authenticateToken,  // Your auth middleware
  banner: true,  // Default for non-authenticated
});

// Or use req.clonerBanner in your middleware:
app.use((req, res, next) => {
  if (req.user && req.user.isPaid) {
    req.clonerBanner = false;
  }
  next();
});
```

### API Endpoints (when mounted at /api/cloner)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cloner/clone` | Clone a website |
| `GET` | `/api/cloner/clones` | List recent clones |
| `GET` | `/api/cloner/preview/:id` | Preview a clone |
| `GET` | `/api/cloner/download/:id` | Download a clone |

---

## Method 3: Embeddable Widget (Kisi Bhi Website Mein)

Apni existing website mein cloner widget add karein:

### Step 1: Backend Start Karein

Pehle backend running hona chahiye (Method 1 ya 2 se).

### Step 2: Widget Copy Karein

Open `server/public/cloner-widget.html` aur usme se yeh cheezein copy karein:
- `<style>` block
- `<div class="cloner-widget">...</div>` 
- `<script>` block

### Step 3: Backend URL Configure Karein

Script mein yeh line dhundhein aur apna backend URL daalein:

```javascript
const CLONER_BACKEND_URL = 'http://localhost:4600';  // Change this!
```

Production mein:
```javascript
const CLONER_BACKEND_URL = 'https://your-api-domain.com';
```

### Step 4: Paste in Your Page

```html
<!-- Jahan widget dikhana hai wahan paste karein -->
<div class="cloner-widget">
  <!-- ... widget HTML ... -->
</div>
```

---

## Technical Details

### What the Cloner Does

1. **Fetches the target page** via HTTP/HTTPS
2. **Inlines all stylesheets** — external CSS files are fetched and embedded in `<style>` tags
3. **Embeds small images** — images under 50KB are converted to base64 data URIs
4. **Strips all scripts** — no JavaScript runs in the clone (security)
5. **Removes event handlers** — onclick, onload, etc. are stripped
6. **Rewrites URLs** — relative paths become absolute URLs pointing to the original site

### Limitations

- **Visual only** — buttons, forms, login, shopping carts won't work in clones
- **Large images** stay as absolute URLs (need internet to display)
- **3 MB page size limit** by default
- **15 second fetch timeout** per request
- **Blocks localhost/private IPs** for security
- **Only public http/https pages** supported

### Security

- All `<script>` tags are removed from clones
- Inline event handlers (onclick, onload, etc.) are stripped
- Localhost and private IP addresses are blocked
- No cookies, localStorage, or session data is captured
- The clone is a static visual snapshot only

---

## Troubleshooting

### "Failed to fetch website"
- Check if the URL is publicly accessible
- Verify the site doesn't block automated requests
- Try a different URL

### "Request timed out"
- The target server may be slow
- Increase `timeoutMs` in configuration

### "Website exceeds size limit"
- The page is larger than 3 MB
- Increase `maxHtmlBytes` in configuration

### Images not showing in clone
- Large images (>50KB) remain as external URLs
- Internet connection required for those images
- Some sites block hotlinking of their images

---

## Support

For issues or questions, check the main README or open an issue on GitHub.
