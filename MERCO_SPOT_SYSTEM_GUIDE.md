# 🍹 Merco Spot Bar - System User Guide

Welcome to the Merco Spot Bar Management System! This document will guide both **Super Admins (Owners)** and **Managers (Cashiers)** on how to use the web application for daily operations, sales tracking, and inventory management.

## 🔗 Accessing the System
1. **Website URL:** `https://merco-spot-bar.vercel.app/`
2. **Login:** Enter the Email and Password assigned to you. The system will automatically detect your role and send you to the correct dashboard.

---

## 👑 SECTION 1: SUPER ADMIN GUIDE (Owners)
As a Super Admin, you have full control over the finances, inventory, and staff.

### 1. The Admin Dashboard
When you log in, you will be taken to `/admin/dashboard`. 
* You will see live, real-time statistics including **Total Sales**, **Cash on Hand**, and overall **Stock Value**.
* The page updates automatically. If a manager records a sale, your dashboard will reflect the change instantly.

### 2. Adding & Managing Managers
Because you hold the master keys, only you can hire and create accounts for new staff.
1. Navigate to the **Users** or **Team Management** section in your dashboard.
2. Fill out the new employee's details: **Full Name**, **Email**, and a secure **Password**.
3. Ensure their Role is set to `manager`.
4. Submit the form. Now, the manager can log in using that email and password.

### 3. Managing Inventory & Stock
The system handles unit prices and packet/crate prices automatically.
* **Adding Stock:** When you buy new drinks (e.g., 5 crates of Skol), go to your Inventory section and increase the "Stock Units".
* **Pricing Check:** Ensure `Price Per Unit` (1 bottle) and `Price Per Packet` (Full crate) are accurately set in RWF.
* **Low Stock Alerts:** The system will flag items that drop below their "Minimum Stock Threshold". Keep an eye on this to know what to restock.

### 4. Financial Reports
* Check the **Reports** tab to review historical sales.
* You can audit all point-of-sale transactions completed by your managers to ensure the physical cash matches the system cash.

---

## 🧑‍💼 SECTION 2: MANAGER GUIDE (Cashiers / Bartenders)
As a Manager, your primary job is to operate the Point of Sale (POS), ring up customers, and track daily shift sales.

### 1. The Manager Dashboard
When you log in, you are greeted by the Manager Dashboard (`/manager/dashboard`).
* You will see a quick summary of **Your Shift's Sales** and basic inventory highlights.

### 2. Using the POS (Point of Sale) to Record Sales
To ring up a customer, click on **"Record Sale"** or go to the **POS** screen.

**Step-by-Step Sale:**
1. **Select a Table:** At the top right, select where the customer is sitting (Table 1, Bar, VIP, etc.).
2. **Find Drinks:** 
   * Click through the category buttons (e.g., *Beers (Local)*, *Soft Drinks*, *Spirits*) to easily browse.
   * Or, use the **Search bar** at the top to type a drink's name.
3. **Add Items to the Cart:**
   * **Unit Sale:** Click **"Add 1 Unit"** (e.g., selling 1 single bottle of Fanta).
   * **Packet Sale:** If they buy a whole crate or full bottle, click **"Add 1 Pack"**. 
   * *Watch the warnings: If a stock is highlighted in red, it means the bar is almost out of that drink!*
4. **Review the Order:** Look at the "Current Order" ticket on the right side of the screen. You can adjust quantities by clicking the `-` or `+` or removing an item if you made a mistake.
5. **Confirm Checkout:** Once the customer gives you the cash, click the big green **"Confirm & Send Order"** button.
   * *This will log the total RWF amount and immediately deduct the exact sold items from the bar's available stock.*

### 3. Ending Your Shift
1. Do a quick check to ensure all your tables are cleared out and paid.
2. In the top right corner of the navigation bar, click the **Logout** button.
3. **Never leave your account logged in** when you leave the computer, so other people do not ring up sales under your name!

---

### 🆘 Common Troubleshooting
* **Wrong Sale Entered?** If a manager enters a sale by mistake, they cannot delete it themselves (for security). Tell the Super Admin so they can correct the financial record and refund the stock.
* **Can't log in?** Ensure there are no hidden spaces after your email when typing it in. Both email and passwords are case-sensitive.
