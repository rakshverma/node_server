const htmlToPdf = require("html-pdf");
const generateInvoice = async (orderArr, cartInfo, orderId, deliveryDates, list) => {
  console.log("orderArr = ", orderArr);
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        font-size: 10px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
      }
      .logo {
        max-width: 100px;
        height: auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .invoice-header {
        text-align: left;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      .table th, .table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .shipping-address {
        margin-bottom: 20px;
      }
      .total {
        font-weight: bold;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="invoice-header">
          <img class="logo" src="http://localhost:3005/assets/imgs/jhatkabyte-logo.png" alt="Company Logo">
          <h2>Invoice</h2>
          <p>Order ID: JB${orderId + 1000}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
  
      <table class="table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Delivery Date</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map((item) => {
              const { name, quantity, price, unit, count, delivery_date } = item;
              return `
            <tr>
              <td>${name}</td>
              <td>${delivery_date}</td>
              <td>${quantity}${unit} X ${count}</td>
              <td>${price * count}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
  
      <p class="total">Shipping Cost: ${orderArr[12]}</p>
      <p class="total">Final Price: ${orderArr[1].toFixed(2)}</p>
  
      <div class="shipping-address">
        <h3>Shipping Address:</h3>
        <p>${orderArr[2]}</p>
        <p>Landmark: ${orderArr[11]}</p>
        <p>Phone Number: ${orderArr[9]}</p>
        <p>Additional Notes: ${orderArr[7]}</p>
      </div>
    </div>
  </body>
  </html>
    `;
};

const convertHtmlToPdf = async (html, pdfPath) => {
  const pdfOptions = { format: "Letter" }; // You can adjust the format as needed

  htmlToPdf.create(html, pdfOptions).toFile(pdfPath, (err, res) => {
    if (err) {
      console.error("Error converting HTML to PDF:", err);
    } else {
      console.log("PDF created:", res.filename);
    }
  });
};

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|tr|div|h[1-6]|table)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/₹/g, "Rs. ")
    .replace(/&amp;/g, "&")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function escapePdfText(text) {
  return `${text}`.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdfBuffer(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 42);
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 750 Td",
    "(JhatkaByte Invoice) Tj",
    "/F1 10 Tf",
    "0 -28 Td",
    ...lines.flatMap((line) => [`(${escapePdfText(line.slice(0, 95))}) Tj`, "0 -14 Td"]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}

const convertHtmlToPdfBuffer = async (html) => {
  const pdfOptions = { format: "Letter", timeout: 15000 };

  return new Promise((resolve, reject) => {
    htmlToPdf.create(html, pdfOptions).toBuffer((err, buffer) => {
      if (err) {
        console.log("html-pdf failed, using built-in PDF fallback:", err);
        return resolve(createSimplePdfBuffer(stripHtml(html)));
      }
      resolve(buffer);
    });
  });
};

module.exports = {
  generateInvoice,
  convertHtmlToPdf,
  convertHtmlToPdfBuffer,
};
