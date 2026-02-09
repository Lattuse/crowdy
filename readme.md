# Crowdy — Subscription & Crowdfunding Platform

## Project Overview

**Crowdy** is a web-based subscription platform inspired by services like Patreon and Boosty, but enhanced with a **crowdfunding-based subscription model**.

The platform allows:
- Users to subscribe to creators via paid tiers
- Creators to publish exclusive content (posts with text, images, and videos)
- Creators to launch crowdfunding campaigns
- Funds to be **held by the platform** and released **only if campaign goals are met**
- Automatic refunds if campaigns fail

Unlike traditional platforms where payments are transferred immediately, Crowdy guarantees:
- Refund safety for users
- Content delivery only when funding is secured
- Motivation for creators to deliver content responsibly

The project was developed as a full-stack web application using **MongoDB**, **Node.js (Express)**, and **React**, fulfilling the requirements of the *Advanced Databases (NoSQL)* course.

---

## System Architecture

The system follows a **client–server architecture**:

### Frontend
- **React (Vite)**
- **Tailwind CSS** for UI styling
- **Axios** for HTTP communication
- **JWT-based authentication** (stored in localStorage)

Responsibilities:
- User authentication (login / register)
- Profile management
- Viewing creators, posts, campaigns
- Managing subscriptions and tiers
- Media access via protected API routes

### Backend
- **Node.js + Express**
- **MongoDB Atlas** as the database
- **JWT authentication & role-based authorization**

Responsibilities:
- RESTful API
- Business logic (subscriptions, campaigns, access control)
- Media protection
- Aggregation queries
- Data validation and authorization

### Data Flow
1. Client sends request → REST API
2. Express middleware validates JWT and role
3. MongoDB queries / aggregations are executed
4. Response is returned as JSON
5. Frontend updates UI accordingly

---

## Database Schema Description

The database is named **`crowdy`** and consists of the following collections:

---

### `users`
Stores platform users.  
Uses **embedded subscriptions** for fast access (denormalized cache).

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: "user" | "creator",
  subscriptions: [
    {
      subscriptionId: ObjectId,
      creatorId: ObjectId,
      tierName: String,
      active: Boolean
    }
  ]
}
