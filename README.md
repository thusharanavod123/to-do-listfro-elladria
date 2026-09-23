# Elladria Weekly Support Board

A simple seven-day technical support board for Elladria. Employees can add an issue to an hourly time slot, open issues appear red, and resolved issues appear green.

## Use it

Open `index.html` in a browser. No installation or build step is required.

- Use the arrows to view another week.
- Select an empty time slot to add a support request.
- Hover or focus an issue and choose **Mark fixed** to turn it green.
- Entries are saved to Firebase and update live across browsers and devices.

## Host it

Upload `index.html`, `styles.css`, and `app.js` to any static host, such as Netlify, Cloudflare Pages, GitHub Pages, or a normal web server.

## Firebase setup

The board uses Firebase Realtime Database with Anonymous Authentication. The Firebase web configuration is in `firebase-config.js`, and the database rules to publish in Firebase Console are in `firebase.rules.json`. Employees do not see a sign-in screen.
