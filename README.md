# Purcari Israel - Premium Wine Ecommerce

A modern, high-performance ecommerce frontend for **Purcari Winery Israel**, featuring full Right-to-Left (RTL) support in Hebrew and seamless integration with Appwrite Cloud.

## 🍷 Project Overview

This project is a premium wine shop tailored for the Israeli market. It offers a sophisticated shopping experience with a focus on heritage, quality, and user-friendly navigation.

### Key Features

- 🇮🇱 **Full RTL Support**: Native Hebrew interface with logical layout properties.
- 🛍️ **Complete Shop Flow**: Product browsing, advanced filtering by category, and detailed product views.
- 💳 **Multi-step Checkout**: Streamlined 3-step checkout process (Shipping -> Payment -> Review).
- 👤 **Customer Authentication**: Secure login and registration with automated form pre-filling for existing users.
- 📊 **Analytics Integration**: Real-time event tracking for page views, product views, and conversions.
- 🏷️ **Coupon System**: Dynamic coupon validation against cart totals.
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop devices.
- ✨ **Polished UI/UX**: Smooth animations with Framer Motion and a luxury aesthetic using Tailwind CSS.

## 🛠️ Tech Stack

- **React 18** with **TypeScript**
- **Vite 6** for lightning-fast development
- **Redux Toolkit & RTK Query** for state management and API integration
- **Appwrite Cloud** as the backend (Database, Auth, Storage)
- **Tailwind CSS** for styling
- **Framer Motion** for fluid animations
- **Lucide React** for icons

## 📁 Project Structure

```text
├── components/         # Reusable UI components (broken into domains)
│   ├── home/           # Homepage-specific components
│   ├── about/          # About page-specific components
│   ├── checkout/       # Checkout flow components
│   └── ...             # Global components like Header, Footer, etc.
├── pages/              # Main route components
├── services/           # Backend interaction logic
│   ├── appwrite.ts     # Appwrite client configuration
│   └── api/            # RTK Query API slices
├── store/              # Redux store and global state slices
├── types.ts            # Shared TypeScript interfaces
└── App.tsx             # Main application and routing
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (Latest LTS recommended)
- An Appwrite Cloud account

### 2. Environment Setup
Create a `.env.local` file in the root directory and add your Appwrite credentials:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

### 3. Installation
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 📜 Backend Configuration (Appwrite)

The app expects the following collections in your `cms_db` database:
- `products`: Product catalog
- `categories`: Product categories
- `orders`: Flattened order documents
- `order_items`: Order line items
- `coupons`: Discount codes
- `analytics_events`: User tracking data

---

Developed with ❤️ for Purcari Winery Israel.
