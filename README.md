# Project Management System

A comprehensive web-based project management application designed for efficient task tracking and project oversight.

## 🚀 Features

- **User Authentication**: Secure login and registration powered by Better Auth.
- **Role-Based Dashboards**: Tailored experiences for Admins and Team Leaders.
- **Project Oversight**: Create, manage, and monitor project progress.
- **Monthly Progress Tracking**: Visual representation of project advancements.
- **Responsive UI**: Modern, intuitive interface built with Next.js and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/)
- **Core**: [React 19](https://react.dev/)
- **Styling**: [Tailand CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

### Backend
- **Framework**: [Express 5+](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Authentication**: [Better Auth](https://better-auth.com/)
- **API Documentation**: Postman Collection included in `backend/Backend_API.postman_collection.json`

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd project-management-system
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example and configure your DATABASE_URL
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file and configure your backend API URL
   npm run dev
   ```

## 📂 Project Structure

```text
├── backend                 # Express API & Prisma logic
│   ├── prisma              # Database schema & migrations
│   ├── src                 # Backend source code
│   └── ...
├── frontend                # Next.js Application
│   ├── public              # Static assets
│   ├── src/components      # Reusable UI components
│   ├── src/app             # Next.js pages/routes
│   └── ...
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
