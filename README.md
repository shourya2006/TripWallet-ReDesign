# Trip Wallet

Trip Wallet is a comprehensive expense-splitting application that allows users to seamlessly manage shared trip expenses, settle debts, and organize travel participants.

## Architecture Redesign

The project is currently undergoing a structural migration to a robust **Class-Based TypeScript Architecture**. This redesign introduces strict typing and professional software design patterns to ensure the codebase remains scalable, modular, and easy to maintain.

### Design Patterns Implemented:

- **Singleton Pattern:** Used for the `Database` and `EventBus` to ensure single, globally accessible instances for database connections and event management.
- **Template Method Pattern:** Established through `BaseService` and `BaseController` classes, standardizing the execution core for all CRUD and RESTful request-handling tasks.
- **Strategy Pattern:** Utilized in the Expense engine (`SplitStrategy`) to seamlessly swap between different logic (e.g., `EqualSplitStrategy`, `PercentageSplitStrategy`, `CustomSplitStrategy`).
- **Factory Pattern:** Used by the `NotificationFactory` to cleanly instantiate various types of notifications (like Trip Invites) without cluttering business logic.
- **Observer Pattern:** Handled via the `EventBus` and `TripObserver`, elegantly decoupling trip creation/deletion events from side-effects like sending notifications.
- **Adapter Pattern:** Shown in `ImageProviderAdapter` and `UnsplashAdapter`, creating a standard interface for external image fetching to protect local code from third-party API changes.

## 🛠️ Technology Stack

- **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB)
- **Frontend:** React (Vite), JavaScript/JSX, TailwindCSS
- **Authentication:** JWT (JSON Web Tokens) with refresh mechanisms.

## 📁 Project Structure

```
SubSplit/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API integration singletons
│   │   ├── context/        # React context (Auth)
│   │   └── pages/          # Full page views
├── server/                 # Express Backend 
│   ├── database/           # MongoDB Singleton connection
│   ├── controllers/        # Class-based route handlers
│   ├── services/           # Core business logic
│   ├── strategies/         # Expense splitting algorithms
│   ├── events/             # Observer pattern items
│   ├── adapters/           # Third-party integrations
│   ├── factories/          # Object creation logic
│   ├── models/             # Mongoose MDB schemas
│   └── server.ts           # Primary TS entry point
```

## ⚙️ Running Locally

**Prerequisites:** Node.js and MongoDB instance.

1. **Install Dependencies:**

   ```bash
   # From the root, install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
2. **Environment Variables:**

   - In `server/.env`, set `MONGO_URI`, `JWT_SECRET`, `REFRESH_SECRET`, and `PORT` (usually 3001).
   - In `client/.env`, set `VITE_API_URL` to point to your local server (e.g., `http://localhost:3001`).
3. **Start the Application:**

   - **Backend:** Inside `/server`, run `npm run dev` to start the TS-Node server.
   - **Frontend:** Inside `/client`, run `npm run dev` to spin up Vite.
