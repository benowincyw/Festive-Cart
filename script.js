// ============================================================



// FESTIVE CART - COMPLETE CODE.GS



// INVENTORY + PAYMENT + WHATSAPP FIX



// ============================================================



// ============================================================



// SETTINGS



// ============================================================



const SPREADSHEET_ID =



  "1ZbxHNvBjgglFY4kQe48921gD4Wtk0ylJnfj3K7mhwp8";



const SHEET_NAME =



  "Sheet1";



const PRODUCTS_SPREADSHEET_ID =



  "1VraToG9-EcsUCa4yHpGZyLeJhlT2IlbO7_6rxD1QPRo";



const UPI_ID =



  "benowincyw-1@okaxis";



const BUSINESS_NAME =



  "Festive Cart";



const BUSINESS_WHATSAPP =



  "918015337696";



const WEB_APP_URL =



  "https://script.google.com/macros/s/AKfycbwtXCf4FvtaCEoKQH9PvXfwWc1Xa1UNLa_dcK5I1c11IJiolxfuybQCBqZ2OHtSy4ufDA/exec";



// Public product catalogue cache duration.

const CATALOGUE_CACHE_SECONDS = 60;



// ============================================================



// ORDERS SHEET



// ============================================================



function getOrderSheet() {



  const spreadsheet =



    SpreadsheetApp.openById(



      SPREADSHEET_ID



    );



  const sheet =



    spreadsheet.getSheetByName(



      SHEET_NAME



    );



  if (!sheet) {



    throw new Error(



      "Orders sheet not found."



    );



  }



  return sheet;



}



// ============================================================



// PRODUCTS SPREADSHEET



// ============================================================



function getProductsSpreadsheet() {



  return SpreadsheetApp.openById(



    PRODUCTS_SPREADSHEET_ID



  );



}



// ============================================================



// HELPERS



// ============================================================



function normalizeProductNo(value) {



  return String(value || "")



    .trim()



    .toUpperCase();



}



function escapeHtml(value) {



  return String(value || "")



    .replace(



      /&/g,



      "&amp;"



    )



    .replace(



      /</g,



      "&lt;"



    )



    .replace(



      />/g,



      "&gt;"



    )



    .replace(



      /"/g,



      "&quot;"



    )



    .replace(



      /'/g,



      "&#039;"



    );



}



// ============================================================



// DRIVE IMAGE LINK



// ============================================================



function convertDriveImageLink(link) {



  link =



    String(link || "").trim();



  if (!link) {



    return "";



  }



  let match =



    link.match(



      /\/file\/d\/([a-zA-Z0-9_-]+)/



    );



  if (!match) {



    match =



      link.match(



        /[?&]id=([a-zA-Z0-9_-]+)/



      );



  }



  if (!match) {



    return link;



  }



  return (



    "https://drive.google.com/thumbnail?id=" +



    encodeURIComponent(



      match[1]



    ) +



    "&sz=w600"



  );



}



// ============================================================



// MULTIPLE PRODUCT IMAGE LINKS



// One image link per line in Column B



// ============================================================



function parseProductImageLinks(value) {



  return String(value || "")



    .split(/\r?\n/)



    .map(function (link) {



      return String(link || "").trim();



    })



    .filter(function (link) {



      return link !== "";



    })



    .map(function (link) {



      return convertDriveImageLink(link);



    });



}



// ============================================================



// PRODUCT CATALOGUE



// ============================================================



function getProductCatalogue() {



  const spreadsheet =



    getProductsSpreadsheet();



  const products = [];



  spreadsheet



    .getSheets()



    .forEach(function (sheet) {



      const lastRow =



        sheet.getLastRow();



      if (lastRow < 2) {



        return;



      }



      // B:K



      const rows =



        sheet



          .getRange(



            2,



            2,



            lastRow - 1,



            10



          )



          .getValues();



      rows.forEach(



        function (row, index) {



          const imageLinks =

            parseProductImageLinks(

              row[0]

            );



          const productNo =



            normalizeProductNo(



              row[1]



            );



          const productName =



            String(



              row[2] || ""



            ).trim();



          const description =



            String(



              row[3] || ""



            ).trim();



          const actualPrice =



            Number(



              row[4]



            ) || 0;



          const offerPrice =



            Number(



              row[5]



            ) || 0;



          const stockQuantity =



            Number(



              row[6]



            ) || 0;



          const orderedQty =



            Number(



              row[7]



            ) || 0;



          const availableQty =



            Math.max(



              0,



              Number(



                row[8]



              ) || 0



            );



          const stockStatus =



            String(



              row[9] || ""



            )



              .trim()



              .toUpperCase();



          if (



            !productNo ||



            !productName



          ) {



            return;



          }



          products.push({



            category:



              sheet.getName(),



            sheetName:



              sheet.getName(),



            row:



              index + 2,



            imageURL:

              imageLinks.length > 0

                ? imageLinks[0]

                : "",

            imageURLs:

              imageLinks,



            productNo:



              productNo,



            productName:



              productName,



            description:



              description,



            actualPrice:



              actualPrice,



            offerPrice:



              offerPrice,



            stockQuantity:



              stockQuantity,



            orderedQty:



              orderedQty,



            availableQty:



              availableQty,



            stockStatus:



              stockStatus



          });



        }



      );



    });



  return products;



}



