/**
 * ZALVRA Store — Google Apps Script (Database)
 * ============================================
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a new Google Sheet
 * 2. Rename first sheet to "Products"
 * 3. Add a second sheet named "Orders"
 * 4. In the Sheet menu: Extensions → Apps Script
 * 5. Paste this entire code and Save
 * 6. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the Web App URL
 * 8. Paste it in Admin Portal → Google Sheets Database
 *
 * PRODUCTS sheet headers (row 1):
 * id | name | price | oldPrice | cat | emoji | rating | desc | images
 *
 * images: pipe-separated image URLs (e.g. https://i.ibb.co/xxx.jpg|https://i.ibb.co/yyy.jpg)
 *
 * ORDERS sheet headers (row 1):
 * id | date | name | email | phone | address | payment | product | emoji | qty | total | status
 */

const PRODUCTS_SHEET = 'Products';
const ORDERS_SHEET = 'Orders';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'ping':
        return json({ ok: true, message: 'ZALVRA API connected' });

      case 'getProducts':
        return json({ products: getProducts() });

      case 'addProduct':
        addProduct(data.product);
        return json({ ok: true, products: getProducts() });

      case 'updateProduct':
        updateProduct(data.product);
        return json({ ok: true, products: getProducts() });

      case 'deleteProduct':
        deleteProduct(data.productId);
        return json({ ok: true, products: getProducts() });

      case 'getOrders':
        return json({ orders: getOrders() });

      case 'addOrder':
        addOrder(data.order);
        return json({ ok: true, orders: getOrders() });

      case 'updateOrder':
        updateOrder(data.orderId, data.status);
        return json({ ok: true, orders: getOrders() });

      case 'deleteOrder':
        deleteOrder(data.orderId);
        return json({ ok: true, orders: getOrders() });

      default:
        return json({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return json({ error: err.message });
  }
}

function doGet(e) {
  // Allow simple GET for testing
  const action = (e.parameter && e.parameter.action) || 'ping';
  if (action === 'ping') return json({ ok: true, message: 'ZALVRA API connected (GET)' });
  if (action === 'getProducts') return json({ products: getProducts() });
  if (action === 'getOrders') return json({ orders: getOrders() });
  return json({ ok: true, message: 'Use POST for write operations' });
}

// ========== PRODUCTS ==========

function getProductsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PRODUCTS_SHEET);
    sheet.appendRow(['id', 'name', 'price', 'oldPrice', 'cat', 'emoji', 'rating', 'desc', 'images']);
  }
  return sheet;
}

function imagesToString(images) {
  if (!images) return '';
  if (Array.isArray(images)) return images.filter(Boolean).join('|');
  return String(images);
}

function imagesFromString(val) {
  if (!val || val === '') return [];
  if (Array.isArray(val)) return val;
  return String(val).split('|').map(s => s.trim()).filter(Boolean);
}

function getProducts() {
  const sheet = getProductsSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === 'id' || h === 'price' || h === 'rating') val = Number(val) || 0;
      if (h === 'oldPrice') val = val === '' || val === null ? null : Number(val);
      if (h === 'images') val = imagesFromString(val);
      obj[h] = val;
    });
    return obj;
  }).filter(p => p.id);
}

function addProduct(product) {
  const sheet = getProductsSheet();
  sheet.appendRow([
    product.id,
    product.name,
    product.price,
    product.oldPrice || '',
    product.cat,
    product.emoji || '',
    product.rating || 4.5,
    product.desc || '',
    imagesToString(product.images)
  ]);
}

function updateProduct(product) {
  const sheet = getProductsSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(product.id)) {
      sheet.getRange(i + 1, 1, 1, 9).setValues([[
        product.id,
        product.name,
        product.price,
        product.oldPrice || '',
        product.cat,
        product.emoji || '',
        product.rating || 4.5,
        product.desc || '',
        imagesToString(product.images)
      ]]);
      return;
    }
  }
  // If not found, add it
  addProduct(product);
}

function deleteProduct(productId) {
  const sheet = getProductsSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(productId)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ========== ORDERS ==========

function getOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ORDERS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ORDERS_SHEET);
    sheet.appendRow(['id', 'date', 'name', 'email', 'phone', 'address', 'payment', 'product', 'emoji', 'qty', 'total', 'status']);
  }
  return sheet;
}

function getOrders() {
  const sheet = getOrdersSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === 'qty' || h === 'total') val = Number(val) || 0;
      obj[h] = val;
    });
    return obj;
  }).filter(o => o.id).reverse(); // newest first
}

function addOrder(order) {
  const sheet = getOrdersSheet();
  sheet.appendRow([
    order.id,
    order.date || new Date().toLocaleString(),
    order.name || '',
    order.email || '',
    order.phone || '',
    order.address || '',
    order.payment || 'cod',
    order.product || '',
    order.emoji || '',
    order.qty || 1,
    order.total || 0,
    order.status || 'new'
  ]);
}

function updateOrder(orderId, status) {
  const sheet = getOrdersSheet();
  const values = sheet.getDataRange().getValues();
  // status is column 12 (index 11)
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(orderId)) {
      sheet.getRange(i + 1, 12).setValue(status);
      return;
    }
  }
}

function deleteOrder(orderId) {
  const sheet = getOrdersSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(orderId)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ========== HELPERS ==========

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
