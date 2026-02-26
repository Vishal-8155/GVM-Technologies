# Mini Blog (MERN)

Mini blog app: Node/Express + MongoDB backend, React frontend.

## Setup

1. **MongoDB** – Run MongoDB locally (e.g. `mongod`) or set `MONGO_URI` in `server/.env`.
2. **Backend**
   - `cd server`
   - Copy `server/.env.example` to `server/.env` (edit if needed).
   - `npm install` then `npm start` (runs on port 5000).
3. **Frontend**
   - In project root, copy `.env.example` to `.env`. Set `REACT_APP_API_URL=http://localhost:5000` if different.
   - `npm install` then `npm start` (runs on port 3000).

## API

Base URL: `http://localhost:5000` (or your server URL).

**Auth** (no token required for login/register):
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/auth/register | Body: username, email, password |
| POST   | /api/auth/login    | Body: email, password. Returns token + user |

**Posts** (create/delete/like/comment require `Authorization: Bearer <token>`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/posts | List posts. Query: `?page=1`, `?search=term`. 5 per page |
| POST   | /api/posts | Create post (JSON: title, content, tags[]; or FormData with optional `image`) |
| DELETE | /api/posts/:id | Delete post (only creator) |
| POST   | /api/posts/:id/like | Toggle like (logged-in user) |
| POST   | /api/posts/:id/comments | Body: { text }. Add comment (logged-in user) |

## Notes

- **JWT**: Set `JWT_SECRET` in `server/.env`. Token returned on login/register.
- **Image**: Optional; multipart form with field `image` (jpeg, png, gif, webp; max 5MB). Stored in `server/uploads/`.
- **Dark/Light**: Toggle in header; preference saved in localStorage.

## Security & authorization

- **Authentication**: Protected routes use JWT via `Authorization: Bearer <token>`. Middleware: `protect` (required) and `optionalAuth` (for GET with `mine=1`).
- **Post linked to user**: Every new post is created with `author: req.user._id` and `username: req.user.username` from the logged-in user only; the server ignores any `author`/`username` from the request body.
- **Creator-only actions**: Only the post creator can **delete** or **update** a post. The API checks `post.author === req.user._id` and returns `403` otherwise. The UI shows Update/Delete only for posts where the current user is the author.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