// ============================================================



// PRODUCT MAP



// ============================================================



function getProductMap() {



  const map = {};



  getProductCatalogue()



    .forEach(function (product) {



      if (



        map[



          product.productNo



        ]



      ) {



        throw new Error(



          "Duplicate Product No. found: " +



          product.productNo



        );



      }



      map[



        product.productNo



      ] = product;



    });



  return map;



}



// ============================================================



// PUBLIC PRODUCT RESPONSE



// ============================================================



function createCatalogueResponse() {

  try {

    const cache =

      CacheService.getScriptCache();

    const cacheKey =

      "FESTIVE_CART_PUBLIC_CATALOGUE_V1";

    const cachedJSON =

      cache.get(cacheKey);

    // If a recent catalogue is already cached, return it
    // without opening and reading the Products spreadsheet again.

    if (cachedJSON) {

      return ContentService

        .createTextOutput(cachedJSON)

        .setMimeType(

          ContentService.MimeType.JSON

        );

    }

    const categories =

      getProductsSpreadsheet()

        .getSheets()

        .map(function (sheet) {

          return sheet.getName();

        });

    const products =

      getProductCatalogue()

        .map(function (product) {

          return {

            category:

              product.category,

            productNo:

              product.productNo,

            productName:

              product.productName,

            description:

              product.description,

            actualPrice:

              product.actualPrice,

            offerPrice:

              product.offerPrice,

            availableQty:

              product.availableQty,

            stockStatus:

              product.availableQty > 0

                ? "IN STOCK"

                : "OUT OF STOCK",

            imageURL:

              product.imageURL,

            imageURLs:

              product.imageURLs

          };

        });

    const responseJSON =

      JSON.stringify({

        success: true,

        categories:

          categories,

        products:

          products

      });

    // Keep the public catalogue for 60 seconds. Checkout still
    // performs its own live inventory verification on the server.

    cache.put(

      cacheKey,

      responseJSON,

      CATALOGUE_CACHE_SECONDS

    );

    return ContentService

      .createTextOutput(responseJSON)

      .setMimeType(

        ContentService.MimeType.JSON

      );

  } catch (error) {

    return ContentService

      .createTextOutput(

        JSON.stringify({

          success: false,

          error:

            String(

              error.message ||

              error

            ),

          categories: [],

          products: []

        })

      )

      .setMimeType(

        ContentService.MimeType.JSON

      );

  }

}



// ============================================================



// PARSE PRODUCT DATA



// Example: WR001:2|WR002:1



// ============================================================



function parseProductData(text) {



  text =



    String(text || "").trim();



  if (!text) {



    throw new Error(



      "No products were supplied."



    );



  }



  const combined = {};



  text



    .split("|")



    .forEach(function (entry) {



      const parts =



        entry.split(":");



      if (



        parts.length !== 2



      ) {



        throw new Error(



          "Invalid product data."



        );



      }



      const productNo =



        normalizeProductNo(



          parts[0]



        );



      const quantity =



        Number(



          parts[1]



        );



      if (



        !productNo ||



        !Number.isInteger(



          quantity



        ) ||



        quantity <= 0



      ) {



        throw new Error(



          "Invalid product quantity."



        );



      }



      combined[



        productNo



      ] =



        (



          combined[



            productNo



          ] || 0



        ) +



        quantity;



    });



  return Object



    .keys(combined)



    .map(function (productNo) {



      return {



        productNo:



          productNo,



        quantity:



          combined[



            productNo



          ]



      };



    });



}



// ============================================================



// CUSTOMER VALIDATION



// ============================================================



