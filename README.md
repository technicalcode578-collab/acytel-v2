Acytel - A Full-Stack Music Streaming Application
Acytel is a complete, end-to-end music streaming service built with a modern, high-performance technology stack. It features a secure backend API, a reactive frontend UI, and a robust, containerized infrastructure for data, storage, and search.

🚀 Tech Stack
Backend: Node.js, Express, TypeScript

Frontend: SolidJS, TypeScript, Vite, TailwindCSS

Database: ScyllaDB (Cassandra-compatible NoSQL)

Object Storage: MinIO (S3-compatible)

Search: Typesense

Containerization: Docker & Docker Compose

💻 Setting Up a New Codespace
Follow these steps to get a fully functional development environment running from scratch.

Step 1: Launch the Codespace
Click the "Code" button on the GitHub repository page.

Select the "Codespaces" tab.

Click "Create codespace on main" to launch a new environment.

Step 2: Create the Backend Environment File
The backend requires secret keys to run. These are not stored in the repository for security. You must create this file manually.

In the terminal, create the .env file inside the backend directory:

touch backend/.env

Open the newly created backend/.env file and paste the following content into it.

# Replace with your own long, random string for JWTs
JWT_SECRET=your-super-secret-and-long-random-string-here

# Replace with a DIFFERENT long, random string for streaming URLs
STREAM_TOKEN_SECRET=another-different-super-secret-random-string

# These credentials must match the ones in docker-compose.yml
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
TYPESENSE_API_KEY=Acytel-Secret-Key-Dev-Only

Step 3: Install All Dependencies
Run the following commands from the root directory of the project to install all necessary Node.js packages for both the frontend and backend.

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend/acytel_frontend
npm install
cd ../..

Step 4: Start Background Services
Start the database, object storage, and search engine using Docker Compose.

Make sure you are in the root directory of the project.

Run the command:

docker-compose up -d

Wait about 60 seconds for the services, especially the database, to fully initialize before proceeding.

Step 5: Initialize Database and Storage
This is a critical one-time setup for a new environment.

Run the Database Migration: This creates the acytel keyspace and the users and tracks tables. Run this command from the root directory:

docker exec -i acytel-scylla-db cqlsh < scripts/migrations.cql

Create the MinIO Bucket:

Go to the "Ports" tab in your Codespace.

Find the entry for port 9001 (MinIO Console) and open it in a browser.

Log in with the credentials from your .env file (minioadmin / minioadmin).

Click the "Create Bucket" button and create a new bucket named exactly acytel-music.

Step 6: Start the Development Servers
You will need two separate terminals to run the application.

Start the Backend Server (in your first terminal):

cd backend
npm run dev

Start the Frontend Server (in a new, second terminal):

cd frontend/acytel_frontend
npm run dev

Your setup is now complete! You can open the frontend application by navigating to the forwarded URL for port 3001 in the "Ports" tab.

🛠️ How to Use the Application
Register: Use the registration form to create a new user account.

Log In: Sign in with your new credentials.

Upload Music: Use the upload form to add an audio file to your library.

Play Music: Click the "Play" button on any track in your library to start streaming.

📜 Available Scripts
Backfill Typesense Index
If you have tracks in your database that were added before the search feature was implemented, you can run this script to add them to the search index.

Run this command from the backend directory:

npx tsx scripts/backfill-typesense.ts
tree -I "node_modules|target|dist" > project_structure.txt




Acytel - The Next-Generation Music Experience
Project Status: Actively in Phase 4: The Cinematic Polish. The core engine is feature-complete and stable. Current work is focused on implementing a world-class motion design system and perfecting the user experience.

Acytel is architected from first principles to be a "universe no 1" music platform, delivering an experience defined by absolute fidelity, perceived instantaneousness, and a cinematic user interface.

Core Architecture
Acytel is a hybrid, multi-service platform engineered for maximum performance, scalability, and resilience.

Backend Coordinator (Node.js): A TypeScript-based service using Express.js to handle all core business logic, authentication, and metadata management.

Streaming Engine (Rust): A high-performance Rust microservice dedicated to the single task of low-latency, secure audio delivery.

Database (ScyllaDB): A high-throughput, low-latency NoSQL database for all core application data.

Object Storage (MinIO): An S3-compatible service for storing all raw audio assets.

Search Engine (Typesense): A lightning-fast, typo-tolerant search engine for music discovery.

Frontend (SolidJS): A reactive web application built with SolidJS and styled with TailwindCSS for a "cinematic" feel.

Client-Side Audio Core (Rust/WASM): A Rust-based audio engine compiled to WebAssembly that runs in the browser, handling all audio decoding with maximum performance via the Web Audio API.

Prerequisites
Before you begin, ensure you have the following installed on your local machine or Codespace environment:

Git: For version control.

Docker & Docker Compose: For running the backend services (Database, Search, Storage).

Node.js: (LTS version recommended, e.g., v18 or later) for the backend and frontend.

Rust Toolchain: (Including rustup, cargo) for the streaming service and WASM engine.

wasm-pack: For building the Rust/WebAssembly module (cargo install wasm-pack).

🚀 Setup & Installation
This is a complete guide to setting up the Acytel development environment from a clean state. Execute these commands from the root directory of the project.

1. Clone the Repository
git clone <your-repository-url>
cd acytel

2. Launch Core Services
This command will start ScyllaDB, Typesense, and MinIO in the background using Docker.

docker-compose up -d

3. Set Up the Backend Coordinator
cd backend
npm install
cd ..

4. Set Up the Frontend & WASM Engine
This involves installing frontend dependencies and compiling the Rust-based audio engine.

# Navigate to the frontend directory
cd frontend/acytel_frontend

# Install Node.js dependencies
npm install

# Build the Rust/WASM audio engine
cd src/audio-engine
wasm-pack build --target web
cd ../../.. 
# You should now be back in the root 'acytel' directory

5. Set Up the Rust Streaming Service
# Navigate to the Rust streamer service directory
cd services/streamer

# This step will download dependencies and check the build
cargo check

cd ../..
# You should now be back in the root 'acytel' directory

▶️ Running the Application
To run the full Acytel platform, you will need three separate terminals running simultaneously.

Terminal 1: Start the Backend Coordinator
cd backend
npm run dev

This service typically runs on http://localhost:3000.

Terminal 2: Start the Frontend Application
cd frontend/acytel_frontend
npm run dev

This is the main web application, typically available at http://localhost:5173.

Terminal 3: Start the Rust Streaming Service
cd services/streamer
cargo run --release

This service typically runs on http://localhost:8000.

🌐 Key Service Endpoints
Once all services are running, you can access the following:

Service

URL

Description

Acytel Frontend

http://localhost:5173

The main web application UI.

Backend API

http://localhost:3000

The core Node.js API for all data.

Rust Streamer

http://localhost:8000

The high-performance audio streaming service.

MinIO Console

http://localhost:9001

Web UI for managing uploaded audio files.

Typesense API

http://localhost:8108

API endpoint for the search engine.


