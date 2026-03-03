# Shopify Announcement App

A Shopify app that allows merchants to create and manage store announcements that appear as a fixed banner at the top of the storefront.

## ✨ Features
- Create announcements from Shopify Admin dashboard
- Saves announcement history to MongoDB
- Displays announcement as a fixed banner at the top of storefront
- Real-time banner updates via Shopify Metafields
- Theme App Extension integration

## 🛠 Tech Stack
- **Frontend**: React Router (Remix)
- **Backend**: Node.js/Express
- **Database**: MongoDB + Mongoose, SQLite (Prisma)
- **UI Framework**: Shopify Polaris Web Components
- **Theme Integration**: Shopify Theme App Extension (Liquid)
- **Hosting**: Render.com
- **APIs**: Shopify Admin GraphQL API

## 📋 Prerequisites
- Node.js v18 or higher
- npm or yarn
- MongoDB Atlas account (free tier available)
- Shopify Partner account
- Git

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone <repository-url>
cd announcement-app
npm install
```

### 2. Create .env File
Create a `.env` file in the root directory:
```
SHOPIFY_API_KEY=your_api_key_from_partner_dashboard
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/announcementdb
```

**How to get these values:**
- `SHOPIFY_API_KEY` & `SHOPIFY_API_SECRET`: Shopify Partner Dashboard → Apps → Your App → Configuration
- `MONGODB_URI`: MongoDB Atlas → Cluster → Connect → Connection String

### 3. Run Locally
```bash
npm run dev
```

The app will start at `http://localhost:3000`

**In your browser:**
1. Open Shopify Partner Dashboard
2. Create/select a development store
3. Install your announcement app on the store
4. Go to Admin → Apps → Announcement Manager

## 📝 How to Use

### Creating an Announcement

1. Open the **Announcement Manager** app in Shopify Admin
2. Type your announcement text in the input field
3. Click **Save Announcement**
4. You should see a success message
5. The announcement appears in "Recent Announcements" list
6. Visit your storefront - the yellow banner appears at the top with your text

### How It Works Behind the Scenes

```
User creates announcement in Admin
         ↓
Action function validates text
         ↓
Saves to MongoDB with timestamp
         ↓
Gets Shop ID from Shopify
         ↓
Saves to Shopify Metafield (namespace: my_app, key: announcement)
         ↓
Theme Extension reads metafield
         ↓
Liquid template displays banner on storefront
```

## 🌐 Banner Positioning

The announcement banner is displayed as a **fixed element at the top of the page**:
- **Background**: Yellow (#FFEB3B)
- **Text Color**: Black
- **Width**: Full width
- **Position**: Fixed to top (stays visible when scrolling)
- **Z-Index**: 9999 (above other elements)

## 📦 Deployment to Production

### Deploy to Render

1. **Commit your changes:**
```bash
git add .
git commit -m "Your change description"
```

2. **Push to main branch:**
```bash
git push origin main
```

Render automatically deploys when you push to `main`. This typically takes 2-5 minutes.

3. **Monitor deployment:**
   - Go to https://dashboard.render.com
   - Select **shopify-announcement-app-1**
   - Watch status change to "Live"

4. **Verify on live store:**
   - Open your Shopify store at your-store.myshopify.com
   - Create a test announcement in your app admin
   - Check that the banner appears at the top

### Live App URL
https://shopify-announcement-app-1.onrender.com

## 🔧 Configuration

### Required Shopify Scopes
The app requires these API scopes (defined in `shopify.app.toml`):
```
write_metafield_definitions
write_metafields
write_metaobject_definitions
write_metaobjects
write_products
```

### Metafield Definition
The app creates a shop metafield with these properties:
- **Namespace**: `my_app`
- **Key**: `announcement`
- **Type**: `single_line_text_field`
- **Admin Access**: Read/Write
- **Storefront Access**: Public Read

## 🐛 Troubleshooting

### Banner not showing on storefront?
1. Hard refresh storefront (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. Verify announcement was saved (check "Recent Announcements" list in admin)
3. Check browser DevTools → Inspector, search for `announcement-banner` div
4. Verify Announcement Banner block is added to theme body

### Success message appears but banner doesn't update?
1. Check server logs for "Metafield response" message
2. Ensure `write_metafields` scope is authorized
3. Clear theme cache by reloading theme dev
4. Check that Liquid template has conditional check: `{% if shop.metafields.my_app.announcement %}`

### MongoDB connection failed?
1. Verify `MONGODB_URI` is correct in `.env`
2. Check MongoDB Atlas network access whitelist includes your IP
3. Ensure username/password in connection string are URL-encoded

### Metafield not found in Shopify Admin?
1. Metafield is created automatically on first save
2. Go to **Settings → Custom data → Announcement** or search for "my_app"
3. May take 1-2 minutes to appear after first announcement

## 📂 Project Structure
```
announcement-app/
├── app/
│   ├── routes/
│   │   ├── app._index.jsx      (Admin UI with loader/action)
│   │   └── app.jsx              (App layout)
│   ├── models.js                (MongoDB schema)
│   ├── db.mongo.js              (MongoDB connection)
│   └── shopify.server.js        (Shopify auth)
├── extensions/
│   └── announcement-banner/
│       └── blocks/
│           └── announcement_banner.liquid  (Storefront banner)
├── shopify.app.toml             (App config & scopes)
└── package.json
```

## 🚀 Development Workflow

### Making Changes
1. Make code changes
2. Test locally with `npm run dev`
3. Test on your development store
4. Commit changes: `git add . && git commit -m "description"`
5. Push to main: `git push origin main`
6. Verify deployment on Render dashboard
7. Test on live storefront

### Useful Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run type-check       # Check TypeScript errors
git status               # See changed files
git log --oneline        # View recent commits
```

## 📝 Version History

**v1.0.0** - Initial release
- Admin dashboard for creating announcements
- MongoDB persistence
- Shopify Metafield integration
- Fixed banner at top of storefront

## 📝 License
Proprietary - Shopify Assessment Project

## 🤝 Support
For issues or feature requests, contact the development team.