function validateCustomerData(data) {



  const name =



    String(



      data.name || ""



    ).trim();



  const mobile =



    String(



      data.mobile || ""



    )



      .replace(



        /\D/g,



        ""



      );



  const address =



    String(



      data.address || ""



    ).trim();



  const city =



    String(



      data.city || ""



    ).trim();



  const pincode =



    String(



      data.pincode || ""



    )



      .replace(



        /\D/g,



        ""



      );



  if (!name) {



    throw new Error(



      "Please enter your name."



    );



  }



  if (



    mobile.length !== 10



  ) {



    throw new Error(



      "Please enter a valid 10-digit mobile number."



    );



  }



  if (!address) {



    throw new Error(



      "Please enter your delivery address."



    );



  }



  if (!city) {



    throw new Error(



      "Please enter your city."



    );



  }



  if (



    pincode.length !== 6



  ) {



    throw new Error(



      "Please enter a valid 6-digit pincode."



    );



  }



  return {



    name:



      name,



    mobile:



      mobile,



    address:



      address,



    city:



      city,



    pincode:



      pincode



  };



}



// ============================================================



// ORDER ID



// ============================================================



function createOrderId() {



  return (



    "FC" +



    Utilities.formatDate(



      new Date(),



      Session.getScriptTimeZone(),



      "yyyyMMddHHmmss"



    ) +



    Utilities



      .getUuid()



      .substring(



        0,



        4



      )



      .toUpperCase()



  );



}



// ============================================================



// DUPLICATE SUBMISSION KEY



// ============================================================



function getSubmissionPropertyKey(



  submissionId



) {



  return (



    "ORDER_" +



    String(



      submissionId || ""



    ).trim()



  );



}




// ============================================================
// SHIPPING & PACKING
// Server-side authoritative calculation
// ============================================================

function getShippingCharge(subtotal) {
  subtotal = Number(subtotal) || 0;

  if (subtotal <= 0) return 0;
  if (subtotal < 500) return 79;
  if (subtotal < 1000) return 99;
  if (subtotal < 2000) return 129;

  return 149;
}

// ============================================================



// CREATE ORDER



// ============================================================



function createOrderOnServer(data) {



  const lock =



    LockService



      .getScriptLock();



  try {



    lock.waitLock(



      30000



    );



    const submissionId =



      String(



        data.submissionId || ""



      ).trim();



    if (!submissionId) {



      throw new Error(



        "Invalid checkout submission."



      );



    }



    const properties =



      PropertiesService



        .getScriptProperties();



    const propertyKey =



      getSubmissionPropertyKey(



        submissionId



      );



    const previous =



      properties.getProperty(



        propertyKey



      );



    // Same checkout already created.



    if (previous) {



      return JSON.parse(



        previous



      );



    }



    const customer =



      validateCustomerData(



        data



      );



    const requested =



      parseProductData(



        data.productData



      );



    // Ensure current inventory values.



    recalculateInventory();



    SpreadsheetApp.flush();



    const productMap =



      getProductMap();



    const verified = [];



    let subtotal = 0;



    requested.forEach(



      function (request) {



        const product =



          productMap[



            request.productNo



          ];



        if (!product) {



          throw new Error(



            "Product " +



            request.productNo +



            " is no longer available."



          );



        }



        if (



          product.offerPrice <= 0



        ) {



          throw new Error(



            product.productName +



            " has an invalid selling price."



          );



        }



        if (



          product.availableQty <= 0



        ) {



          throw new Error(



            product.productName +



            " is currently out of stock."



          );



        }



        if (



          request.quantity >



          product.availableQty



        ) {



          throw new Error(



            "Only " +



            product.availableQty +



            " item(s) of " +



            product.productName +



            " are currently available."



          );



        }



        const lineTotal =



          product.offerPrice *



          request.quantity;



        subtotal +=

          lineTotal;



        verified.push({



          productNo:



            product.productNo,



          productName:



            product.productName,



          quantity:



            request.quantity,



          price:



            product.offerPrice,



          lineTotal:



            lineTotal



        });



      }



    );



    if (

      !Number.isFinite(subtotal) ||

      subtotal <= 0

    ) {

      throw new Error(

        "Invalid order total."

      );

    }

    const shipping =
      getShippingCharge(subtotal);

    const total =
      subtotal + shipping;



    const readableProducts =



      verified



        .map(function (item) {



          return (



            item.productName +



            " x " +



            item.quantity +



            " = ₹" +



            item.lineTotal.toFixed(2)



          );



        })



        .join(" | ") +

        " | Product Subtotal = ₹" +

        subtotal.toFixed(2) +

        " | Shipping & Packing = ₹" +

        shipping.toFixed(2);



    const productData =



      verified



        .map(function (item) {



          return (



            item.productNo +



            ":" +



            item.quantity



          );



        })



        .join("|");



    const orderId =



      createOrderId();



    const dateTime =



      Utilities.formatDate(



        new Date(),



        Session.getScriptTimeZone(),



        "dd/MM/yyyy HH:mm:ss"



      );



    const orderSheet =



      getOrderSheet();



    orderSheet.appendRow([



      orderId,                 // A Order ID



      dateTime,                // B Date & Time



      customer.name,           // C Customer Name



      customer.mobile,         // D Mobile Number



      customer.address,        // E Address



      customer.city,           // F City



      customer.pincode,        // G Pincode



      readableProducts,        // H Products



      total,                   // I Total Amount



      "",                      // J Order Status



      "",                      // K Tracking ID



      "",                      // L Payment Link



      "",                      // M Send



      productData              // N Product Data



    ]);



    const row =



      orderSheet.getLastRow();



    const paymentURL =



      WEB_APP_URL +



      "?order=" +



      encodeURIComponent(



        orderId



      );



    orderSheet



      .getRange(



        row,



        12



      )



      .setFormula(



        '=HYPERLINK("' +



        paymentURL +



        '","PAY ₹' +



        total.toFixed(2) +



        '")'



      );



    recalculateInventory();



    SpreadsheetApp.flush();



    const result = {



      success: true,



      orderId:



        orderId,



      subtotal:

        subtotal,

      shipping:

        shipping,

      total:

        total,



      paymentURL:



        paymentURL,



      customer:



        customer,



      products:



        verified



    };



    // Store successful submission.



    properties.setProperty(



      propertyKey,



      JSON.stringify(



        result



      )



    );



    return result;



  } catch (error) {



    return {



      success: false,



      error:



        String(



          error.message ||



          error



        )



    };



  } finally {



    try {



      lock.releaseLock();



    } catch (ignore) {



    }



  }



}



