# Art Marketplace Backend

This repository contains the backend API for the Art Marketplace application. It is built with Node.js, TypeScript, and Prisma, and it uses a PostgreSQL database.

## Technologies

-   **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
-   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
-   **PostgreSQL**: A powerful, open-source object-relational database system.
-   **Prisma**: A next-generation ORM for Node.js and TypeScript.
-   **Docker**: For running the PostgreSQL database in a containerized environment.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [Docker](https://www.docker.com/products/docker-desktop)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Qaiyyum47/art-marketplace-backend.git
    cd art-marketplace-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Database Setup

1.  **Start the PostgreSQL database using Docker:**
    ```bash
    docker run --name art-marketplace-db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
    ```
    You can change `mysecretpassword` to a password of your choice.

2.  **Create a `.env` file** in the root of the project and add the following, replacing `mysecretpassword` with the password you chose in the previous step:
    ```env
    DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/art_marketplace"
    ```

3.  **Run the database migrations:**
    This command will create the database and apply the schema.
    ```bash
    npx prisma migrate dev
    ```

## Running the Application

-   **Development:**
    ```bash
    npm run dev
    ```

-   **Production:**
    ```bash
    npm run build
    npm run start
    ```
