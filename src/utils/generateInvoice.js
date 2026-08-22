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

const convertHtmlToPdfBuffer = async (html) => {
  const pdfOptions = { format: "Letter" };

  return new Promise((resolve, reject) => {
    htmlToPdf.create(html, pdfOptions).toBuffer((err, buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
};

module.exports = {
  generateInvoice,
  convertHtmlToPdf,
  convertHtmlToPdfBuffer,
};