// ============================================================



// INVENTORY RECALCULATION



// ============================================================



function recalculateInventory() {



  const orderSheet =



    getOrderSheet();



  const orderedTotals = {};



  const lastOrderRow =



    orderSheet.getLastRow();



  if (



    lastOrderRow >= 2



  ) {



    // J:N



    const rows =



      orderSheet



        .getRange(



          2,



          10,



          lastOrderRow - 1,



          5



        )



        .getDisplayValues();



    rows.forEach(



      function (row) {



        const status =



          String(



            row[0] || ""



          )



            .trim()



            .toLowerCase();



        const productData =



          String(



            row[4] || ""



          ).trim();



        // Cancelled orders release inventory.



        if (



          status ===



          "cancelled"



        ) {



          return;



        }



        // Old orders without Product Data



        // cannot be counted automatically.



        if (!productData) {



          return;



        }



        try {



          const items =



            parseProductData(



              productData



            );



          items.forEach(



            function (item) {



              orderedTotals[



                item.productNo



              ] =



                (



                  orderedTotals[



                    item.productNo



                  ] || 0



                ) +



                item.quantity;



            }



          );



        } catch (error) {



          console.log(



            "Invalid Product Data skipped: " +



            productData



          );



        }



      }



    );



  }



  const productSpreadsheet =



    getProductsSpreadsheet();



  productSpreadsheet



    .getSheets()



    .forEach(function (sheet) {



      const lastRow =



        sheet.getLastRow();



      if (



        lastRow < 2



      ) {



        return;



      }



      // Column C = Product No.



      const productNumbers =



        sheet



          .getRange(



            2,



            3,



            lastRow - 1,



            1



          )



          .getDisplayValues();



      const orderedValues =



        productNumbers.map(



          function (row) {



            const productNo =



              normalizeProductNo(



                row[0]



              );



            return [



              productNo



                ? (



                    orderedTotals[



                      productNo



                    ] || 0



                  )



                : 0



            ];



          }



        );



      // Column I = Ordered Qty (Auto)



      sheet



        .getRange(



          2,



          9,



          orderedValues.length,



          1



        )



        .setValues(



          orderedValues



        );



    });



  SpreadsheetApp.flush();



}



// ============================================================



// POST - CUSTOMER CHECKOUT



// ============================================================



function doPost(e) {



  try {



    if (



      !e ||



      !e.parameter ||



      e.parameter.action !==



        "placeOrder"



    ) {



      return createCheckoutErrorPage(



        "Invalid order request."



      );



    }



    const orderData =



      JSON.parse(



        String(



          e.parameter.orderData ||



          "{}"



        )



      );



    const result =



      createOrderOnServer(



        orderData



      );



    if (



      !result.success



    ) {



      return createCheckoutErrorPage(



        result.error



      );



    }



    return createOrderSuccessPage(



      result



    );



  } catch (error) {



    return createCheckoutErrorPage(



      String(



        error.message ||



        error



      )



    );



  }



}



// ============================================================



// SUCCESS PAGE



// ============================================================



