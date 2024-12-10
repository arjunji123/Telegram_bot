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
- **MySQL Server** 🛢️  
- **Git** 🐙  

---

## 🗃️ **Database Setup (MySQL)**  

1. **Install MySQL** on your system.  
2. Open your MySQL CLI or GUI tool (e.g., MySQL Workbench).  
3. Create a new database:  
   ```sql
   CREATE DATABASE unitrade;
   ```
4. Import the database schema:  
   If you have a `.sql` file in your project with the schema (e.g., `unitrade.sql`), run:  
   ```bash
   mysql -u [username] -p unitrade < path/to/unitrade.sql
   ```
   Replace `[username]` with your MySQL username and `path/to/unitrade.sql` with the actual path to the SQL file.  
5. Update the **backend configuration** (`backend/.env`) with your MySQL credentials:  
   ```env
   DB_HOST=localhost
   DB_USER=your-mysql-username
   DB_PASSWORD=your-mysql-password
   DB_NAME=unitrade
   ```

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
Ensure the `.env` file contains the correct MySQL details:  
```env
PORT=5000
DB_HOST=localhost
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_NAME=unitrade
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
- **MySQL** - Database  

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
For any queries, reach out at **singhnarukaarjun@gmail.com**. 📧  

Happy Coding! 💻✨  
