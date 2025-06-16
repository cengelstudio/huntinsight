# HuntInsight (AvGörüş)

A modern survey platform designed for hunters in Northern Cyprus (TRNC) to collect and analyze hunting-related data.

## Features

- **Dynamic Survey System**
  - Branching logic based on answers
  - Progress tracking
  - Multiple question types
  - Real-time validation

- **User Management**
  - Secure registration
  - TRNC ID verification
  - Hunting license validation
  - User data protection

- **Admin Panel**
  - Password-protected access
  - Survey management
  - Response analysis
  - Data export capabilities

- **Modern UI/UX**
  - Responsive design
  - Light theme with gradients
  - Soft shadows and rounded corners
  - Intuitive navigation

## Tech Stack

- **Frontend**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - React Hooks

- **Backend**
  - Next.js API Routes
  - JSON-based data storage
  - Type-safe API endpoints

## Project Structure

```
huntinsight/
├── app/
│   ├── api/           # API routes
│   ├── components/    # Reusable components
│   ├── types/         # TypeScript definitions
│   └── ...           # Page components
├── data/             # JSON data storage
├── public/           # Static assets
└── styles/           # Global styles
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