function createOrderSuccessPage(



  result



) {



  const orderId =



    String(



      result.orderId || ""



    );



  const subtotal =
    Number(
      result.subtotal
    ).toFixed(2);

  const shipping =
    Number(
      result.shipping
    ).toFixed(2);

  const total =
    Number(
      result.total
    ).toFixed(2);



  let productText = "";



  result.products.forEach(



    function (item) {



      productText +=



        item.productName +



        " (" +



        item.productNo +



        ") x " +



        item.quantity +



        " - ₹" +



        Number(



          item.lineTotal



        ).toFixed(2) +



        "\n";



    }



  );



  // ==========================================================



  // CUSTOMER -> BUSINESS WHATSAPP MESSAGE



  // ==========================================================



  let whatsappMessage =



    "FESTIVE CART - NEW ORDER\n\n";



  whatsappMessage +=



    "Order ID: " +



    orderId +



    "\n\n";



  whatsappMessage +=



    "Customer Name: " +



    result.customer.name +



    "\n";



  whatsappMessage +=



    "Mobile: " +



    result.customer.mobile +



    "\n";



  whatsappMessage +=



    "Address: " +



    result.customer.address +



    "\n";



  whatsappMessage +=



    "City: " +



    result.customer.city +



    "\n";



  whatsappMessage +=



    "Pincode: " +



    result.customer.pincode +



    "\n\n";



  whatsappMessage +=



    "ORDER DETAILS\n\n";



  whatsappMessage +=



    productText;



  whatsappMessage +=
    "\nProduct Subtotal: ₹" +
    subtotal;

  whatsappMessage +=
    "\nShipping & Packing: ₹" +
    shipping;

  whatsappMessage +=
    "\nTotal Amount: ₹" +
    total;



  whatsappMessage +=



    "\n\nOrder submitted successfully.";



  // ==========================================================



  // WHATSAPP URL



  //



  // We use api.whatsapp.com here and explicitly open it in



  // another browser tab/window.



  // ==========================================================



  const whatsappURL =



    "https://api.whatsapp.com/send" +



    "?phone=" +



    encodeURIComponent(



      BUSINESS_WHATSAPP



    ) +



    "&text=" +



    encodeURIComponent(



      whatsappMessage



    );



  const safeWhatsAppURL =



    escapeHtml(



      whatsappURL



    );



  const html = `



<!DOCTYPE html>



<html>



<head>



<meta



  name="viewport"



  content="width=device-width, initial-scale=1"



>



<title>



Festive Cart - Order Confirmed



</title>



<style>



* {



  box-sizing: border-box;



}



body {



  margin: 0;



  padding: 22px 15px;



  background: #f5f5f5;



  font-family:



    Arial,



    Helvetica,



    sans-serif;



  color: #222;



}



.box {



  width: 100%;



  max-width: 450px;



  margin: 20px auto;



  padding: 28px 20px;



  background: #ffffff;



  border-radius: 18px;



  box-shadow:



    0 4px 18px



    rgba(0,0,0,0.10);



  text-align: center;



}



.tick {



  width: 70px;



  height: 70px;



  margin:



    0 auto 18px;



  border-radius: 50%;



  background: #11823b;



  color: #ffffff;



  display: flex;



  align-items: center;



  justify-content: center;



  font-size: 38px;



  font-weight: bold;



}



h1 {



  margin:



    0 0 10px;



  color: #c62828;



  font-size: 27px;



}



.success-title {



  margin-top: 18px;



  font-size: 21px;



  font-weight: bold;



}



.order-info {



  margin-top: 22px;



  padding: 18px;



  background: #f7f7f7;



  border-radius: 12px;



}



.label {



  color: #666;



  font-size: 13px;



  margin-bottom: 5px;



}



.value {



  margin-bottom: 16px;



  font-size: 17px;



  font-weight: bold;



}



.amount {



  font-size: 30px;



  font-weight: bold;



}



.whatsapp-button {



  display: block;



  width: 100%;



  margin-top: 22px;



  padding: 16px 12px;



  border: none;



  border-radius: 10px;



  background: #11823b;



  color: #ffffff;



  text-decoration: none;



  font-size: 17px;



  font-weight: bold;



  cursor: pointer;



}



.whatsapp-button:hover {



  opacity: 0.92;



}



.copy-box {



  margin-top: 18px;



  padding: 14px;



  background: #f5f5f5;



  border-radius: 10px;



}



.copy-title {



  margin-bottom: 8px;



  color: #666;



  font-size: 13px;



}



.number {



  font-size: 16px;



  font-weight: bold;



}



.note {



  margin-top: 20px;



  color: #666;



  font-size: 13px;



  line-height: 1.6;



}



</style>



</head>



<body>



<div class="box">



<div class="tick">



✓



</div>



<h1>



FESTIVE CART



</h1>



<div class="success-title">



Order submitted successfully



</div>



<div class="order-info">



<div class="label">



Order ID



</div>



<div class="value">



${escapeHtml(orderId)}



</div>



<div class="label">
Product Subtotal
</div>
<div class="value">
₹${escapeHtml(subtotal)}
</div>

<div class="label">
Shipping & Packing
</div>
<div class="value">
₹${escapeHtml(shipping)}
</div>

<div class="label">
Total Amount
</div>
<div class="amount">
₹${escapeHtml(total)}
</div>



</div>



<a



  class="whatsapp-button"



  href="${safeWhatsAppURL}"



  target="_blank"



  rel="noopener noreferrer"



>



SEND ORDER ON WHATSAPP



</a>



<div class="copy-box">



<div class="copy-title">



Festive Cart WhatsApp Number



</div>



<div class="number">



+91 80153 37696



</div>



</div>



<div class="note">



<strong>



Your order has already been recorded.



</strong>



<br><br>



Do not place the order again.



<br><br>



Tap



<strong>



SEND ORDER ON WHATSAPP



</strong>



to send your confirmed order details to Festive Cart.



<br><br>



If WhatsApp does not open automatically,



open WhatsApp manually and contact



<strong>



8015337696



</strong>.



</div>



</div>



</body>



</html>



  `;



  return HtmlService



    .createHtmlOutput(



      html



    )



    .setTitle(



      "Festive Cart - Order Confirmed"



    );



}



