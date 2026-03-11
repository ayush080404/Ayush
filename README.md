# 📋 Employee Daily Task Tracking System

A full-stack web application designed to streamline workplace productivity. This system allows employees to log their daily tasks and provides an Admin Panel for managers to review and track employee performance. 

## ✨ Features
* **Role-Based Interfaces:** Separate views and permissions for standard Employees and Admins.
* **Employee Dashboard:** Intuitive interface for users to log, view, and manage their daily task history.
* **Admin Panel:** Centralized hub for managers to review task submissions across the team.
* **Optimized User Experience:** Custom registration and login forms featuring real-time, inline validation for immediate user feedback.
* **RESTful API:** Robust backend architecture to handle data securely.

## 💻 Tech Stack
This project was built using the **MERN** stack:
* **Frontend:** React (built with Vite), JavaScript, HTML5, Custom CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Tools:** Git, GitHub, VS Code

## 📁 Project Structure
The project is divided into two main directories:
* `/backend` - Contains the Express server, API routes, and MongoDB database connection logic.
* `/frontend` - Contains the React user interface, components, and client-side validation logic.

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
* Node.js installed on your machine
* A MongoDB database (local or MongoDB Atlas)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/ayush080404/Ayush.git
cd Ayush
\`\`\`

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the server:
\`\`\`bash
cd backend
npm install
\`\`\`
*Create a `.env` file in the `backend` folder and add your MongoDB connection string:*
\`\`\`text
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
\`\`\`
*Run the server:*
\`\`\`bash
npm start
# or use nodemon for development:
# nodemon server.js
\`\`\`

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🔮 Future Enhancements
* Implement secure user authentication and password hashing (bcrypt/JWT).
* Add a data visualization dashboard for Admins (charts/graphs of employee productivity).
* Add an export feature to download task logs as CSV or PDF.

---
*Created by Ayush*
