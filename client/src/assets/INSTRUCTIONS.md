# How to Add Your Custom Logo

## Quick Setup Steps

1. **Add your logo file** to this `client/src/assets/` folder
   - Supported formats: PNG, JPG, SVG
   - Recommended: PNG with transparent background
   - File name examples: `logo.png`, `my-logo.svg`, `company-logo.png`

2. **Update the configuration** in `logo-config.ts`:
   - Change `USE_CUSTOM_LOGO` to `true`
   - Update `CUSTOM_LOGO_PATH` to match your file name
   - Example: `'/src/assets/logo.png'`

3. **Save and refresh** - your logo will appear throughout the app

## File Structure
```
client/src/assets/
├── INSTRUCTIONS.md          (this file)
├── README.md               (detailed documentation)
├── logo-config.ts          (configuration file)
├── logo-placeholder.svg    (example logo)
└── [your-logo-file]        (place your logo here)
```

## Logo Specifications
- **Size**: Minimum 64x64px, recommended 512x512px
- **Format**: PNG (transparent background) or SVG preferred
- **Colors**: Should work with gold theme (#D4AF37)
- **Aspect**: Square or wide rectangular

## Where Your Logo Appears
- Navigation bar (top of all pages)
- Login and signup forms
- Loading screen
- Footer (if applicable)

## Example Configuration

If you add a file called `my-company-logo.png`:

```typescript
export const USE_CUSTOM_LOGO = true;
export const CUSTOM_LOGO_PATH = '/src/assets/my-company-logo.png';
```

That's it! Your logo will replace the current one everywhere in the application.