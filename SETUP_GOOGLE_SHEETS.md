# ZALVRA Store — Google Sheets Database Setup

## Step 1: Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new spreadsheet**
2. Rename the first tab to **Products**
3. Create a second tab named **Orders**

### Products sheet — headers in row 1:
```
id | name | price | oldPrice | cat | emoji | rating | desc | images
```
(`images` = pipe-separated ImgBB URLs, e.g. `https://i.ibb.co/a.jpg|https://i.ibb.co/b.jpg`)

### Orders sheet — headers in row 1:
```
id | date | name | email | phone | address | payment | product | emoji | qty | total | status
```

(You can leave the sheets empty — the script will create headers automatically if missing.)

### Product images
- Upload images in **Admin → Products → Add/Edit** (uses ImgBB API)
- Multiple images per product are supported (gallery on the product page)
- Re-deploy the Apps Script after updating if you already deployed an older version

---

## Step 2: Add the Apps Script

1. In your Google Sheet: **Extensions → Apps Script**
2. Delete any default code
3. Open the file `GoogleAppsScript.js` from this package and **paste all of it**
4. Click **Save** (disk icon) and name the project e.g. `ZALVRA API`

---

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon → choose **Web app**
3. Settings:
   - **Description:** ZALVRA Store API
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Authorize the app when prompted (Review permissions → Allow)
6. **Copy the Web App URL**  
   It looks like: `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4: Connect to Admin Portal

1. Open `admin.html` in your browser
2. Login with password: `admin123`
3. Paste the Web App URL in **Google Sheets Database**
4. Click **Save URL** then **Test Connection**
5. You should see “Connected to Google Sheets”

---

## What syncs

| Action | Where |
|--------|--------|
| Place order on store | → Orders sheet |
| Add / Edit / Delete product in admin | → Products sheet |
| Update order status / Delete order | → Orders sheet |
| Store homepage products | Loaded from Products sheet (or local if offline) |

---

## Notes

- Works **without** Google Sheets too (localStorage only)
- If the Script URL is empty, everything stays local
- Re-deploy the script after any code changes (Deploy → Manage deployments → Edit → New version)
- Store and Admin must be opened from the same origin for localStorage sharing, or use the Sheet as the shared database