// ============================================================



// CHECKOUT / PAYMENT ERROR PAGE



// ============================================================



function createCheckoutErrorPage(



  message



) {



  const html = `



<!DOCTYPE html>



<html>



<head>



<meta



  name="viewport"



  content="width=device-width, initial-scale=1"



>



<title>



Festive Cart



</title>



</head>



<body style="



margin:0;



padding:25px 15px;



background:#f5f5f5;



font-family:Arial,Helvetica,sans-serif;



">



<div style="



max-width:450px;



margin:30px auto;



padding:28px 20px;



background:#ffffff;



border-radius:16px;



text-align:center;



box-shadow:0 4px 18px rgba(0,0,0,.1);



">



<h2 style="



color:#c62828;



">



FESTIVE CART



</h2>



<h3>



Unable to continue



</h3>



<p style="



line-height:1.6;



color:#555;



">



${escapeHtml(message)}



</p>



<p style="



font-size:13px;



color:#777;



line-height:1.5;



">



Please return to Festive Cart and check the order details.



</p>



</div>



</body>



</html>



  `;



  return HtmlService



    .createHtmlOutput(



      html



    )



    .setTitle(



      "Festive Cart"



    );



}



// ============================================================



// FIND ORDER



// ============================================================



function findOrderById(



  orderId



) {



  const sheet =



    getOrderSheet();



  const lastRow =



    sheet.getLastRow();



  if (



    lastRow < 2



  ) {



    return null;



  }



  const values =



    sheet



      .getRange(



        2,



        1,



        lastRow - 1,



        10



      )



      .getValues();



  for (



    let i = 0;



    i < values.length;



    i++



  ) {



    if (



      String(



        values[i][0]



      ).trim() ===



      orderId



    ) {



      return {



        row:



          i + 2,



        orderId:



          orderId,



        total:



          Number(



            values[i][8]



          ) || 0,



        status:



          String(



            values[i][9] || ""



          ).trim()



      };



    }



  }



  return null;



}



// ============================================================



// GET



// ============================================================



function doGet(e) {



  try {



    const action =



      String(



        e.parameter.action || ""



      )



        .trim()



        .toLowerCase();



    if (



      action ===



      "products"



    ) {



      return createCatalogueResponse();



    }



    const orderId =



      String(



        e.parameter.order || ""



      ).trim();



    if (!orderId) {



      return createCheckoutErrorPage(



        "Invalid payment link."



      );



    }



    const order =



      findOrderById(



        orderId



      );



    if (!order) {



      return createCheckoutErrorPage(



        "Order not found."



      );



    }



    if (



      order.status



        .toLowerCase() ===



      "cancelled"



    ) {



      return createCheckoutErrorPage(



        "This order has been cancelled. Payment is no longer available."



      );



    }



    return createPaymentPage(



      order



    );



  } catch (error) {



    return createCheckoutErrorPage(



      "Unable to open the requested page."



    );



  }



}



// ============================================================



// PAYMENT PAGE



// ============================================================



