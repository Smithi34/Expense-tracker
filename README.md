# Hostel Ledger — Expense Tracker

A simple, beginner-friendly expense tracker built for an engineering student living in a hostel. Log daily expenses, set a monthly budget, and see where your money is going — all in the browser, no sign-up required.

## Features

- Set and update a monthly budget
- Add expenses with name, amount, category, date, and an optional description
- Automatic totals: amount spent, remaining budget, number of entries
- Category-wise spending breakdown
- Search expenses by name or description
- Filter expenses by category and by month
- Budget progress bar with warnings at 75%, 90%, and 100% of budget used
- Delete any expense entry
- Data is saved automatically in the browser's local storage — it's still there after you refresh the page

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (no frameworks or libraries)
- Browser `localStorage` for data persistence

No backend, server, or database — this is a fully client-side app.

## Project Structure

```
expense-tracker/
├── index.html   # page structure
├── style.css    # styling
├── script.js    # app logic
└── README.md
```

## Getting Started

1. Clone or download this repository.
2. Open `index.html` directly in your browser — no build step or server needed.
   - Or, for a smoother dev experience, open the folder in VS Code and use the **Live Server** extension.

That's it. Set a budget, start adding expenses, and the dashboard updates automatically.

## Notes

- All data is stored only in your browser's local storage on this device. Clearing your browser's site data, or opening the app in a different browser/device, will not carry your data over.
- Categories included: Food / Mess, Travel, College / Study, Hostel, Mobile / Internet, Entertainment, Shopping, Medical, Other.

## License

Free to use and modify for personal or educational purposes.
