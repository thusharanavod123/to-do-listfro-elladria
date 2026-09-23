# Elladria Weekly Support Board

A simple seven-day technical support board for Elladria. Employees can add an issue to an hourly time slot, open issues appear red, and resolved issues appear green.

## Use it

Open `index.html` in a browser. No installation or build step is required.

- Use the arrows to view another week.
- Select an empty time slot to add a support request.
- Hover or focus an issue and choose **Mark fixed** to turn it green.
- Entries are saved automatically in the browser.

## Host it

Upload `index.html`, `styles.css`, and `app.js` to any static host, such as Netlify, Cloudflare Pages, GitHub Pages, or a normal web server.

## Data note

This no-backend version stores entries in `localStorage`. Entries persist on the same browser and device, but are not shared between different computers or phones. Sharing one live board between employees requires a small backend/database (for example Supabase or Firebase); the interface can remain exactly the same and still require no employee sign-in.
