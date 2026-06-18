# 🛰️ Postman API Collection & Environment Guide

Welcome to the Postman API Documentation for the **War Economic Impact Analytics Portal**. This guide provides step-by-step instructions on importing the collection, setting up environments (Local vs. Production), utilizing automated auth tokens, and performing full API testing.

---

## 📋 Table of Contents
1. [Quick Start Guide](#-quick-start-guide)
2. [Environments Setup](#-environments-setup)
3. [Automated Authentication Flow](#-automated-authentication-flow)
4. [API Endpoint Reference](#-api-endpoint-reference)
   - [Diagnostics](#1-diagnostics)
   - [Authentication](#2-authentication)
   - [Conflicts CRUD](#3-conflicts-crud)
   - [Analytics & Statistics](#4-analytics--statistics)
5. [Error Response Dictionary](#-error-response-dictionary)

---

## ⚡ Quick Start Guide

To start testing the API, follow these three steps:

### 1. Import the Collection & Environments
1. Open Postman.
2. Click the **Import** button in the top-left corner.
3. Drag and drop the following files from your local repository:
   - Collection file: [`postman_collection.json`](file:///c:/Users/rishi/OneDrive/Desktop/war_economic_impact_dataset_rishikesh_singh/backend/src/docs/postman_collection.json)
   - Local Environment template: [`war_economic_impact_local.postman_environment.json`](file:///c:/Users/rishi/OneDrive/Desktop/war_economic_impact_dataset_rishikesh_singh/backend/src/docs/war_economic_impact_local.postman_environment.json)
   - Production Environment template: [`war_economic_impact_prod.postman_environment.json`](file:///c:/Users/rishi/OneDrive/Desktop/war_economic_impact_dataset_rishikesh_singh/backend/src/docs/war_economic_impact_prod.postman_environment.json)

### 2. Select Your Active Environment
In the top-right corner of Postman, select either **War Economic Impact - Local** or **War Economic Impact - Production** from the environment dropdown.

### 3. Run Your First Request
Expand the **Diagnostics** folder in the collection and click **Health Status** -> **Send**. You should receive a `200 OK` status with `status: "UP"` showing that the system is ready and connected to MongoDB!

---

## 🌐 Environments Setup

The variables in this collection are parameterized to make switching target systems seamless:

| Variable | Description | Local Environment Value | Production Environment Value |
|---|---|---|---|
| `base_url` | Base URL of the API server | `http://localhost:5050` | `https://war-economic-impact-dataset-rishikesh.onrender.com` |
| `jwt_token` | JSON Web Token (JWT) used for authenticated endpoints | *Automatically populated* | *Automatically populated* |
| `conflict_id` | MongoDB `_id` of a specific conflict document | *Set manually or dynamically* | *Set manually or dynamically* |

> [!TIP]
> Always verify that your active environment matches the backend server you are currently testing. Local development requires you to have the backend running (`npm run dev`) on port `5050`.

---

## 🔑 Automated Authentication Flow

Writing JWT tokens by hand or copy-pasting them into header fields is tedious. This collection automates token storage:

Both **Register User** and **Login User** requests contain a Postman **Test Script**:

```javascript
const jsonData = pm.response.json();
if (jsonData.success && jsonData.data && jsonData.data.token) {
    pm.environment.set("jwt_token", jsonData.data.token);
}
```

### How it works:
1. You run **Register** or **Login**.
2. On successful authentication, the script extracts the JWT token from the JSON body.
3. The token is dynamically saved in the active environment's `jwt_token` variable.
4. Subsequent protected routes automatically load the token using the `Authorization: Bearer {{jwt_token}}` header configuration.

---

## 🔌 API Endpoint Reference

### 1. Diagnostics
Basic status checks to verify API health and deployment versions.

#### 🟢 Health Status
- **Method:** `GET`
- **Path:** `/health`
- **Access:** Public
- **Headers:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "API Health Check",
  "data": {
    "status": "UP",
    "timestamp": "2026-06-17T17:15:30.000Z",
    "dbStatus": "connected"
  }
}
```

#### 🟢 API Version
- **Method:** `GET`
- **Path:** `/version`
- **Access:** Public
- **Headers:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "API version details retrieved",
  "data": {
    "version": "1.0.0",
    "name": "war-economic-impact-api",
    "environment": "development"
  }
}
```

---

### 2. Authentication
User identity management and role authorization.

#### 🟢 Register User
- **Method:** `POST`
- **Path:** `/auth/register`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Student Dev",
  "email": "student.dev@example.com",
  "password": "securedpassword123",
  "role": "admin"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64ac1bcf8912ef543a6d1010",
      "name": "Student Dev",
      "email": "student.dev@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
*(Sets `{{jwt_token}}` environment variable)*

#### 🟢 Login User
- **Method:** `POST`
- **Path:** `/auth/login`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "student.dev@example.com",
  "password": "securedpassword123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "64ac1bcf8912ef543a6d1010",
      "name": "Student Dev",
      "email": "student.dev@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
*(Sets `{{jwt_token}}` environment variable)*

#### 🔒 Get Profile Info (Me)
- **Method:** `GET`
- **Path:** `/auth/me`
- **Access:** Private (Requires authenticated User/Admin JWT)
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "64ac1bcf8912ef543a6d1010",
    "name": "Student Dev",
    "email": "student.dev@example.com",
    "role": "admin",
    "createdAt": "2026-06-17T17:10:00.000Z"
  }
}
```

#### 🔒 Logout User
- **Method:** `POST`
- **Path:** `/auth/logout`
- **Access:** Private (Requires authenticated User/Admin JWT)
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### 3. Conflicts CRUD
Core conflict data operations. Public routes read data, while write/delete routes require specific authorization roles.

#### 🟢 Get All Conflicts
- **Method:** `GET`
- **Path:** `/conflicts`
- **Access:** Public
- **Query Parameters:**
  - `page`: Page index (default: `1`)
  - `limit`: Page records count (default: `10`, max `100`)
  - `search`: Keyword string (matches name, country, sector descriptions)
  - `region`: Filter by geographic region (exact match)
  - `status`: Filter by status (`Ongoing` / `Resolved`)
  - `type`: Filter by type (e.g., `Civil War`, `Interstate War`)
  - `sort`: Sorting field (prefix with `-` for descending)
- **Example Request:** `/conflicts?page=1&limit=2&region=Middle East&sort=-warCostUsd`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Conflicts retrieved successfully",
  "data": [
    {
      "_id": "64ac2bcf8912ef543a6d1112",
      "conflictName": "Gulf War II",
      "conflictType": "Interstate War",
      "region": "Middle East",
      "startYear": 2003,
      "endYear": 2011,
      "status": "Resolved",
      "primaryCountry": "Iraq",
      "gdpChange": -15.5,
      "inflationRate": 45.2,
      "warCostUsd": 250000000000,
      "reconstructionCostUsd": 120000000000
    }
  ],
  "metadata": {
    "currentPage": 1,
    "totalPages": 8,
    "totalCount": 15,
    "limit": 2
  }
}
```

#### 🟢 Get Conflict By ID
- **Method:** `GET`
- **Path:** `/conflicts/{{conflict_id}}`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Conflict retrieved successfully",
  "data": {
    "_id": "64ac2bcf8912ef543a6d1112",
    "conflictName": "Gulf War II",
    "conflictType": "Interstate War",
    "region": "Middle East",
    "startYear": 2003,
    "endYear": 2011,
    "status": "Resolved",
    "primaryCountry": "Iraq",
    "preWarUnemployment": 10,
    "duringWarUnemployment": 28,
    "unemploymentSpike": 18,
    "mostAffectedSector": "Energy",
    "youthUnemploymentChange": 20,
    "preWarPovertyRate": 15,
    "duringWarPovertyRate": 35,
    "extremePovertyRate": 18,
    "foodInsecurityRate": 25,
    "householdsFallenIntoPoverty": 10500,
    "gdpChange": -15.5,
    "inflationRate": 45.2,
    "currencyDevaluation": 60.1,
    "warCostUsd": 250000000000,
    "reconstructionCostUsd": 120000000000,
    "informalEconomyPreWar": 22,
    "informalEconomyDuringWar": 48,
    "blackMarketActivityLevel": "High",
    "primaryBlackMarketGoods": "weapons, fuel",
    "currencyBlackMarketGap": 18.5,
    "warProfiteeringDocumented": true
  }
}
```

#### 🔒 Create Conflict
- **Method:** `POST`
- **Path:** `/conflicts`
- **Access:** Private (Requires authenticated User/Admin JWT)
- **Headers:** `Authorization: Bearer {{jwt_token}}`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "conflictName": "Gulf War II",
  "conflictType": "Interstate War",
  "region": "Middle East",
  "startYear": 2003,
  "endYear": 2011,
  "status": "Resolved",
  "primaryCountry": "Iraq",
  "gdpChange": -15.5,
  "inflationRate": 45.2,
  "warCostUsd": 250000000000,
  "reconstructionCostUsd": 120000000000,
  "preWarUnemployment": 10,
  "duringWarUnemployment": 28,
  "unemploymentSpike": 18,
  "mostAffectedSector": "Energy",
  "youthUnemploymentChange": 20,
  "preWarPovertyRate": 15,
  "duringWarPovertyRate": 35,
  "extremePovertyRate": 18,
  "foodInsecurityRate": 25,
  "householdsFallenIntoPoverty": 10500,
  "currencyDevaluation": 60.1,
  "informalEconomyPreWar": 22,
  "informalEconomyDuringWar": 48,
  "blackMarketActivityLevel": "High",
  "primaryBlackMarketGoods": "weapons, fuel",
  "currencyBlackMarketGap": 18.5,
  "warProfiteeringDocumented": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Conflict record created successfully",
  "data": {
    "_id": "64ac2bcf8912ef543a6d1112",
    "conflictName": "Gulf War II",
    "conflictType": "Interstate War",
    ...
  }
}
```

#### 🔒 Update Conflict (Partial / PATCH)
- **Method:** `PATCH`
- **Path:** `/conflicts/{{conflict_id}}`
- **Access:** Private (Requires authenticated User/Admin JWT)
- **Headers:** `Authorization: Bearer {{jwt_token}}`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "status": "Ongoing",
  "endYear": 2028
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Conflict record updated successfully",
  "data": {
    "_id": "64ac2bcf8912ef543a6d1112",
    "conflictName": "Gulf War II",
    "status": "Ongoing",
    "endYear": 2028,
    ...
  }
}
```

#### 🔒 Delete Conflict
- **Method:** `DELETE`
- **Path:** `/conflicts/{{conflict_id}}`
- **Access:** Private - Admin Only (Requires admin role JWT)
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Conflict record permanently deleted"
}
```

---

### 4. Analytics & Statistics
Custom endpoints aggregating conflict research data to power charts and summary cards.

#### 🟢 Stats Overview
- **Method:** `GET`
- **Path:** `/conflicts/stats/overview`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Overview statistics compiled",
  "data": {
    "totalConflicts": 42,
    "totalWarCostUsd": 2187640000000,
    "averageInflationRate": 34.62,
    "averageGdpChange": -12.45,
    "resolvedCount": 38,
    "ongoingCount": 4
  }
}
```

#### 🟢 Highest Inflation Case
- **Method:** `GET`
- **Path:** `/conflicts/stats/highest-inflation`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Highest inflation record retrieved",
  "data": {
    "conflictName": "Zimbabwe Land Reform Conflict",
    "primaryCountry": "Zimbabwe",
    "inflationRate": 231000000
  }
}
```

#### 🟢 Lowest GDP Case
- **Method:** `GET`
- **Path:** `/conflicts/stats/lowest-gdp`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Lowest GDP change record retrieved",
  "data": {
    "conflictName": "Syrian Civil War",
    "primaryCountry": "Syria",
    "gdpChange": -65
  }
}
```

#### 🟢 Highest War Cost Case
- **Method:** `GET`
- **Path:** `/conflicts/stats/highest-warcost`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Highest war cost record retrieved",
  "data": {
    "conflictName": "World War II",
    "primaryCountry": "Global Alliance",
    "warCostUsd": 4100000000000
  }
}
```

#### 🟢 Highest Reconstruction Cost Case
- **Method:** `GET`
- **Path:** `/conflicts/stats/highest-reconstruction`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Highest reconstruction cost record retrieved",
  "data": {
    "conflictName": "Iraq War",
    "primaryCountry": "Iraq",
    "reconstructionCostUsd": 350000000000
  }
}
```

#### 🟢 Region Distribution
- **Method:** `GET`
- **Path:** `/conflicts/stats/region-distribution`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Region distribution retrieved",
  "data": [
    { "_id": "Middle East", "count": 12 },
    { "_id": "Europe", "count": 8 },
    { "_id": "Africa", "count": 14 }
  ]
}
```

#### 🟢 Conflict Type Distribution
- **Method:** `GET`
- **Path:** `/conflicts/stats/type-distribution`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Conflict type distribution retrieved",
  "data": [
    { "_id": "Civil War", "count": 18 },
    { "_id": "Interstate War", "count": 15 },
    { "_id": "Asymmetric War", "count": 9 }
  ]
}
```

#### 🟢 War Cost By Region
- **Method:** `GET`
- **Path:** `/conflicts/stats/warcost-by-region`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "War cost aggregate by region compiled",
  "data": [
    {
      "region": "Middle East",
      "totalCost": 985000000000,
      "averageCost": 82083333333,
      "count": 12
    }
  ]
}
```

#### 🟢 Inflation By Region
- **Method:** `GET`
- **Path:** `/conflicts/stats/inflation-by-region`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Inflation aggregate by region compiled",
  "data": [
    {
      "region": "Europe",
      "avgInflation": 12.8,
      "maxInflation": 48.5,
      "minInflation": 2.1
    }
  ]
}
```

---

## 🚫 Error Response Dictionary

All failures return a standard structural error format with descriptive messages:

```json
{
  "success": false,
  "message": "Detailed error context message",
  "stack": "Only populated in development environments"
}
```

### Common HTTP Status Code Mappings:

#### `400 Bad Request`
Input validation errors.
- **Example Cause:** Sending `startYear` greater than `endYear`, missing mandatory fields during conflict creation, or sending an invalid enum value (e.g. invalid `status`).
- **Example Response:**
```json
{
  "success": false,
  "message": "Validation Error: Name is required and must be a valid string., A valid email address is required."
}
```

#### `401 Unauthorized`
Authentication credential check failure.
- **Example Cause:** Sending requests to protected endpoints without the `Authorization` header, or supplying an expired/tampered JWT.
- **Example Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

#### `403 Forbidden`
Access role authorization check failure.
- **Example Cause:** Attempting to **Delete** a conflict document using a regular `user` role JWT instead of an `admin` role.
- **Example Response:**
```json
{
  "success": false,
  "message": "User role (user) is not authorized to access this route"
}
```

#### `404 Not Found`
Missing entity resource requests.
- **Example Cause:** GET / conflicts/`64ac2bcf8912ef543a6d1000` (ID does not exist) or requesting an unregistered API route route path.
- **Example Response:**
```json
{
  "success": false,
  "message": "Conflict not found with id: 64ac2bcf8912ef543a6d1000"
}
```

#### `429 Too Many Requests`
Rate limiter trigger limits reached.
- **Example Cause:** Sending more than 15 login/register attempts within 1 minute, or over 60 general query actions.
- **Example Response:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again after 15 minutes"
}
```
