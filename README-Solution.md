# FeedMe Software Engineer Take Home Assignment - Sharon

## Overview

This is a web application built using **Angular v19** and **Tailwind CSS** for styling.

## Installation

To set up the project locally, follow these steps:

#### 1.Clone the Repository

```sh
git clone https://github.com/sharonyehet/se-take-home-assignment.git
cd se-take-home-assignment
```

#### 2️.Install Dependencies

Ensure you have Node.js installed, then run:

```sh
npm install
```

#### 3️.Start the Development Server

```sh
ng serve
```

Alternately,

```sh
npm run start
```

The application will be available at `http://localhost:4200/`.

## Project Structure

```
/src
  ├── app/               # Main application folder
  ├── helpers/           # Helper functions (including pipes)
  ├── models/            # models & enums
  ├── themes/            # Tailwind themes & utilities
  ├── styles.css         # Global styles (including Tailwind)
```

## Solution

The application includes the following sections:

#### **Customer Actions**

-   **Add new VIP order** - VIP orders take precedence over normal orders and start with a status of `PENDING`.
-   **Add new normal order** - Normal orders queue after VIP orders and start with a status of `PENDING`.

#### **Manager Actions**

-   **Add new bot** - Create a cooking bot available for processing orders.
-   **Reduce bot** - Removes the newest cooking bot. If the bot is processing an order, that order moves back to the front of the queue with a status of `PENDING`, depending on VIP/normal customer priority.

#### **Order Status**

-   **Pending Orders** - Displays all `PENDING` orders in their queue sequence.
-   **Completed Orders** - Displays all orders that have been successfully processed with `COMPLETE` status.

#### **Bots**

-   Displays all available cooking bots with the **order ID** they are processing.
-   If a bot is idle, it will show `IDLE`.
-   A bot takes **10 seconds** to process an order.
-   When a bot starts an order, the status changes to `PROCESSING`, and once complete, it updates to `COMPLETE`.
-   Whenever a bot becomes available, it immediately starts processing the next pending order.

## Technology Concerns

#### Maintainability & Scalability:

The current application supports only two customer types: **Normal** and **VIP**. Orders are managed using separate arrays for each customer type, which raises concerns regarding maintainability and scalability:

-   **Rigid Structure:** If additional customer types (e.g., **Premium**, **Gold**, etc.) are introduced in the future, the current approach would require new arrays for each type, leading to code duplication and increased complexity.
-   **Scalability Issues:** The manual handling of multiple queues makes it harder to extend the system efficiently. A more scalable approach would be to use a **priority-based queue** where orders are stored in a single data structure and dynamically prioritized based on customer type.

#### Memory Leak & Performance Issue:

The use of a subscription to handle order un-processing for each active processing order leads to the creation of multiple subscriptions. This introduces several potential issues:

**1. Memory Leaks:**

-   If subscriptions are not properly unsubscribed when the component is destroyed, they remain active in memory.
-   This can happen because the unsubscription occurs only after an order is un-processed.
-   If some orders complete successfully without needing to be un-processed, their corresponding subscriptions might never be unsubscribed, leading to orphaned subscriptions and memory leaks.

**2. Unintended Multiple Subscriptions:**

-   Each order that enters the "processing" state creates a new independent subscription.
-   If multiple orders are processed at once, this results in multiple active subscriptions, potentially increasing resource consumption and unexpected behavior.
