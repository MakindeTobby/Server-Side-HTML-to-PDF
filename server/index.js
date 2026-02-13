import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
const pdfStore = new Map();

// Helper function to convert image to base64
function getBase64Image(imagePath) {
  const image = fs.readFileSync(imagePath);
  return `data:image/png;base64,${image.toString("base64")}`;
}

// Header template generator
function getHeaderTemplate(logoBase64, companyData) {
  //  border-bottom: 3px solid #2c3e50;
  return `
    <div style="
      width: 100%;
      padding: 10px 20mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
     
      font-size: 9px;
      color: #2c3e50;
      background: white;
    ">
      <div style="display: flex; align-items: center;">
        <img src="${logoBase64}" 
             style="height: 40px; margin-right: 15px; object-fit: contain;" />
        <div>
          <div style="font-weight: 700; font-size: 12px; color: #2c3e50;">
            ${companyData.name || "Support Services Pty Ltd"}
          </div>
          <div style="color: #666; font-size: 8px;">
            ABN: ${companyData.abn || "12 345 678 901"}
          </div>
        </div>
      </div>
      <div style="text-align: right; color: #666; font-size: 8px;">
        <div>${companyData.address || "Level 5, 123 Example Street"}</div>
        <div>${companyData.city || "Sydney NSW 2000"}</div>
        <div>Phone: ${companyData.phone || "(02) 1234 5678"}</div>
      </div>
    </div>
  `;
}

app.post("/api/pdf", async (req, res) => {
  try {
    const data = req.body;

    const templateDir = path.join(process.cwd(), "templates");
    const htmlPath = path.join(templateDir, "service-agreement.html");
    const cssPath = path.join(templateDir, "service-agreement.css");

    const html = fs.readFileSync(htmlPath, "utf8");
    const css = fs.readFileSync(cssPath, "utf8");

    // Convert logo to base64
    const logoBase64 = fs
      .readFileSync(path.join(process.cwd(), "assets/logo.base64.txt"), "utf8")
      .trim();

    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    // const logoPath = path.join(process.cwd(), "assets/logo.png");
    // const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;

    // Compile HTML with data
    const template = handlebars.compile(html);
    let finalHtml = template(data);

    // Inject CSS into <head>
    finalHtml = finalHtml.replace("</head>", `<style>${css}</style></head>`);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      //   margin: {
      //     top: "20mm",
      //     bottom: "25mm", // Room for footer
      //     left: "20mm",
      //     right: "20mm",
      //   },
      margin: {
        top: "35mm", // ← Increased from 30mm to 35mm
        bottom: "25mm",
        left: "20mm",
        right: "20mm",
      },
      displayHeaderFooter: true,
      headerTemplate: getHeaderTemplate(logoDataUrl, {
        name: data.companyName || "Support Services Pty Ltd",
        abn: data.companyABN || "12 345 678 901",
        address: data.companyAddress || "Level 5, 123 Example Street",
        city: data.companyCity || "Sydney NSW 2000",
        phone: data.companyPhone || "(02) 1234 5678",
      }),

      // Dynamic footer with page numbers
      footerTemplate: `
        <div style="
          width: 100%;
          font-size: 9px;
          padding: 5px 0;
          color: #666;
          text-align: center;
          border-top: 1px solid #dee2e6;
          margin: 0 20mm;
        ">
          <span style="font-weight: 600;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </span>
          <span style="margin: 0 10px;">|</span>
          <span>Service Agreement ${
            data.agreementNumber || "SA-2026-001"
          }</span>
          <span style="margin: 0 10px;">|</span>
          <span>Support Services Pty Ltd</span>
        </div>
      `,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   'attachment; filename="service-agreement.pdf"'
    // );
    res.setHeader(
      "Content-Disposition",
      'inline; filename="service-agreement.pdf"'
    );
    const id = crypto.randomUUID();
    pdfStore.set(id, pdf);

    res.json({ id });

    // res.send(pdf);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    res
      .status(500)
      .json({ error: "PDF generation failed", details: err.message });
  }
});
app.get("/api/pdf/:id", (req, res) => {
  const pdf = pdfStore.get(req.params.id);
  if (!pdf) return res.status(404).send("Not found");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "inline; filename=service-agreement.pdf"
  );
  res.send(pdf);
});
app.listen(4000, () => {
  console.log("PDF server running on http://localhost:4000");
});
