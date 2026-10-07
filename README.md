# Hospital Management System (HMS)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A comprehensive, full-stack Hospital Management System designed to streamline hospital operations, patient management, and administrative tasks. Built with a **React** frontend and a **Spring Boot (Java)** backend, this system integrates an AI-powered medical assistant and uses a cloud-based **PostgreSQL** database.

### 🌐 Live Demo
**URL:** [https://hospital-management-systemt.onrender.com/](https://hospital-management-systemt.onrender.com/)

> **⚠️ Important Note for Evaluators/Interviewers:**
> The backend is deployed on a free tier of Render.com. If the service has been inactive for a while, **it may take 1-2 minutes for the backend to wake up** upon your first request. Please be patient if the initial login or data fetch takes a moment.

---

## 🚀 Features

The system is divided into several robust modules to handle day-to-day hospital operations:

- **📊 Dashboard Analytics:** Overview of hospital KPIs, active patients, available beds, monthly revenue, and visual charts for hospital metrics.
- **👨‍⚕️ Staff Management:** Complete CRUD operations for hospital staff (Doctors, Nurses, Administrators) including department allocation and role-based access control.
- **🤒 Patient Management:** Track patient history, contact details, status, and assigned doctors.
- **📅 Appointment Scheduling:** Book, update, and manage patient appointments with specific doctors across various departments.
- **🛏️ Bed & Ward Management:** Real-time tracking of bed availability, ward assignments, and patient bed allocation.
- **🔬 Lab Reports:** Generate, update, and track patient lab results, including detailed medical parameters and normal ranges.
- **💳 Billing & Invoices:** Manage hospital billing, generate invoices for appointments and lab tests, and track payment statuses.
- **🤖 AI Medical Assistant:** Integrated an AI Chatbot (powered by Groq / LLaMA3) to assist hospital staff with medical concepts, diagnosis suggestions, and procedural queries directly within the platform.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **Deployment:** Render (Static Site)

### Backend
* **Framework:** Java / Spring Boot 4.x
* **Database:** PostgreSQL (Hosted on NeonDB)
* **ORM:** Spring Data JPA / Hibernate
* **Build Tool:** Maven
* **AI Integration:** Direct REST communication via Spring `RestTemplate` (Groq API)
* **Deployment:** Render (Dockerized Java Environment)

---

## 🚢 Deployment Architecture
* **Frontend:** Deployed as a static site. The Vite configuration is bypassed in production, utilizing Render's Rewrite Rules to forward `/api/*` traffic to the backend URL.
* **Backend:** Deployed as a Web Service on Render using a custom `Dockerfile` based on the `eclipse-temurin:21` image to ensure absolute compatibility with the latest Java versions.
* **Security:** Hardcoded credentials have been stripped from the repository. All secrets are managed via environment variables (`$DB_URL`, `$DB_PASSWORD`, `$GROQ_API_KEY`) injected securely at runtime.
