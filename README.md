# Car Wash Manager - Web Dashboard

This is the web dashboard for viewing daily checklists submitted by staff.

## Features
- **Login**: Secure login for admins (uses the same users as the backend).
- **Dashboard**: View a list of all submitted daily checklists with progress status.
- **Detail View**: Inspect the detailed status of every task in a checklist, including missed times.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    The API URL is configured in `.env`. Default is:
    ```
    VITE_API_URL=http://localhost:3001/api/v1
    ```
    Change this if your backend is running elsewhere.

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure
- `src/context/AuthContext.jsx`: Handles user authentication state.
- `src/pages/Dashboard.jsx`: Main view listing all checklists.
- `src/pages/ChecklistDetail.jsx`: Detailed view of a specific checklist.
- `src/pages/Login.jsx`: Login screen.
- `src/components/Layout.jsx`: Main application layout with navigation.
