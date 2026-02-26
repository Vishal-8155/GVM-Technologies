# Mini Blog (MERN)

Mini blog app: Node/Express + MongoDB backend, React frontend.

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)

## Setup

### 1. Clone

```bash
git clone https://github.com/Vishal-8155/GVM-Technologies.git
cd GVM-Technologies/task
```

### 2. Backend

```bash
cd server
copy .env.example .env
```

Edit `server/.env`: set `PORT`, `MONGO_URI`, `JWT_SECRET`.

```bash
npm install
npm start
```

Backend runs on port 5000. You should see `MongoDB connected`.

### 3. Frontend

Open a new terminal. From the `task` folder (not server):

```bash
cd path/to/GVM-Technologies/task
copy .env.example .env
```

Edit `task/.env`: set `REACT_APP_API_URL=http://localhost:5000`.

```bash
npm install
npm start
```

Frontend runs on port 3000.

## Run

1. Start **backend** first (`cd server` → `npm start`).
2. Start **frontend** (`cd task` → `npm start`).
3. Open http://localhost:3000 → Register → Login → use the app.
