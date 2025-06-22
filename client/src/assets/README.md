# Assets Folder

This folder contains all static assets for the Silently AI application.

## Logo Files

Place your logo files in this directory:

- `logo.png` - Main logo file (recommended: PNG format with transparent background)
- `logo.svg` - Vector logo file (optional, for scalability)
- `logo-light.png` - Light variant of logo (for dark backgrounds)
- `logo-dark.png` - Dark variant of logo (for light backgrounds)

## Recommended Logo Specifications

- **Format**: PNG with transparent background or SVG
- **Size**: 512x512px minimum for PNG files
- **Aspect Ratio**: Square (1:1) or horizontal (16:9)
- **Background**: Transparent
- **Colors**: Should work well with the gold theme (#D4AF37, #FFD700)

## Usage

To use your logo in the application, import it like this:

```typescript
import logo from '@/assets/logo.png';
```

Then use it in components:

```jsx
<img src={logo} alt="Company Logo" className="w-8 h-8" />
```

## Current Logo Usage

The logo is currently used in:
- Navigation bar (Index and Dashboard pages)
- Authentication forms (Login and Signup)
- Loading screen
- Footer

Replace the current logo references with your custom logo file.