function createPaymentPage(



  order



) {



  const amount =



    Number(



      order.total



    ).toFixed(2);



  const upiURL =



    "upi://pay" +



    "?pa=" +



    encodeURIComponent(



      UPI_ID



    ) +



    "&pn=" +



    encodeURIComponent(



      BUSINESS_NAME



    ) +



    "&am=" +



    encodeURIComponent(



      amount



    ) +



    "&cu=INR" +



    "&tn=" +



    encodeURIComponent(



      "Festive Cart Order " +



      order.orderId



    );



  const qrURL =



    "https://quickchart.io/qr" +



    "?size=280" +



    "&text=" +



    encodeURIComponent(



      upiURL



    );



  const html = `



<!DOCTYPE html>



<html>



<head>



<meta



  name="viewport"



  content="width=device-width, initial-scale=1"



>



<title>



Festive Cart Payment



</title>



<style>



* {



  box-sizing: border-box;



}



body {



  margin: 0;



  padding: 20px 15px;



  background: #f5f5f5;



  font-family:



    Arial,



    Helvetica,



    sans-serif;



  text-align: center;



  color: #222;



}



.box {



  width: 100%;



  max-width: 450px;



  margin: 10px auto;



  padding: 28px 22px;



  background: #ffffff;



  border-radius: 18px;



  box-shadow:



    0 4px 20px



    rgba(0,0,0,.10);



}



h1 {



  color: #c62828;



}



.amount {



  margin:



    15px 0 22px;



  font-size: 38px;



  font-weight: bold;



}



.pay {



  display: block;



  width: 100%;



  padding: 16px;



  background: #1677ff;



  color: #ffffff;



  text-decoration: none;



  border-radius: 10px;



  font-size: 17px;



  font-weight: bold;



}



.qr {



  width: 240px;



  max-width: 100%;



  height: auto;



  margin-top: 25px;



}



.help {



  margin-top: 15px;



  padding: 13px;



  background: #f5f5f5;



  border-radius: 9px;



  color: #555;



  font-size: 14px;



  line-height: 1.5;



}



.upi {



  margin-top: 25px;



  padding: 15px;



  background: #f5f5f5;



  border-radius: 9px;



  font-weight: bold;



}



.copy-button {



  margin-top: 12px;



  padding: 10px 16px;



  cursor: pointer;



}



</style>



</head>



<body>



<div class="box">



<h1>



FESTIVE CART



</h1>



<p>



Order ID



</p>



<strong>



${escapeHtml(order.orderId)}



</strong>



<div class="amount">



₹${escapeHtml(amount)}



</div>



<a



  class="pay"



  href="${escapeHtml(upiURL)}"



>



PAY ₹${escapeHtml(amount)} WITH UPI



</a>



<div class="help">



<strong>



Android



</strong>



<br><br>



Tap the blue button above to open a compatible UPI app.



</div>



<img



  class="qr"



  src="${escapeHtml(qrURL)}"



  alt="UPI Payment QR Code"



>



<div class="help">



<strong>



iPhone



</strong>



<br><br>



Press and hold the QR code,



then choose an available UPI payment app.



</div>



<div class="upi">



UPI ID



<br><br>



<span id="upi">



${escapeHtml(UPI_ID)}



</span>



<br>



<button



  class="copy-button"



  onclick="copyUPI()"



>



COPY UPI ID



</button>



</div>



<div class="help">



Payment is confirmed by Festive Cart



after manual verification.



</div>



</div>



<script>



function copyUPI() {



  var value =



    document



      .getElementById("upi")



      .innerText



      .trim();



  if (



    navigator.clipboard &&



    navigator.clipboard.writeText



  ) {



    navigator.clipboard



      .writeText(value)



      .then(function () {



        alert(



          "UPI ID copied"



        );



      });



  } else {



    prompt(



      "Copy UPI ID:",



      value



    );



  }



}



</script>



</body>



</html>



  `;



  return HtmlService



    .createHtmlOutput(



      html



    )



    .setTitle(



      "Festive Cart Payment"



    );



}



// ============================================================



// ORDER STATUS EDIT TRIGGER



// ============================================================



function updateOrderOnEdit(e) {



  try {



    if (



      !e ||



      !e.range



    ) {



      return;



    }



    const sheet =



      e.range.getSheet();



    if (



      sheet.getName() !==



        SHEET_NAME ||



      sheet



        .getParent()



        .getId() !==



        SPREADSHEET_ID



    ) {



      return;



    }



    const row =



      e.range.getRow();



    const column =



      e.range.getColumn();



    if (



      row < 2



    ) {



      return;



    }



    // J = Order Status



    if (



      column === 10



    ) {



      recalculateInventory();



      createWhatsAppSendLink(



        sheet,



        row



      );



      return;



    }



    // K = Tracking ID



    if (



      column === 11



    ) {



      createWhatsAppSendLink(



        sheet,



        row



      );



      return;



    }



  } catch (error) {



    console.log(



      error



    );



  }



}



