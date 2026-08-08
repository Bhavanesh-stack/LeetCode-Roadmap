# LeetCode Roadmap 🚀

A highly interactive, visually striking LeetCode progression tracker built with **React**, **Eel**, and **Python**. Designed with a vibrant **Neo-Brutalism** aesthetic, this tool helps you systematically track your algorithmic journey through a connected node graph.

![Neo-Brutalism UI](frontend/src/assets/hero.png) *(Note: Replace this with an actual screenshot if desired)*

## ✨ Features
- **Interactive Node Graph**: Navigate through topics like Arrays, Trees, Dynamic Programming, and Graphs via a deeply interactive canvas built with `reactflow`.
- **Progress Tracking**: Your progress is tracked locally using markdown files in your Obsidian vault, giving you full control and ownership over your data.
- **Neo-Brutalism Design**: Hard black shadows, bright pastel colors, thick borders, and `Space Grotesk` fonts make your roadmap pop.
- **Standalone Executable**: Built into a single lightweight `.exe` file that runs a fast Python webview backend via `Eel` without needing a full browser window.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), React Flow, Vanilla CSS
- **Backend**: Python, Eel (for lightweight desktop app integration)
- **Bundler**: PyInstaller (to package everything into a single executable)

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/)

### 1. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Setup the Backend
```bash
python -m venv venv
# Activate the venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 3. Build the Application
To compile the entire React application and bundle the Python backend into a single `.exe` file:
```bash
python build.py
```
The compiled executable will be located at `backend/dist/LeetCodeRoadmap.exe`.

## 📂 Project Structure
- `/frontend`: Contains all the React source code, React Flow logic, and Neo-Brutalism CSS styling.
- `/backend`: Contains `main.py` which interfaces with your local file system to track your LeetCode progress.
- `build.py`: Automation script that builds the Vite frontend, copies the static assets to the backend, and runs PyInstaller to create the final executable.

## 🤝 Contributing
Feel free to open issues or submit pull requests if you want to add more features or adjust the roadmap layout!