# Exam Hall Seat Arrangement System

Automated exam hall seating arrangement with genetic algorithm optimization.

## Features
- ✅ Smart seating arrangement (prevents same branch adjacency)
- ✅ Automatic invigilator allocation
- ✅ Room & student conflict detection
- ✅ Exam duration tracking with auto-completion
- ✅ CSV import/export
- ✅ Firebase backend with emulator support

## Tech Stack
- React + Vite
- Firebase (Firestore + Auth)
- Tailwind CSS
- Genetic Algorithm

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Git
- Firebase CLI

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RylVishal/Exam-Hall-Seat-Arrangement.git
cd Exam-Hall-Seat-Arrangement
```

2. **Install dependencies**
```bash
npm install
npm install -g firebase-tools
```

3. **Setup environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# The .env file is already configured with Firebase credentials
```

4. **Login to Firebase**
```bash
firebase login
```

5. **Run the project**
```bash
npm run dev:all
```

This will start:
- Vite dev server: http://localhost:5173
- Firebase Emulator UI: http://localhost:4000

### Alternative (Run separately)
```bash
# Terminal 1 - Firebase Emulators
firebase emulators:start

# Terminal 2 - Vite Dev Server
npm run dev
```

---

## 📝 Usage

1. **Add Students**: Import CSV or add manually
2. **Add Staff**: Register invigilators
3. **Add Rooms**: Configure exam halls with capacity
4. **Schedule Exam**: Set date, time, duration, and branches
5. **Generate Allocation**: Click to auto-assign seats
6. **Export**: Download seating arrangements as CSV

---

## 🔧 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### Firebase login issues
```bash
firebase logout
firebase login
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Project Structure
```
hall-arrangement/
├── src/
│   ├── components/       # React components
│   ├── firebase/         # Firebase config & helpers
│   ├── algorithms/       # Genetic algorithm
│   └── utils/           # CSV helpers
├── .env                 # Environment variables (not in git)
├── .env.example         # Example env file
├── firebase.json        # Firebase config
└── package.json         # Dependencies
```

---

## 🤝 Contributing
Pull requests are welcome!

## 📄 License
MIT