// ============================================================



// OWNER -> CUSTOMER WHATSAPP SEND LINK



// ============================================================



function createWhatsAppSendLink(



  sheet,



  row



) {



  const orderId =



    String(



      sheet



        .getRange(



          row,



          1



        )



        .getValue()



    ).trim();



  const customerName =



    String(



      sheet



        .getRange(



          row,



          3



        )



        .getValue()



    ).trim();



  let mobile =



    String(



      sheet



        .getRange(



          row,



          4



        )



        .getDisplayValue()



    )



      .replace(



        /\D/g,



        ""



      );



  const total =



    Number(



      sheet



        .getRange(



          row,



          9



        )



        .getValue()



    );

  const productsText =
    String(
      sheet
        .getRange(
          row,
          8
        )
        .getDisplayValue()
    );

  let subtotal =
    total;

  let shipping =
    0;

  const subtotalMatch =
    productsText.match(
      /Product Subtotal = ₹([0-9,.]+)/
    );

  const shippingMatch =
    productsText.match(
      /Shipping & Packing = ₹([0-9,.]+)/
    );

  if (subtotalMatch) {
    subtotal =
      Number(
        subtotalMatch[1].replace(/,/g, "")
      ) || total;
  }

  if (shippingMatch) {
    shipping =
      Number(
        shippingMatch[1].replace(/,/g, "")
      ) || 0;
  }



  const status =



    String(



      sheet



        .getRange(



          row,



          10



        )



        .getDisplayValue()



    ).trim();



  const trackingId =



    String(



      sheet



        .getRange(



          row,



          11



        )



        .getDisplayValue()



    ).trim();



  const sendCell =



    sheet



      .getRange(



        row,



        13



      );



  if (!status) {



    sendCell.clearContent();



    return;



  }



  if (



    status



      .toLowerCase() ===



      "items are dispatched" &&



    !trackingId



  ) {



    sendCell.setValue(



      "ENTER TRACKING ID"



    );



    return;



  }



  if (



    mobile.length === 10



  ) {



    mobile =



      "91" +



      mobile;



  }



  if (



    mobile.length < 10



  ) {



    sendCell.clearContent();



    return;



  }



  const paymentURL =



    WEB_APP_URL +



    "?order=" +



    encodeURIComponent(



      orderId



    );



  let message =



    "FESTIVE CART\n\n";



  message +=



    "Hello " +



    customerName +



    ",\n\n";



  message +=



    "Order ID: " +



    orderId +



    "\n";



  message +=
    "Product Subtotal: ₹" +
    subtotal.toFixed(2) +
    "\n";

  message +=
    "Shipping & Packing: ₹" +
    shipping.toFixed(2) +
    "\n";

  message +=
    "Total Amount: ₹" +
    total.toFixed(2) +
    "\n\n";



  switch (



    status.toLowerCase()



  ) {



    case "order received":



      message +=



        "Your order has been received and confirmed.\n\n";



      message +=



        "Please pay ₹" +



        total.toFixed(2) +



        " using the payment link below:\n\n";



      message +=



        paymentURL;



      break;



    case "payment received":



      message +=



        "Your payment has been received successfully.\n\n";



      message +=



        "Thank you. We will now process your order.";



      break;



    case "items are packed":



      message +=



        "Your items have been packed successfully.\n\n";



      message +=



        "Your order is ready for dispatch.";



      break;



    case "items are dispatched":



      message +=



        "Your order has been dispatched.\n\n";



      message +=



        "Tracking ID: " +



        trackingId;



      break;



    case "cancelled":



      message +=



        "Your order has been cancelled.\n\n";



      message +=



        "Please contact Festive Cart if you require assistance.";



      break;



    default:



      message +=



        "Order Status: " +



        status;



  }



  message +=



    "\n\nThank you for shopping with Festive Cart!";



  // Use api.whatsapp.com for the Sheet SEND link too.



  const whatsappURL =



    "https://api.whatsapp.com/send" +



    "?phone=" +



    encodeURIComponent(



      mobile



    ) +



    "&text=" +



    encodeURIComponent(



      message



    );



  const formula =



    '=HYPERLINK("' +



    whatsappURL



      .replace(



        /"/g,



        '""'



      ) +



    '","SEND")';



  sendCell.setFormula(



    formula



  );



}



// ============================================================



// MANUAL INVENTORY REBUILD



// ============================================================



function rebuildInventory() {



  recalculateInventory();



}
