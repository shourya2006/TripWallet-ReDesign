# Project Diagrams

This directory contains visual representations of the SubSplit (Trip Wallet) system architecture and data models. These diagrams are essential for understanding the overall structure, design patterns, and database relationships of the application.

### 🔗 Excalidraw Board
**[View All Diagrams on Excalidraw](https://excalidraw.com/#json=dl65bLRFbhDIqk1L6ELma,hBHeJVx5erFafUHcXbZqQw)**

---

## 1. Architecture Class Diagram

### Overview
This diagram illustrates the new class-based TypeScript structure of the backend application. It details the various layers (Controllers, Services) and the specific Gang of Four (GoF) design patterns implemented to ensure a scalable and maintainable codebase.

### Key Components & Patterns Included:
- **Singleton:** `Database` and `EventBus`
- **Template Method:** `BaseController` and `BaseService`
- **Strategy:** Expense splitting logic (`EqualSplitStrategy`, `PercentageSplitStrategy`, etc.)
- **Factory:** Notification creation (`NotificationFactory`)
- **Observer:** Event handling (`TripObserver`, `EventBus`)
- **Adapter:** External API integration (`ImageProviderAdapter`, `UnsplashAdapter`)

### Use Cases:
- **Developer Onboarding:** Provides a high-level map of the backend services, making it easier for new contributors to understand the codebase.
- **Refactoring Guide:** Acts as the blueprint for migrating legacy procedural JavaScript code into the structured, object-oriented TypeScript design.
- **Feature Extension:** Helps developers determine where to inject new features (e.g., adding a new `SplitStrategy` without modifying existing core logic).

---

## 2. Entity-Relationship Diagram (ERD)

### Overview
The ERD visualizes the MongoDB database schema, showcasing the core entities and how they reference one another via Mongoose `ObjectId` mapping.

### Key Entities:
- **User:** The core account entity.
- **Trip:** An event/trip created by a User, involving multiple participant Users.
- **Expense:** Individual cost items associated with a specific Trip and paid by a specific user.
- **Notification:** Actionable alerts (e.g., Trip Invites) sent between users.

### Use Cases:
- **Database Architecture:** Helps backend engineers understand how collections are structured and linked.
- **Query Construction:** Assists in visualizing `populate()` chains needed when fetching deeply nested data (e.g., Trip -> Expenses -> PaidBy User).
- **Data Integrity:** Clearly outlines required relationships and structural expectations for documents stored in the database.
