# 🍳 AI-Powered Recipe Generator(Recipe Magic)

A fast and modern web application that generates creative recipes using AI, stores them in Supabase, and displays them on a dynamic dashboard. Backend logic is automated via n8n workflows. Built with Vite, TypeScript, and modern UI tools.

---

## 🚀 Features

- 🤖 AI-generated recipes based on user-selected topics
- ⚡ Superfast frontend using Vite + React + TypeScript
- 🗂️ Supabase integration for structured data storage
- 🔁 Automated backend flows with n8n
- 🎨 Beautiful and accessible UI with Tailwind CSS + shadcn/ui
- 🌐 Responsive dashboard for recipe viewing

---

## 📦 Tech Stack

| Technology       | Purpose                                   |
|------------------|-------------------------------------------|
| **Vite**         | Lightning-fast frontend build tool        |
| **React**        | UI library for component-based design     |
| **TypeScript**   | Type safety and better dev experience     |
| **Tailwind CSS** | Utility-first styling framework           |
| **shadcn/ui**    | Prebuilt accessible UI components         |
| **Supabase**     | Database and authentication               |
| **n8n**          | Workflow automation and API orchestration |
| **Gemini AI**    | Recipe generation via AI                  |

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-recipe-generator.git
cd ai-recipe-generator
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_N8N_WEBHOOK_URL=your-n8n-webhook-endpoint
```

### 4. Start the Development Server

```bash
npm run dev
```

Then visit localhost link in your browser.

---

## 📡 n8n Workflow Overview

* **Webhook Trigger** – Accepts topic input from frontend
* **AI Agent Node** – Generates recipe response
* **Function Node** – Parses and formats to JSON
* **Supabase Node** – Stores recipe entries
* **Response Node** – Sends structured JSON back to the frontend

---

## 📊 Dashboard UI

The UI fetches recipes from Supabase and displays them using clean cards and components. Key features:

* Enter Recipe name to generate via `<input />` (shadcn/ui)
* AI recipe generation
* Loading and error feedback
* Scalable and modular design

---

## 🧠 Inspiration

This project was created to combine **AI**, **automation**, and **modern frontend development** into a single workflow — proving that full-stack apps can be fast, clean, and free to deploy using tools like n8n and Supabase.

---

## 🧹 TODO

* [ ] Add AI-generated recipe images
* [ ] Show User name on public recipe in Dicover Tab

---
## 🌐 Live Demo
👉 [Visit the Live Website](https://internship-five-omega.vercel.app/)

👉 [Watch Demo Video](https://youtu.be/eYuG3MMAu58)
Note: Voice may be low in video so use a handsfree 

---
# 👨‍💻 Author

Muhammad Mustafa

```
