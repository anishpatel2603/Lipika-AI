# Lipika AI (लिपिका) — AI Transliteration Agent

> **"See it. Read it. Speak it."**  
> AI-powered English to Hindi transliteration using intelligent text, camera vision, and optical character recognition.

---

## 🌟 Overview

**Lipika AI** is a production-grade full-stack web application that solves an everyday challenge across India: many individuals can fluently speak and understand Hindi, but find it difficult or tiring to read complex English text on signboards, college notices, hospital instructions, transit boards, and restaurant menus.

Unlike standard translation tools that alter word meanings (e.g. changing *"Good Morning"* to *"सुप्रभात"*), Lipika AI performs **true phonetic transliteration** (converting *"Good Morning"* into *"गुड मॉर्निंग"*). This preserves the original English pronunciation in authentic Devanagari script so users can effortlessly pronounce and recognize signs in the real world.

---

## 🚀 Key Features

- **Direct Text Transliteration**: Real-time phonetic mapping into natural Devanagari script.
- **Live Device Camera OCR**: Point your smartphone or laptop webcam at physical signage with real-time viewfinder alignment.
- **Image Upload & Preprocessing**: Drag & drop JPG/PNG/WEBP files with interactive Canvas filters (Grayscale, Contrast Boost, Brightness, Binarization/Thresholding).
- **OCR Text Correction Window**: Review and tweak OCR-extracted text before sending it to the AI agent to catch glare or angle errors.
- **AI Agent Intelligence**:
  - Distinguishes **Transliteration from Translation**.
  - Retains English vocabulary, technical domain terms, brand names, and college titles.
  - Preserves numbers, digits, URLs, emails, and punctuation intact.
  - Code-mixed text (Hinglish) support: leaves existing Hindi script intact while transliterating English words.
- **Export & Accessibility**:
  - One-click Clipboard Copy with visual toast feedback.
  - Download formatted UTF-8 TXT reports.
  - Download Vector PDF documents with authentic Devanagari typography.
  - Web Share API integration.
  - Text-to-Speech ("Speak it"): audio pronunciation in Hindi Devanagari.
- **Local History Archive**: Searchable, source-filtered history stored securely in the browser's LocalStorage.
- **Interactive AI Agent Chat**: Floating conversational assistant to tweak phonetic pronunciations or explain sounds.
- **Presentation Demo Presets**: Pre-loaded authentic Indian signage (Mumbai Highway Sign, Pillai College Department Notice, Campus Gate, Smart Traffic Board) for instant presentation demonstrations without hardware dependencies.

---

## 🏗️ System Architecture

```text
       User (Webcam / Photo / Text Input)
                       │
                       ▼
            Frontend (React + Vite + Tailwind)
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[Canvas Preprocessor]        [REST API Endpoints]
  - Grayscale                 - POST /api/transliterate
  - Contrast Boost            - POST /api/ocr
  - Thresholding              - POST /api/image-transliterate
                              - POST /api/agent-chat
                              - POST /api/tts
                                     │
                                     ▼
                    Express Server (server.ts)
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
[Vision OCR Processor]                                 [TransliterationAgent]
 - Gemini 3.8 Flash Vision                              ├── TextAnalyzer
 - Tesseract.js client fallback                         ├── TextNormalizer
                                                        ├── TransliterationEngine (Gemini 3.8 Flash)
                                                        └── ConfidenceChecker
                                                               │
                                                               ▼
                                                  Hindi Devanagari Output
                                                   ("वेलकम टू मुंबई")
```

---

## 📋 API Documentation

### 1. `POST /api/transliterate`
Converts English/Hinglish text to Devanagari transliteration.
- **Request Body**:
  ```json
  {
    "text": "Welcome to Mumbai",
    "source": "text",
    "options": { "correctOcr": true }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "original": "Welcome to Mumbai",
    "transliteration": "वेलकम टू मुंबई",
    "confidence": 0.98,
    "language": "English / Hinglish",
    "task": "transliteration"
  }
  ```

### 2. `POST /api/ocr`
Extracts text verbatim from a base64 image data URL.
- **Request Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "text": "COMPUTER SCIENCE DEPARTMENT ROOM NO. 204",
    "confidence": 0.94,
    "wordCount": 6
  }
  ```

### 3. `POST /api/image-transliterate`
End-to-end pipeline: executes OCR extraction, normalizes text, and runs the transliteration agent.
- **Response**:
  ```json
  {
    "success": true,
    "detected_text": "Pillai College of Engineering",
    "transliterated_text": "पिल्लई कॉलेज ऑफ इंजीनियरिंग",
    "ocr_confidence": 0.95,
    "transliteration_confidence": 0.97
  }
  ```

### 4. `POST /api/agent-chat`
Conversational refinement with the AI Agent.
- **Request Body**:
  ```json
  {
    "message": "Make this easier to pronounce",
    "originalText": "Artificial Intelligence",
    "currentTransliteration": "आर्टिफिशियल इंटेलिजेंस"
  }
  ```

### 5. `POST /api/tts`
Generates natural Hindi speech audio for the Devanagari text.
- **Response**:
  ```json
  {
    "success": true,
    "audioUrl": "data:audio/wav;base64,..."
  }
  ```

---

## 🧪 Benchmark Test Cases

| English Input | Expected Transliteration | Context / Rule |
| :--- | :--- | :--- |
| `Hello` | **हेलो** | Common greeting |
| `Good Morning` | **गुड मॉर्निंग** | Transliteration (NOT "सुप्रभात") |
| `Welcome to Mumbai` | **वेलकम टू मुंबई** | Transit signage |
| `Artificial Intelligence` | **आर्टिफिशियल इंटेलिजेंस** | Technology term (NOT "कृत्रिम बुद्धिमत्ता") |
| `Computer Science` | **कंप्यूटर साइंस** | Department name (NOT "संगणक विज्ञान") |
| `Pillai College of Engineering` | **पिल्लई कॉलेज ऑफ इंजीनियरिंग** | College campus name |
| `Room No. 204` | **रूम नं. 204** | Preserves digits and room markers |
| `Smart Traffic Management` | **स्मार्ट ट्रैफिक मैनेजमेंट** | Civic signboards |
| `Cyber Security` | **साइबर सिक्योरिटी** | Tech subject |
| `Machine Learning` | **मशीन लर्निंग** | AI field |
| `Technology` | **टेक्नोलॉजी** | Common vocabulary |

---

## 🛠️ Local Installation & Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   PORT=3000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Docker Deployment

The application includes a production-ready `Dockerfile` and `docker-compose.yml`.

Run with Docker Compose:
```bash
docker compose up --build
```
Navigate to `http://localhost:3000`.

---

## 🔒 Privacy & Security
- **Ephemeral Vision Processing**: Camera captures and uploaded photographs are processed in-memory for OCR text extraction and discarded immediately.
- **Client-Side Control**: History is maintained locally on the user's device and can be erased in one click with "Clear All History".
- **Zero Mandatory Login**: Lipika AI is fully functional out of the box without requiring account registration.
