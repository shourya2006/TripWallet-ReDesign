# TripWallet — Architecture Diagrams

Welcome to the TripWallet diagrams directory. This folder contains the visual documentation for the TripWallet application's architecture, database design, and system flows following the class-based redesign.

## Live Editable Diagrams

You can view, edit, and export the entire collection of diagrams interactively via Excalidraw:
**[View on Excalidraw](https://excalidraw.com/#json=dl65bLRFbhDIqk1L6ELma,hBHeJVx5erFafUHcXbZqQw)**

---

## 1. UML Component Diagram
**Description:** A macro-level map of the entire system. It traces the data pipeline from the React Client, through the Express server's Routes, Controllers, and Services, all the way down to the MongoDB Database and external APIs (like Unsplash). 
**Use Cases:**
* **System Overview:** Use this when explaining the full stack to stakeholders or new team members.
* **Refactoring/Scaling:** Look at this diagram to understand module dependencies before breaking the monolith into microservices or swapping out front-end components.
* **Deployment Planning:** Helps DevOps understand which external services and internal layers need to be configured for a production environment.

## 2. Class Diagram
**Description:** A detailed blueprint of the backend's Object-Oriented Programming (OOP) structure. It highlights inheritance (like `BaseController` and `BaseService`), method signatures, and the specific Design Patterns (Singleton, Template, Strategy, Factory, Observer, Adapter) used across the system.
**Use Cases:**
* **Developer Onboarding:** Helps new engineers understand the internal API and how to build new features (e.g., seeing that a new service must extend `BaseService`).
* **Code Reviews:** Serves as a reference to ensure new code adheres to the established architectural patterns (like ensuring the `EventBus` is used for side-effects instead of direct service-to-service calls).
* **Adding Features:** If you need to add a new expense splitting method, this diagram shows exactly where the `SplitStrategy` interface lives and how it connects.

## 3. Entity-Relationship Diagram (ERD)
**Description:** Visualizes the MongoDB document schema. It defines the core data entities (`USER`, `TRIP`, `EXPENSE`, `NOTIFICATION`) and maps out their primary/foreign keys and relationships (e.g., One User creates Many Trips; A Trip has Many Expenses).
**Use Cases:**
* **Writing Database Queries:** Keep this open when writing complex Mongoose `populate()` or aggregation pipelines to ensure you are referencing the correct ObjectIds.
* **Data Migrations:** Use this as a map when altering schemas to understand cascading impacts (e.g., what happens to an `EXPENSE` if a `TRIP` is deleted).
* **Feature Scoping:** Quickly verify if the current database structure supports a proposed feature without needing structural changes.

## 4. Sequence Diagram (Create Trip Flow)
**Description:** A step-by-step, time-based visualization of a specific runtime process: a user creating a new trip. It shows the exact chronological interactions between the Client, Router, Controller, Service, Database, EventBus, and External APIs.
**Use Cases:**
* **Debugging:** If the `POST /api/trips` endpoint fails, this diagram helps pinpoint exactly where the breakdown occurred (e.g., did the Unsplash Adapter fail, or did the EventBus drop the notification payload?).
* **Understanding Asynchronous Flows:** Clearly separates the synchronous request/response cycle from the asynchronous background tasks (like the `NotificationFactory` triggering via the `EventBus`).
* **Writing Integration Tests:** Provides a literal checklist of all the steps and mocks required to properly write a test for the trip creation endpoint.
