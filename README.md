# War Economic Impact API

A production-grade RESTful API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** to track and analyze the economic impacts of global conflicts. This project is structured using the **MVC (Model-View-Controller)** pattern coupled with a **Service Layer** for clean separation of concerns, robust validation, stateless **JWT authentication**, and advanced database aggregates.

---

## 🚀 Key Features

* **Conflict Metrics Tracking**: Detailed metrics including GDP loss, inflation rates, unemployment increases, poverty rates, black market currency gaps, war costs, and reconstruction costs.
* **Service-Oriented MVC Architecture**: Keeps controllers lightweight by isolating business logic and database queries in dedicated services.
* **Advanced Query Parser Utility**: Dynamic pagination, sorting, text search, and multi-field filtering handled dynamically via URL query parameters.
* **Stateless Authentication**: JWT-based user authentication and role-based access control (RBAC) to secure sensitive write/delete endpoints.
* **Custom Rate Limiting**: In-memory rate limiting middleware designed to prevent brute force and API abuse.
* **High-Performance Aggregations**: Advanced MongoDB aggregation pipelines for computing global statistics, regional distributions, and extreme economic metric outliers.
* **Centralized Error Handling**: Standardized operational error formatting and process crash prevention.

---

## 📂 Project Structure

```text
src/
├── config/             # Database connection configuration
├── constants/          # Application-wide HTTP codes, roles, and static values
├── controllers/        # Request & response marshalling
├── services/           # Core business logic and Mongoose queries
├── routes/             # API route definitions and rate limit bindings
├── models/             # Mongoose schemas (User, Conflict)
├── middlewares/        # Custom rate limiters, auth guards, validation handlers, logging, and error boundaries
├── validators/         # Input request schemas
├── utils/              # API helpers (asyncHandler, apiResponse, apiError, queryParser)
├── seed/               # Database seeder scripts and dataset
└── app.js              # Express application configuration
```

---

## ⚙️ Tech Stack

* **Runtime**: Node.js (v18+)
* **Framework**: Express.js
* **Database**: MongoDB & Mongoose ODM
* **Security**: JSON Web Tokens (JWT), Bcrypt.js, Custom Rate Limiting
* **Tooling**: Nodemon, Dotenv, Morgan

---

## 🛠️ Setup and Installation

### 1. Clone the repository
```bash
git clone https://github.com/rishi919-rgb/war_economic_impact_dataset_rishikesh_singh.git
cd war_economic_impact_dataset_rishikesh_singh
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and copy the contents of `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/war_economic_impact
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

### 4. Run the Application
* **Development mode** (with auto-reload):
  ```bash
  npm run dev
  ```
* **Production mode**:
  ```bash
  npm start
  ```

---

## 🧪 Seeding the Database

To seed the database with the initial conflict dataset:
```bash
npm run seed
```

---

## 🛡️ License

This project is licensed under the MIT License.
