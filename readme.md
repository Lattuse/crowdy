# Crowdy - Subscription & Crowdfunding Platform

## Project Overview

**Crowdy** is a web-based subscription platform inspired by services
like Patreon and Boosty, but enhanced with a **crowdfunding-based
subscription model**.

The platform allows: - Users to subscribe to creators via paid tiers -
Creators to publish exclusive content (posts with text, images, and
videos) - Creators to launch crowdfunding campaigns - Funds to be **held
by the platform** and released **only if campaign goals are met** -
Automatic refunds if campaigns fail

Unlike traditional platforms where payments are transferred immediately,
Crowdy guarantees: - Refund safety for users - Content delivery only
when funding is secured - Motivation for creators to deliver content
responsibly

The project was developed as a full-stack web application using
**MongoDB**, **Node.js (Express)**, and **React**.

------------------------------------------------------------------------

## System Architecture

The system follows a **client--server architecture**.

### Frontend

-   **React (Vite)**
-   **Tailwind CSS** for UI styling
-   **Axios** for HTTP communication
-   **JWT-based authentication** (stored in localStorage)

Responsibilities: - User authentication (login / register) - Profile
management - Viewing creators, posts, and campaigns - Managing
subscriptions and tiers - Accessing protected media through API

### Backend

-   **Node.js + Express**
-   **MongoDB Atlas**
-   **JWT authentication & role-based authorization**

Responsibilities: - RESTful API - Business logic (subscriptions,
campaigns, access control) - Media protection - MongoDB aggregation
queries - Validation and authorization middleware

### Data Flow

1.  Client sends HTTP request to REST API
2.  Express middleware validates JWT and user role
3.  MongoDB queries or aggregation pipelines are executed
4.  JSON response is returned to client
5.  Frontend updates UI accordingly

------------------------------------------------------------------------

## Database Schema Description

The database is named **`crowdy`** and contains the following
collections.

### users

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

### tiers

    {
      _id: ObjectId,
      creatorId: ObjectId,
      name: String,
      price: Number,
      perks: [String]
    }

### posts

    {
      _id: ObjectId,
      creatorId: ObjectId,
      title: String,
      body: String,
      minTierName: String,
      images: [String],
      videos: [String],
      createdAt: Date
    }

### campaigns

    {
      _id: ObjectId,
      creatorId: ObjectId,
      title: String,
      description: String,
      targetAmount: Number,
      currentAmount: Number,
      startDate: Date,
      endDate: Date,
      status: "active" | "successful" | "failed"
    }

### subscriptions

    {
      _id: ObjectId,
      userId: ObjectId,
      creatorId: ObjectId,
      campaignId: ObjectId | null,
      tierName: String,
      type: "regular" | "crowdfunding",
      status: "pending" | "active" | "cancelled" | "refunded",
      startDate: Date
    }

### payments

    {
      _id: ObjectId,
      userId: ObjectId,
      subscriptionId: ObjectId,
      campaignId: ObjectId,
      amount: Number,
      paymentDate: Date,
      status: "held" | "released" | "refunded"
    }

------------------------------------------------------------------------

## MongoDB Queries & Aggregations

Example aggregation:

    db.subscriptions.aggregate([
      { $match: { userId: ObjectId("...") } },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator"
        }
      },
      { $unwind: "$creator" },
      {
        $project: {
          tierName: 1,
          status: 1,
          "creator.name": 1
        }
      }
    ]);

------------------------------------------------------------------------

## API Documentation

Base URL:

    /api/v1

Authentication: - POST /auth/register - POST /auth/login

Users: - GET /users/me - PATCH /users/me/role - GET /users/search - GET
/users/:id

Tiers: - POST /tiers - GET /tiers/creator/:creatorId - PATCH
/tiers/:id - DELETE /tiers/:id

Posts: - POST /posts - DELETE /posts/:id

Campaigns: - POST /campaigns - GET /campaigns - GET /campaigns/:id -
POST /campaigns/:id/finish

Subscriptions: - POST /subscriptions - GET /subscriptions/me - PATCH
/subscriptions/:id/cancel

Media: - GET /media/:postId/:filename

------------------------------------------------------------------------

## Indexing and Optimization Strategy

-   Index on users.name for fast profile search
-   Compound indexes on subscriptions (userId, status)
-   Compound indexes on campaigns (creatorId, status)
-   Denormalized embedded subscriptions for fast access
-   Pagination and prefix-based search queries
-   Aggregation pipelines instead of multiple queries

------------------------------------------------------------------------

## Conclusion

Crowdy demonstrates advanced NoSQL data modeling, MongoDB aggregation
usage, secure authentication, and full-stack development.
