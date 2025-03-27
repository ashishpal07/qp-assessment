# 🛒 Grocery Booking API

This is a **Node.js** and **TypeScript**-based Grocery Booking API that allows users to register, login, place orders, cancel orders, and manage groceries (Admin only). 
The API uses **PostgreSQL** for data storage and **Prisma ORM** for database operations.  

---

## 📦 Features

- **Admin**
  - CRUD operations for groceries.
  - Deliver orders.
- **User**
  - Register and login using JWT authentication.
  - Place orders for groceries.
  - Cancel orders if they are pending.
- **Authentication**
  - Secure API using JWT tokens.
- **Database**
  - PostgreSQL with Prisma ORM.
- **Docker Support**
  - Easily run with Docker using `docker-compose`.

---

## 🛠 Tech Stack

- **Node.js** with **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Zod** for validation
- **JWT** for authentication
- **Docker** for containerization

⚡ Admin User Seeding
Note: The database seeding for the initial admin user is not automated due to issues while building Docker.

After the application starts, you can manually create an admin user using following

Use the Provided Seed Script

Add the following script to the package.json file:
```
"scripts": {
  "seed": "ts-node src/prisma/seed.ts"
}
```
Create a seed.ts file in src/prisma/seed.ts with the following code:

```
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const adminEmail = 'admin@example.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10); 
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User',
      },
    });
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```
---

## 🚀 Getting Started

## 🛠 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or later)  
- [Docker](https://www.docker.com/) and Docker Compose  
- [PostgreSQL](https://www.postgresql.org/) (if not using Docker)  

---

### Environment Variables

Create a `.env` file in the root directory and to create `.env` file refer `.env.sample` I have given.


## How to run project
## 🐳 Run Using Docker:
```sudo docker-compose up --build```

## To stop docker containers
```sudo docker-compose down```

## 🧑‍💻 Run Locally Without Docker
### Make sure PostgreSQL is running and accessible.

## Install Dependencies


```npm install```
```Generate Prisma Client```

```npx prisma generate```

## Run Migrations

```npx prisma migrate dev```

Start the Application

```npm run dev```



