# TechCoachAI 🧠✨

TechCoachAI is a web-based platform designed to help users learn and practice Python coding skills interactively. It features coding challenges, an in-browser code editor with execution capabilities, and an AI assistant to provide hints and feedback.

## ✨ Features

* **Interactive Coding Problems:** Practice Python with a curated set of problems across various categories (Basics, Algorithms, Data Structures, Math, etc.).
* **In-Browser Python Execution:** Run your Python code directly in the browser using Pyodide (via WebAssembly) - no local setup needed!
* **AI Assistant:** Get hints, explanations, and feedback on your code powered by OpenAI's GPT models.
* **Code Editor:** A feature-rich editor (CodeMirror) with Python syntax highlighting.
* **User Authentication:** Register and log in to track progress (backend implementation).
* **Modern UI:** Built with React, TypeScript, and styled with Tailwind CSS & shadcn/ui.

## 🛠️ Tech Stack

**Frontend:**

* **Framework/Library:** React 18, React Router v7
* **Language:** TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS, shadcn/ui, Radix UI
* **Code Editor:** CodeMirror 6
* **Python Execution:** Pyodide (WebAssembly)
* **State Management:** React Context / Hooks
* **HTTP Client:** Axios
* **Icons:** Lucide React

**Backend:**

* **Runtime:** Node.js
* **Framework:** Express
* **Language:** TypeScript
* **Database:** MongoDB (with Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens), bcryptjs (for hashing)
* **Middleware:** CORS, Cookie-Parser

**AI:**

* OpenAI API (GPT models)

**Development:**

* **Package Manager:** Bun (inferred from backend scripts) / npm / yarn
* **Linting/Formatting:** Biome
* **Version Control:** Git

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

**Prerequisites:**

* Node.js (v18 or later recommended)
* Bun (or npm/yarn, adjust commands accordingly)
* MongoDB instance (local or cloud, e.g., MongoDB Atlas). An in-memory server is used by default for development if no `MONGO_URI` is provided.
* OpenAI API Key

**Installation:**

1.  **Clone the repository:**
    ```bash
    git clone <https://github.com/arasztaha/FYPfinal>
    cd TechCoachAI
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    cd techcoachai
    bun install
    # or npm install / yarn install
    ```
3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    bun install
    # or npm install / yarn install
    ```

**Environment Variables:**

1.  **Backend:** Create a `.env` file in the `techcoachai/backend` directory and add the following (replace placeholders with your actual values):
    ```env
    # Optional: If using a cloud/local MongoDB instance instead of the in-memory one
    # MONGO_URI=your_mongodb_connection_string

    # Required for JWT
    JWT_SECRET=your_strong_jwt_secret_key_here
    JWT_LIFETIME=7d # Optional: default is 7d

    # Optional: Port for the backend server
    # PORT=5000

    # Optional: URL of the frontend for CORS
    # CLIENT_URL=http://localhost:5173
    ```
2.  **Frontend:** Create a `.env` file in the `techcoachai` (frontend root) directory and add your OpenAI API Key:
    ```env
    # Required for AI Assistant feature
    VITE_OPENAI_API_KEY=your_openai_api_key_here
    ```
    *Note: Exposing API keys directly in frontend environment variables is generally not recommended for production applications. Consider a backend proxy.*

**Running the Application:**

1.  **Run the Backend Server:**
    ```bash
    cd techcoachai/backend
    bun run dev
    # or npm run dev / yarn dev
    ```
    The backend should start (typically on port 5000, check console output).

2.  **Run the Frontend Development Server:**
    Open another terminal window:
    ```bash
    cd techcoachai
    bun run dev
    # or npm run dev / yarn dev
    ```
    The frontend should start (typically on port 5173 or the next available one, check console output).

3.  **Access the Application:** Open your browser and navigate to the URL provided by the Vite development server (e.g., `http://localhost:5173`).

## 🔮 Future Work (Potential Ideas)

* Implement backend storage for `Submissions` and `Feedback`.
* Track user progress across problems.
* Expand the problem library and categories.
* Add more sophisticated AI feedback analysis.
* Implement user profiles and settings.
* Add support for more programming languages.
* Implement Interview Simulation Features (e.g., Time Constraints)
* Add Debugging Challenges
* Implement Mock Interview Mode
* Implement Simple Portfolio/Showcase Feature
