# MERN Chat App

A modern, full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. Supports text, image, video, audio, and file sharing, with a responsive and user-friendly interface.

live websit - https://adda-pi.vercel.app/

---

## 🚀 Features

- **Real-Time Messaging:** Instant chat updates using Socket.IO
- **Media Support:** Send images, videos, audio, and files
- **Typing Indicators:** See when the other user is typing
- **Online Status:** Know who is online in real time
- **Emoji Picker:** Express yourself with emojis
- **Responsive UI:** Works great on desktop and mobile
- **User Authentication:** Secure login and user management
- **Profile & Info Panel:** View user details and status
- **File Uploads:** Upload and preview files with drag-and-drop and badge display
- **Error Handling:** User-friendly notifications and feedback

---

## 🛠️ Tech Stack

- **Frontend:** React, Redux, Tailwind CSS, Material UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Real-Time:** Socket.IO
- **File Storage:** ImageKit (or your preferred cloud storage)
- **Other:** JWT Auth, REST API, Vite, Axios

---

## 📦 Project Structure

```
MERN_CHAT_APP2/
  backend/      # Express API, Socket.IO, MongoDB models
  frontend/     # React app, components, config, assets
```

---

## 🖥️ Screenshots

### Desktop View

![Desktop Chat Interface](https://ik.imagekit.io/oruoqrvqm/adda_files/Screenshot%202025-07-11%20134102.png?updatedAt=1753525721759)

### QR Code

![Mobile Chat Interface](https://ik.imagekit.io/oruoqrvqm/adda_files/Screenshot%202025-07-11%20132738.png?updatedAt=1753525718259)

### Create Group Feature

![Create Group](https://ik.imagekit.io/oruoqrvqm/adda_files/Screenshot%202025-07-11%20133217.png?updatedAt=1753525718317)

### AI Chat

![Login Screen](https://ik.imagekit.io/oruoqrvqm/adda_files/Screenshot%202025-07-11%20132726.png?updatedAt=1753525718083)

### Chat Area

![Login Screen](https://ik.imagekit.io/oruoqrvqm/adda_files/Screenshot%202025-07-11%20132611.png?updatedAt=1753525718270)

---

## ⚡ Getting Started

### Prerequisites

- Node.js & npm
- MongoDB instance (local or cloud)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/mern-chat-app.git
cd mern-chat-app2
```

### 2. Backend Setup

```bash
cd backend
npm install
# Create a .env file with your MongoDB URI, JWT secret, and ImageKit credentials
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

- The frontend runs on `http://localhost:5173`
- The backend runs on `http://localhost:5000`

---

## ⚙️ Environment Variables

**Backend (.env):**

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PUBLIC_KEY=your_imagekit_public_key
PRIVATE_KEY=your_imagekit_private_key
URL_END_POINT=your_imagekit_url_endpoint
```

---

## ✨ Deployment

- Deploy the backend to platforms like Heroku, Render, or your own VPS
- Deploy the frontend to Vercel, Netlify, or similar
- Update CORS and environment variables for production

---

## 📚 Learnings & Highlights

- Real-time communication with Socket.IO
- Secure file uploads and cloud storage
- Responsive design and mobile-first UI
- Handling CORS and environment configs for production

---

## 🙌 Credits

- [Socket.IO](https://socket.io/)
- [React](https://react.dev/)
- [MongoDB](https://www.mongodb.com/)
- [ImageKit](https://imagekit.io/)
- [Material UI](https://mui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💬 Contact

For questions, feedback, or collaboration:

- [Suman Dey]()
- [LinkedIn](https://www.linkedin.com/in/suman-dey-463794253/)
