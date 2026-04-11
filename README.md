# AINN SLA - Advanced AI Resume Intelligence
🛡️ **Hybrid AI Resume Matcher & Career Optimization Dashboard**

AINN SLA (Artificial Intelligence Neural Network Service Level Analysis) is a state-of-the-art hybrid AI platform that transforms traditional resume screening into a deep-learning insight engine. It combines the reasoning power of **Google Gemini 2.0** with a custom **NumPy-Native Neural Network** for high-precision job ranking.

## ✨ Core Features

- **Hybrid AI Pipeline**: 
  - **Gemini 2.0 (LLM)** handles resume parsing, career reasoning, and actionable recommendations.
  - **Neural Network (NN)** performs batched similarity scoring across the entire job catalog using a custom-built feedforward engine.
- **Deep Resume Analysis**: Precision extraction of hard/soft skills, projects, work history, and education.
- **Multimodal Smart OCR**: Seamlessly processes both text-based and scanned image-heavy PDFs using Gemini's vision capabilities.
- **Visual Career Scorecard**: Dynamic gauge and bar charts representing Technical, Experience, and Presentation scores.
- **Role Detail Dashboard**: Interactive centered modal for deep-diving into job requirements, match percentages, and gap analysis.
- **Professional Resume Summary**: AI-generated executive summaries that highlight the candidate's unique value proposition.

## 🚀 Tech Stack

### Frontend & Core
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion 11+
- **Icons**: Lucide React
- **PDF Processing**: PDF.js + Multimodal Fallback

### Artificial Intelligence & ML
- **LLM Reasoning**: [Google Gemini 2.0 Flash](https://aistudio.google.com/)
- **Match Engine**: Custom NumPy-Native MLP (Multi-Layer Perceptron)
- **ML Microservice**: FastAPI + Uvicorn (Python 3.14+)
- **Architecture**: 4-Layer Dense Network with Manual Backpropagation

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 20+
- Python 3.10+
- Google Gemini API Key

### 2. Installation
```bash
# Clone the repository
cd ainn_sla

# Install Frontend Dependencies
npm install

# Setup ML Service (Python)
cd ml_service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Training the Neural Network
The model must be trained locally using the custom backprop script:
```bash
cd ml_service
python train_model.py
```

### 4. Running the Complete System
You need **two** terminals running simultaneously:

**Terminal 1: ML Proxy & Web Frontend**
```bash
npm run dev
```

**Terminal 2: Neural Network Service**
```bash
cd ml_service
python -m uvicorn main:app --port 8000
```

## 📄 Environment Configuration
Create a `.env.local` in the root:
```env
GEMINI_API_KEY=your_gemini_key
ML_SERVICE_URL=http://localhost:8000
```

---
Developed with focus on **Design Aesthetics** and **AI Precision**.
