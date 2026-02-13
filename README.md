
**Server-Side HTML-to-PDF Microservice with Puppeteer & Handlebars (Node.js + Vite)**

### **Description:**

A dynamic PDF generation microservice using **Node.js, Express, Puppeteer, and Handlebars**, integrated with a Vite frontend for real-time document rendering and preview.

The system compiles HTML templates with dynamic data, injects custom CSS, embeds branded assets as Base64, and generates production-ready A4 PDFs with structured headers, footers, and automatic page numbering.

Instead of sending raw binary responses immediately, the service generates a unique document ID and temporarily stores the PDF in memory for controlled retrieval via a secondary endpoint — enabling better client-side preview and download workflows.

**Technical Highlights:**

* Server-side HTML templating with Handlebars
* Headless Chromium rendering via Puppeteer
* Dynamic header/footer injection with page numbering
* Base64-embedded assets for consistent rendering
* In-memory document caching with UUID mapping
* Proper MIME + Content-Disposition handling (inline preview support)
* RESTful document retrieval flow (`POST → ID → GET PDF`)

This project demonstrates backend architecture design, document automation, browser rendering control, and scalable file delivery patterns.

