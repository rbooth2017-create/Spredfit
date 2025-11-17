# SPREDfit Logo Files

## Logo Location

The SPREDfit logo (white "S" shape on transparent background) is available in the following locations:

### Public Folder
- `/public/logo.png` - Standard logo file
- `/public/logo-large.png` - Large version of logo

### Icons Folder
All PWA icons in `/public/icons/` also contain the logo:
- icon-72x72.png through icon-512x512.png
- apple-touch-icon.png
- favicon.ico

## Usage

### In React Components
```tsx
// Import from project assets
import logo from "figma:asset/acd126c619660e3932cb554ee937e18cc6986211.png";

// Or reference from public folder
<img src="/logo.png" alt="SPREDfit Logo" />
```

### In HTML/Static Files
```html
<img src="/logo.png" alt="SPREDfit Logo" />
```

### In CSS
```css
background-image: url('/logo.png');
```

## Logo Specifications

- **Format**: PNG with transparency
- **Design**: White "S" shaped logo with rounded corners
- **Background**: Transparent (appears white on light backgrounds)
- **Usage**: Brand identity, PWA icons, splash screens, navigation

## Design Guidelines

The SPREDfit logo should:
- Be displayed on contrasting backgrounds for visibility
- Maintain its aspect ratio (do not stretch)
- Have adequate padding/spacing around it
- Be used consistently across all app touchpoints

## Current App Usage

The logo is currently used in:
✅ PWA app icons (all sizes)
✅ iOS home screen icons
✅ Browser favicon
✅ Dashboard header (via figma:asset import)
✅ Public folder for general use
