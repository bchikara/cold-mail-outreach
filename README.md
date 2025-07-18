<p align="center">
  <img src="public/logo.png" alt="Outreach Pro Logo" width="120">
</p>

<h1 align="center">Cold Mail Outreach</h1>

<p align="center">
  A powerful, sleek, and modern dashboard for managing and automating your cold email outreach for job applications. Built with React, Firebase, and Vercel.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Badge">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Badge">
  <img src="https://img.shields.io/badge/Nodemailer-2B5A81?style=for-the-badge&logo=nodemailer&logoColor=white" alt="Nodemailer Badge">
</p>

---

**Outreach Pro** is a full-stack web application designed to streamline the job application process. It allows you to manage contacts, use dynamic email templates, send personalized emails with attachments, and track your outreach history, all from a beautiful, Gemini-inspired dark-mode interface.

## ✨ Features

- **📧 Real Email Sending**: Utilizes a Node.js backend with Nodemailer to send emails directly from your personal Gmail account.
- **📇 Contact Management**: Add contacts manually or perform bulk imports from a CSV file. All contacts are stored securely in your private Firestore database.
- **🎯 Campaign-Based Sending**: A dedicated "Send Mail" view to build targeted recipient lists for each campaign.
- **📄 Dynamic Templates**: Create and use multiple HTML email templates with placeholders like `[Name]` and `[Company Name]` for automatic personalization.
- **📎 Automatic Resume Attachments**: Upload your resume once in the settings, and it will be automatically attached to your outgoing emails.
- **📈 History & Follow-ups**: Track every email you send and easily send follow-up emails with a single click.
- **🔐 Secure & Scalable**: Built on Firebase for secure authentication and data storage, with a serverless backend deployed on Vercel.
- **📱 Fully Responsive**: A collapsible sidebar and mobile-friendly header provide a seamless experience on any device.
- **🔔 Smart Notifications**: A non-intrusive snackbar system provides feedback for all actions.
- **⚡️ Modern State Management**: Uses Zustand for clean, efficient, and boilerplate-free global state management.

## 🚀 Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js (Vercel Serverless Functions)
- **Database & Storage**: Firebase (Firestore, Firebase Storage)
- **State Management**: Zustand
- **Emailing**: Nodemailer
- **UI/UX**: `lucide-react` for icons, `react-hot-toast` for notifications
- **Deployment**: Vercel

## 🏁 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Vercel CLI (`npm install -g vercel`)
- Google Cloud SDK (`gsutil`) for CORS setup

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bchikara/cold-mail-outreach.git
    cd cold-mail-outreach
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Firestore Database**, **Firebase Storage**, and **Anonymous Authentication**.
    - Get your Firebase project configuration keys.

4.  **Set up Environment Variables:**
    - Create a `.env` file in the root of the project.
    - Add your Firebase frontend keys, prefixed with `REACT_APP_`:
      ```env
      REACT_APP_FIREBASE_API_KEY=AIza...
      REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
      # ... and so on for all Firebase keys
      ```
    - **Important**: You also need to add your backend credentials. These will be used by the Vercel CLI locally.
      ```env
      GMAIL_EMAIL=your-email@gmail.com
      GMAIL_APP_PASSWORD=your-16-character-app-password
      ```

5.  **Configure Firebase Storage CORS:**
    - Follow the guide to [set up CORS on your storage bucket](#) to allow your app to fetch the resume for attachments.

6.  **Run the development server:**
    - The standard `npm start` will **not** run the backend API. You must use the Vercel CLI:
    ```bash
    vercel dev
    ```
    - Your app will now be running on a local port (usually `http://localhost:3001`), with both the frontend and backend active.

## 🚀 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Import the repository on Vercel.
3.  In your Vercel project settings, add all the environment variables from your `.env` file. **This is a crucial step.**
4.  Deploy! Vercel will automatically build your React app and deploy your `api` folder as serverless functions.

## 📁 Project Structure


/
├── api/                  # Vercel serverless functions (Node.js backend)
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable components (modals, shared UI)
│   ├── data/             # Static data like email templates
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and Firebase config
│   ├── pages/            # Page components for each route
│   └── stores/           # Zustand state management stores
├── .env                  # Local environment variables (do not commit)
└── package.json
