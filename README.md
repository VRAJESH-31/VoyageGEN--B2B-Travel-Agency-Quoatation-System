<div align="center">

  <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" alt="VoyageGen Banner" width="100%" style="border-radius: 10px; object-fit: cover; height: 300px;">

  <h1>✈️ VoyageGen</h1>
  
  <h3>The B2B Travel Quotation Operating System</h3>

  <p>
    <strong>Where smart planning meets unforgettable journeys.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Status-MVP%20Complete-success?style=for-the-badge&logo=git" alt="Status">
    <img src="https://img.shields.io/badge/Hackathon-Sentiment_AI-blueviolet?style=for-the-badge" alt="Hackathon">
    <img src="https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge" alt="Stack">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
  </p>

  [<kbd> <br> View Demo <br> </kbd>](http://localhost:5173) &nbsp; &nbsp; [<kbd> <br> Report Bug <br> </kbd>](https://github.com/vrajesh-31/voyagegen/issues)
</div>

<br />

---

## 🚩 The Problem Statement
The global B2B travel ecosystem is currently running on fragmented, outdated workflows. As highlighted in the **Sentiment AI Problem Statement**, travel agents face critical bottlenecks:

| 🚫 The Current Chaos | ✅ The VoyageGen Solution |
| :--- | :--- |
| **Fragmented Tools** (Excel, WhatsApp, Email) | **Unified Dashboard** for requirements & quotes |
| **Manual Costing Errors** eating into profits | **Auto-Calculated Pricing** with margin control |
| **Slow Turnaround** waiting for partner rates | **Instant Inventory** from verified partners |
| **Unprofessional, Messy PDFs** | **High-Definition, Branded Quotations** |

> *"A digital quotation builder is needed to consolidate requirements, automate costing, enable collaboration, and deliver professional quotations instantly."*

---

## ✨ Key Features

### 🌍 For The Traveler (Experience)
* ** immersive Landing Page:** A high-end UI featuring **GSAP** animations, **Lenis** smooth scrolling, and **Vanta.js** 3D cloud effects to inspire wanderlust.
* **Smart Journey Planner:** An intuitive multi-step form to capture travel intent (Destination, Budget, Pax, Trip Type).
* **Curated Showcases:** Interactive destination galleries and testimonial marquees.

### 👔 For The Agent (Productivity)
* **Kanban Dashboard:** Visualize new leads and track quotation status (New -> In Progress -> Quotes Ready).
* **AI-Powered Partner Matching:** Automatically filters Hotels and Transport providers based on the traveler's specific budget and star rating preferences.
* **Dynamic Quote Editor:** * Drag-and-drop itinerary building.
    * Real-time cost breakdown (Net Cost vs. Final Price).
    * Adjustable profit margins.
* **Instant PDF Generation:** One-click generation of a clean, shareable PDF quotation.

### 🤝 For The Partner (Supply)
* **Dedicated Portal:** Login for Hotel owners, DMCs, and Cab providers.
* **Inventory Management:** Add/Edit inventory items (Room types, Vehicle types, Activities) with pricing and images.
* **Profile Customization:** Set specializations (e.g., "Honeymoon", "Luxury") to get matched with the right high-value leads.

---

## 🛠️ Tech Stack

The project is built using the **MERN Stack** with a heavy focus on modern frontend performance and design.

### **Frontend**
| Tech | Usage |
| :--- | :--- |
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) | UI Library (Vite) |
| ![Tailwind](https://img.shields.io/badge/-Tailwind-38B2AC?logo=tailwind-css&logoColor=white) | Styling Engine |
| **GSAP** | Advanced Animations & ScrollTriggers |
| **Framer Motion** | Component-level micro-interactions |
| **Vanta.js** | 3D WebGL Cloud Backgrounds |
| **Lenis** | Luxury Smooth Scrolling |

### **Backend**
| Tech | Usage |
| :--- | :--- |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Runtime Environment |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | API Framework |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) | NoSQL Database (Mongoose ODM) |
| **JWT** | Secure Authentication |

---

## 🚀 Installation & Setup

Follow these steps to run **VoyageGen** locally on your machine.

### Prerequisites
* Node.js (v16+)
* MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone [https://github.com/vrajesh-31/voyagegen.git](https://github.com/vrajesh-31/voyagegen.git)
cd voyagegen
````

### 2\. Backend Configuration

```bash
cd backend
npm install

# Create a .env file
echo "PORT=5000" > .env
echo "MONGO_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_super_secret_key" >> .env

# Seed Database with Dummy Partners (Important for Demo!)
node seedPartners.js

# Start Server
npm start
```

*Backend runs on: `http://localhost:5000`*

### 3\. Frontend Configuration

```bash
# Open a new terminal
cd frontend
npm install

# Create a .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start Client
npm run dev
```

*Frontend runs on: `http://localhost:5173`*

-----

## 📂 Project Structure

```bash
VoyageGEN/
├── backend/
│   ├── controllers/    # Logic for Auth, Partners, Quotes
│   ├── models/         # MongoDB Schemas (User, PartnerProfile, Quote)
│   ├── routes/         # API Endpoints
│   └── server.js       # Entry Point
│
└── frontend/
    ├── src/
    │   ├── components/ # Hero, BentoGrid, Navbar
    │   ├── context/    # AuthContext Provider
    │   ├── pages/      # Agent, Partner, & User Views
    │   └── App.jsx     # Route Definitions
```

-----


## 🔮 Future Roadmap

  - [ ] **AI Itinerary Generation:** Integration with LLMs to auto-write day-wise plans.
  - [ ] **WhatsApp Integration:** Send quote links directly to client WhatsApp numbers.
  - [ ] **Payment Gateway:** Integrated Stripe/Razorpay for booking fee collection.
  - [ ] **Real-time Chat:** Socket.io chat between Agents and Partners.

-----


**Built for the Sentiment AI Hackathon**

Made with ❤️ by **Vrajesh**

[⭐ Star this repo](https://www.google.com/search?q=https://github.com/vrajesh-31/voyagegen)

