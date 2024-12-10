# 🌟 **Unitrade** 🌟  
A dynamic platform for **Users**, **Co-Companies**, and **Admins**! 🚀  
This repository contains:  
- 🎨 **Frontend for Users**  
- 🌐 **Frontend for Co-Companies**  
- 🛠️ **Backend Admin Panel**

---

## 📁 **Project Structure**  
```plaintext
Unitrade/
├── frontend/          # User-facing frontend (ReactJS)
├── company/           # Co-Companies-facing frontend (ReactJS)
├── backend/           # Admin panel backend (Node.js)
```

---

## 🚀 **Getting Started**  

### 🛠️ Prerequisites  
Before running the project, ensure you have the following installed:  
- **Node.js** (v14 or higher) 🌐  
- **npm** or **yarn** 📦  
- **Git** 🐙  

### 🗃️ **Database**  
The database is not included in the GitHub repository. Set up your database locally or on a cloud platform like MongoDB Atlas. You will need to:  
1. Create a MongoDB database. 🛢️  
2. Update the **backend configuration** (`backend/.env`) with your database URI.

---

## 🛠️ **Installation Steps**  

### 1️⃣ **Clone the Repository**  
```bash
git clone https://github.com/your-username/unitrade.git
cd unitrade
```

### 2️⃣ **Frontend Setup (Users)**  
Navigate to the **frontend** folder:  
```bash
cd frontend
npm install
npm start
```
This will start the user-facing frontend on [http://localhost:3000](http://localhost:3000). 🌟  

### 3️⃣ **Frontend Setup (Co-Companies)**  
Navigate to the **company** folder:  
```bash
cd ../company
npm install
npm start
```
This will start the Co-Companies frontend on [http://localhost:3001](http://localhost:3001). 🌐  

### 4️⃣ **Backend Admin Panel Setup**  
Navigate to the **backend** folder:  
```bash
cd ../backend
npm install
```

#### 🔧 Configure Environment Variables  
Create a `.env` file in the `backend` folder with the following values:  
```env
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
```

Start the backend server:  
```bash
npm start
```
This will start the backend server on [http://localhost:5000](http://localhost:5000). 🛠️  

---

## 📌 **Key Features**  
✨ **User Frontend**: Interactive UI for users.  
✨ **Co-Companies Frontend**: Dedicated interface for partner companies.  
✨ **Admin Panel**: Manage everything efficiently.  

---

## 📸 **Screenshots**  
_Add some screenshots or GIFs of your project to make it visually appealing!_

---

## 🛠️ **Built With**  
- **ReactJS** - Frontend  
- **Node.js** - Backend  
- **MongoDB** - Database  

---

## 🤝 **Contributing**  
Contributions are welcome! 🎉  
1. Fork the repository.  
2. Create your feature branch: `git checkout -b feature-name`.  
3. Commit your changes: `git commit -m 'Add some feature'`.  
4. Push to the branch: `git push origin feature-name`.  
5. Submit a pull request!  

---

## 📞 **Contact**  
For any queries, reach out at **singhnarukaarjun@example.com**. 📧  

Happy Coding! 💻✨  
