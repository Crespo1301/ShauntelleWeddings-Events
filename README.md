# Shauntelle Weddings & Events Website

This package contains a fresh 5-page static website concept for:

- Home
- About
- Services
- Gallery
- Contact

## Files included

- `index.html`
- `about.html`
- `services.html`
- `gallery.html`
- `contact.html`
- `styles.css`
- `script.js`

## Local setup

1. Download and unzip the project.
2. Open the folder in VS Code.
3. Install the **Live Server** extension in VS Code.
4. Right click `index.html` and choose **Open with Live Server**.
5. Review all pages and replace placeholder text or contact details as needed.

## Launch option 1: GitHub Pages

Because this is a static site, you can host it with GitHub Pages.

1. Upload all files to the root of your GitHub repo.
2. In GitHub, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/root` folder.
5. Save.
6. GitHub will publish a public site URL.
7. Point your custom domain to GitHub Pages once the build is live.

## Launch option 2: Netlify

1. Create a new site in Netlify.
2. Drag and drop the unzipped folder into Netlify, or connect the GitHub repo.
3. Because this is plain HTML/CSS/JS, no build command is required.
4. Publish the site.
5. Connect the custom domain in Netlify domain settings.

## Before launch checklist

- Replace placeholder inquiry email if needed.
- Replace design placeholder blocks with final wedding photos.
- Confirm exact service wording and pricing structure.
- Add social links.
- Connect the contact form to Formspree, Netlify Forms, or another backend form service.
- Test on desktop and mobile.

## Suggested next steps

1. Add Shauntelle’s real event images.
2. Finalize the About page voice.
3. Wire the form to email.
4. Push to the GitHub repo and preview live.


---

## 15. Thank-You Page

A dedicated `thank-you.html` page is included for successful form submissions.

### Current behavior
The contact form `_next` hidden input is configured to redirect to:

```text
https://shauntelleweddingsandevents.com/thank-you.html
```

### To edit the thank-you experience
Edit:
- `thank-you.html`

Safe things to update:
- heading text
- supporting copy
- follow-up instructions
- button labels and destinations


---

## 16. Photo Albums

The album system is now structured so you can add new event collections quickly.

### Files involved
- `gallery.html`
- `gallery/album-template.html`
- `gallery/Shasta/index.html`

### How to add a new album
1. Duplicate `gallery/album-template.html`
2. Create a new folder like `gallery/New-Album/`
3. Save the duplicated file as `gallery/New-Album/index.html`
4. Update:
   - page title
   - album heading
   - description
   - image paths
   - cover image
5. Add a matching album card to `gallery.html`

### Folder pattern
```text
/gallery/
  album-template.html
  /Shasta/
    index.html
  /Another-Album/
    index.html
```

### Relative path note
Album pages live two folders down, so they use:
- `../../styles.css`
- `../../script.js`
- `../../index.html`

Do not change those unless the folder structure changes.
