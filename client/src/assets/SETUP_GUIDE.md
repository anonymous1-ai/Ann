# Quick Logo Setup Guide

## Step 1: Add Your Logo
1. Copy your logo file into this `client/src/assets/` folder
2. Rename it to `logo.png` (or keep your preferred name)

## Step 2: Update Configuration
Open `logo-config.ts` and change these two lines:

```typescript
export const USE_CUSTOM_LOGO = true;  // Change from false to true
export const CUSTOM_LOGO_PATH = '/src/assets/logo.png';  // Update with your file name
```

## Step 3: Save and Refresh
Your logo will immediately appear in:
- Navigation bar
- Login/signup forms  
- Loading screen
- Footer

## Current Folder Contents
```
client/src/assets/
├── SETUP_GUIDE.md          ← You are here
├── INSTRUCTIONS.md         ← Detailed instructions
├── README.md               ← Full documentation
├── logo-config.ts          ← Configuration file (edit this!)
├── logo-placeholder.svg    ← Example SVG logo
└── [your-logo-file]        ← Place your logo here
```

## Supported Formats
- PNG (recommended)
- JPG/JPEG
- SVG
- WebP

## Quick Example
If you add a file called `my-logo.png`:

```typescript
export const USE_CUSTOM_LOGO = true;
export const CUSTOM_LOGO_PATH = '/src/assets/my-logo.png';
```

That's it! Your logo will replace the current one everywhere in the application.