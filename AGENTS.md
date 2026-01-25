# Agent Instructions for Upgraded Adventure

This repository hosts "Dwarf Orca", a static e-commerce website for bio-engineered aquatic life.

## Project Structure

- **Root**: `/home/madongo/src/upgraded-adventure`
- **Source**: `public/` (This is the deployment root)
  - **HTML**: `*.html` files in `public/` (e.g., `index.html`, `shop.html`)
  - **Assets**: `public/assets/` contains:
    - `app.js`: Core logic (classes, state management).
    - `styles.css`: Global styles and layout.
  - **Data**: `public/data/` contains JSON files driven by the frontend.
- **Resources**: `resources/` contains raw text drafts (not deployed).
- **Workflows**: `.github/workflows/static.yml` handles deployment to GitHub Pages.

## Build and Run

There is no compilation step. The project uses vanilla HTML, CSS, and JavaScript.

### Running Locally
To preview changes, serve the `public/` directory using a simple static server:

```bash
# Python 3
python3 -m http.server 8000 -d public
# OR PHP
php -S localhost:8000 -t public
```

Access the site at `http://localhost:8000`.

### Deployment
Deployment is automated via GitHub Actions on push to `main`. The `public/` folder is deployed to GitHub Pages.

## Testing

There are currently **no automated tests** (Jest, Cypress, etc.).
- **Manual Verification**: Open the affected pages in a browser.
- **Critical Flows**:
  - **Cart**: Add items, adjust quantity, remove items. Check persistence after refresh.
  - **Checkout**: Open modal, simulated "success" state.
  - **Auth**: Login (creates local user), Profile update, Logout.
  - **Data Loading**: Verify products and testimonials load from JSON.

## Code Style & Conventions

### JavaScript (`public/assets/app.js`)
- **Paradigm**: Object-Oriented. Logic is encapsulated in Classes.
- **Key Classes**:
  - `LayoutManager`: Injects Header, Footer, and Modals into DOM.
  - `ShoppingCart`: Manages cart state (localStorage), products list, and cart UI.
  - `AuthManager`: Handles simulated login/registration and profile updates.
  - `TestimonialManager` & `FAQManager`: Fetch and render content from JSON.
- **Syntax**: ES6+ (Classes, async/await, arrow functions, template literals).
- **DOM Manipulation**: Use `document.getElementById` and `innerHTML` for rendering components.
- **State Persistence**: `localStorage` keys: `dwarforca_cart`, `dwarforca_users`, `dwarforca_current_user`.
- **Formatting**:
  - Indentation: **2 spaces**.
  - Semicolons: **Yes**.
  - Quotes: Single quotes `'` preferred.
- **Naming**: PascalCase for Classes, camelCase for methods/variables.

### CSS (`public/assets/styles.css`)
- **Theming**: Use the following CSS variables defined in `:root`:
  - `--bg`: `#f7fafc` (Background)
  - `--muted`: `#64748b` (Secondary text)
  - `--accent`: `#0ea5a4` (Primary brand color)
  - `--accent-dark`: `#0d9a99` (Hover states)
  - `--error`: `#dc2626` (Alerts/Badges)
  - `--max-width`: `1024px` (Container width)
- **Layout**: Flexbox for components, Grid for product lists (`.products-grid`).
- **Formatting**: Minimal whitespace, concise rules.

### HTML
- **Templates**: Common elements (Header, Footer, Modals) are injected via `LayoutManager`.
- **Data Attributes**: Use `data-id` for product/cart actions and `data-category` for filtering.
- **Ids**: Ensure strict ID matching with `app.js` (e.g., `productsGrid`, `cartBtn`, `loginForm`).

## Data Models (`public/data/`)

### Inventory (`inventory.json`)
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "price": 14.99,
      "image": "🐋", // Emoji or URL
      "description": "Short text",
      "stock": 10,
      "category": "Merchandise", // Used for filtering
      "specs": "Optional specs string",
      "leadTime": "Optional string"
    }
  ]
}
```

### Testimonials (`testimonials.json`)
```json
{
  "testimonials": [
    {
      "id": 1,
      "name": "User Name",
      "location": "City, Country",
      "avatar": "👨‍💻",
      "stars": 5,
      "date": "YYYY-MM-DD",
      "title": "Review Title",
      "text": "Review content..."
    }
  ]
}
```

## Development Workflow

1.  **Analyze**: Check `public/assets/app.js` to understand which Class handles the logic you are modifying.
2.  **Edit**: Modify HTML, CSS, or JS directly.
    - If adding a page, ensure `LayoutManager.initHeader` recognizes it for navigation highlighting.
    - If modifying data, edit the JSON files in `public/data/`.
3.  **Verify**: Serve locally (`python3 -m http.server`) and test the flow.
4.  **Commit**: No build artifacts to commit (except source files).

## Common Tasks

- **Adding a Product**: Add an entry to `public/data/inventory.json`. ensure unique ID.
- **Changing Navigation**: Update `LayoutManager.initHeader()` in `app.js`.
- **Styling**: Add rules to `styles.css` using existing variables.
- **New Feature**: Create a new Class in `app.js` and instantiate it in `document.addEventListener('DOMContentLoaded', ...)` at the bottom of the file.

## Future Considerations
- If adding complex logic, consider introducing a build tool (Vite/Webpack) but only if requested.
- If adding tests, setup Jest/Playwright, but currently keep it lightweight.
- Consider refactoring `LayoutManager` to a static site generator if the page count grows significantly.
