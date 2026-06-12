# Master Sheet Setup

Use one Google Sheet as the dashboard source. Registration, education judging, and sports judging can stay in their own sheets; the Master Sheet imports their cleaned data.

## Steps

1. Create a new Google Sheet called `Ijtima Dashboard Master`.
2. Open `Extensions > Apps Script`.
3. Paste the contents of `MASTER_SHEET_APPS_SCRIPT.js`.
4. Replace these constants at the top:

```javascript
const REGISTRATION_SHEET_ID = "PASTE_REGISTRATION_FORM_RESPONSE_SHEET_ID";
const EDUCATION_RESULTS_SHEET_ID = "PASTE_EDUCATION_RESULTS_SHEET_ID";
const SPORTS_RESULTS_SHEET_ID = "PASTE_SPORTS_RESULTS_SHEET_ID";
```

5. Run:

```javascript
setupMasterDashboardSheet()
```

6. Approve the `IMPORTRANGE` permissions inside the Master Sheet if Google asks.
7. Put the Master Sheet ID in `.env`:

```text
GOOGLE_SPREADSHEET_ID=your_master_sheet_id
```

## Expected External Sheet Shapes

Registration form response sheet should expose:

```text
Col2 = member code
Col3 = name
Col4 = halqa
```

Education and sports result sheets should each have a `Results` tab:

```text
category | competition | position | name | halqa | points
```

The dashboard reads only the Master Sheet tabs:

```text
Users
Schedule
Announcements
Members
Attendance
Competition Results
Halqa Rankings
```
