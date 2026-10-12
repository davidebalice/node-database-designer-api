# Node Database Designer API

REST API for the Database Designer app, built with Node.js, Express and Sequelize (MySQL).
It stores databases, tables, fields and the links between them, saves the diagram layout, and generates the SQL code of a designed database.

**Live demo:** <https://database-designer.davidebalice.dev>

![Screenshot](https://www.aroundweb.it/screenshot/database-designer.jpg)

The frontend is available in a separate repository: [react-database-designer](https://github.com/davidebalice/react-database-designer).

## Features

- JWT authentication (signup, login, logout, password reset and update)
- CRUD for databases, tables, fields and links between fields
- Saves table positions on the diagram canvas
- Generates the SQL `CREATE TABLE` code of a database
- User management with roles and profile photo upload (resized with Sharp)
- Demo mode that blocks write operations
- CORS restricted to allowed origins
- Multilanguage messages (i18n)

## Tech stack

- [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/) with [MySQL](https://www.mysql.com/) (mysql2)
- [JSON Web Token](https://github.com/auth0/node-jsonwebtoken) and [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Multer](https://github.com/expressjs/multer) and [Sharp](https://sharp.pixelplumbing.com/) for image uploads
- [Nodemailer](https://nodemailer.com/) for emails

## Getting started

### Requirements

- Node.js 20 or later
- MySQL server

### Installation

```bash
git clone https://github.com/davidebalice/node-database-designer-api.git
cd node-database-designer-api
npm install
```

### Configuration

Create a `config.env` file in the project root:

```env
NODE_ENV=development
DB_HOST=localhost
DB_NAME=database_designer
DB_USER=root
DB_PASSWORD=your_password
DB_PREFIX=

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

DEMO_MODE=false
FILE_PATH=/absolute/path/for/uploads

EMAIL_FROM=noreply@example.com
BREVO_HOST=smtp-relay.brevo.com
BREVO_PORT=587
BREVO_USERNAME=your_smtp_user
BREVO_PASSWORD=your_smtp_password
```

To create the database tables, run `node dbSync.js`. Warning: it uses `sync({ force: true })`, so existing tables are dropped and recreated.

### Run

| Command     | Description                                           |
| ----------- | ----------------------------------------------------- |
| `npm start` | Start the API on `http://localhost:8000` with nodemon |

## API endpoints

All routes are prefixed with `/api`. Most of them require a valid JWT (`Authorization: Bearer <token>`).

### Auth

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/api/signup`                 | Register a new user            |
| POST   | `/api/login`                  | Log in and receive a JWT       |
| GET    | `/api/logout`                 | Log out                        |
| POST   | `/api/forgotPassword`         | Send a password reset email    |
| PATCH  | `/api/resetPassword/:token`   | Reset the password with token  |
| PATCH  | `/api/updatePassword`         | Update the current password    |

### Dashboard

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| GET    | `/api/getdemomode`    | Get the demo mode status      |
| GET    | `/api/get-connection` | Check the database connection |

### Databases

| Method | Endpoint                   | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/api/databases`           | List databases               |
| POST   | `/api/database/add`        | Create a database            |
| GET    | `/api/database/:id`        | Get a database               |
| GET    | `/api/database/edit/:id`   | Get a database for editing   |
| POST   | `/api/database/edit/:id`   | Update a database            |
| POST   | `/api/database/delete/:id` | Delete a database            |
| GET    | `/api/designer/:id`        | Get databases (designer)     |

### Tables, fields and links

| Method | Endpoint                 | Description                                   |
| ------ | ------------------------ | --------------------------------------------- |
| GET    | `/api/tables`            | List tables with fields and links             |
| POST   | `/api/update-tables`     | Save tables, fields, links and positions      |
| GET    | `/api/sql`               | Generate the SQL code (`?database_id=`)       |
| POST   | `/api/add/table`         | Create a table                                |
| GET    | `/api/table/:id`         | Get a table                                   |
| GET    | `/api/edit/table/:id`    | Get a table for editing                       |
| POST   | `/api/edit/table/:id`    | Update a table                                |
| POST   | `/api/table/delete/:id`  | Delete a table                                |
| POST   | `/api/field/delete/:id`  | Delete a field                                |
| POST   | `/api/link/delete/:id`   | Delete a link                                 |

### Users

| Method   | Endpoint                   | Description                         |
| -------- | -------------------------- | ----------------------------------- |
| GET      | `/api/profile`             | Get the current user profile        |
| POST     | `/api/profile/update`      | Update the profile                  |
| POST     | `/api/profile/password`    | Change the profile password         |
| POST     | `/api/profile/photo`       | Upload the profile photo            |
| GET      | `/api/users`               | List users                          |
| POST     | `/api/add/user`            | Create a user (admin)               |
| GET      | `/api/user/:id`            | Get a user                          |
| POST     | `/api/user/:id`            | Update a user (admin)               |
| POST     | `/api/user/delete/:id`     | Delete a user (admin)               |
| GET/POST | `/api/user/photo/:id`      | Get or upload a user photo          |
| POST     | `/api/user/password/:id`   | Change a user password (admin)      |
| GET      | `/api/user/img/:filename`  | Get a user image                    |
| PATCH    | `/api/updateUser`          | Update user data                    |
| POST     | `/api/send/email/user`     | Send an email to a user             |

## Project structure

```text
├── index.js        # Express app setup and routes
├── db.js           # Sequelize connection
├── dbSync.js       # Creates the database tables
├── routers/        # Route definitions
├── controllers/    # Request handlers
├── models/         # Sequelize models
├── middlewares/    # Error handling, demo mode, email
└── i18n/           # Translations
```

## Author

**Davide Balice** – [davidebalice.dev](https://www.davidebalice.dev)
