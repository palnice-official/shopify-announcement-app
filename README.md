# Shopify Announcement App

A Shopify app that allows merchants to manage store announcements that appear as a banner on the storefront.

## Features
- Create announcements from Shopify Admin dashboard
- Saves announcement history to MongoDB
- Displays announcement as a banner on storefront via Theme App Extension

## Tech Stack
- React Router (Remix)
- Node.js
- MongoDB + Mongoose
- Shopify Polaris
- Shopify Theme App Extension

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Shopify Partner account

### Local Development

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/shopify-announcement-app.git
cd shopify-announcement-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create .env file:
\`\`\`
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_metaobject_definitions,write_metaobjects,write_products
SHOPIFY_APP_URL=your_app_url
MONGODB_URI=your_mongodb_connection_string
\`\`\`

4. Run database migrations:
\`\`\`bash
npx prisma migrate deploy
\`\`\`

5. Start the app:
\`\`\`bash
npm run dev
\`\`\`

## How It Works
1. Merchant types announcement in Admin dashboard
2. App saves text to MongoDB with timestamp
3. App saves text to Shopify Shop Metafield (my_app.announcement)
4. Theme App Extension reads metafield and displays banner on storefront

## Deployment
Deployed on Render.com with MongoDB Atlas as database.