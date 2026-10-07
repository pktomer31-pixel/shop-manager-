/* =========================================
   PESTICIDE RETAILER MANAGER
   ========================================= */

const STORAGE_KEY = "pesticide_retailer_manager";


/* =========================
   DATABASE
   ========================= */

let data = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || {

  inventory: [],

  sales: [],

  purchases: [],

  farmerPayments: [],

  companyPayments: []

};


function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


/* =========================
   HELPERS
   ========================= */

function money(value) {

  return "₹" + Number(value || 0)
    .toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

}


function today() {

  return new Date()
    .toISOString()
    .split("T")[0];

}


function showMessage(message) {

  alert(message);

}


/* =========================
   SCREEN NAVIGATION
   ========================= */

function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach(s => s.classList.add("hidden"));

  document
    .getElementById(screen)
    .classList.remove("hidden");


  document
    .querySelectorAll(".nav")
    .forEach(n => n.classList.remove("active"));


  const navs = document.querySelectorAll(".nav");

  const titles = {

    dashboard: [
      "Dashboard",
      "Overview of your pesticide business"
    ],

    sales: [
      "Sales / Bill",
      "Create farmer bills"
    ],

    inventory: [
      "Inventory",
      "Manage stock and purchases"
    ],

    ledger: [
      "Credits & Payments",
      "Manage farmer and company balances"
    ]

  };


  const index = {

    dashboard: 0,
    sales: 1,
    inventory: 2,
    ledger: 3

  };


  navs[index[screen]].classList.add("active");


  document.getElementById("pageTitle")
    .textContent = titles[screen][0];

  document.getElementById("pageSubtitle")
    .textContent = titles[screen][1];


  if (screen === "dashboard")
    renderDashboard();

  if (screen === "sales") {

    loadProducts();

    renderSalesHistory();

  }

  if (screen === "inventory")
    renderInventory();

  if (screen === "ledger")
    renderLedger();

}


/* =========================
   INVENTORY
   ========================= */

function addPurchase() {

  const name =
    document.getElementById("productName").value.trim();

  const company =
    document.getElementById("companyName").value.trim();

  const quantity =
    Number(document.getElementById("purchaseQuantity").value);

  const buy =
    Number(document.getElementById("buyPrice").value);

  const sell =
    Number(document.getElementById("sellingPrice").value);

  const date =
    document.getElementById("purchaseDate").value || today();


  if (!name || !company || quantity <= 0) {

    showMessage("Please enter product, company and quantity.");

    return;

  }


  let product = data.inventory.find(

    p =>
      p.name.toLowerCase() === name.toLowerCase() &&
      p.company.toLowerCase() === company.toLowerCase()

  );


  if (product) {

    product.stock += quantity;

    product.buyPrice = buy;

    product.sellPrice = sell;

  } else {

    product = {

      id: Date.now(),

      name,

      company,

      stock: quantity,

      buyPrice: buy,

      sellPrice: sell

    };

    data.inventory.push(product);

  }


  data.purchases.push({

    id: Date.now(),

    date,

    product: name,

    company,

    quantity,

    buyPrice: buy,

    total: quantity * buy

  });


  saveData();

  clearPurchaseForm();

  renderInventory();

  loadProducts();

  renderDashboard();

  showMessage("Purchase added successfully.");

}


function clearPurchaseForm() {

  document.getElementById("productName").value = "";

  document.getElementById("companyName").value = "";

  document.getElementById("purchaseQuantity").value = "";

  document.getElementById("buyPrice").value = "";

  document.getElementById("sellingPrice").value = "";

}


function renderInventory() {

  const table =
    document.getElementById("inventoryTable");


  table.innerHTML = "";


  if (data.inventory.length === 0) {

    table.innerHTML =
      `<tr>
        <td colspan="6">No inventory available.</td>
       </tr>`;

  }


  data.inventory.forEach(p => {

    table.innerHTML += `

      <tr>

        <td>${p.name}</td>

        <td>${p.company}</td>

        <td>${p.stock}</td>

        <td>${money(p.buyPrice)}</td>

        <td>${money(p.sellPrice)}</td>

        <td>
          ${money(p.stock * p.buyPrice)}
        </td>

      </tr>

    `;

  });


  renderPurchaseHistory();

}


function renderPurchaseHistory() {

  const container =
    document.getElementById("purchaseHistory");


  if (!data.purchases.length) {

    container.innerHTML =
      "<p>No purchases recorded.</p>";

    return;

  }


  let html = `

    <div class="table-container">

    <table>

    <thead>

      <tr>

        <th>Date</th>
        <th>Product</th>
        <th>Company</th>
        <th>Qty</th>
        <th>Total</th>

      </tr>

    </thead>

    <tbody>

  `;


  data.purchases
    .slice()
    .reverse()
    .forEach(p => {

      html += `

        <tr>

          <td>${p.date}</td>

          <td>${p.product}</td>

          <td>${p.company}</td>

          <td>${p.quantity}</td>

          <td>${money(p.total)}</td>

        </tr>

      `;

    });


  html += `
    </tbody>
    </table>
    </div>
  `;


  container.innerHTML = html;

}


/* =========================
   SALES
   ========================= */

let currentSaleItems = [];


function loadProducts() {

  const select =
    document.getElementById("saleProduct");


  select.innerHTML =
    `<option value="">Select Product</option>`;


  data.inventory.forEach(p => {

    select.innerHTML += `

      <option value="${p.id}">

        ${p.name}
        —
        ${p.company}
        —
        Stock: ${p.stock}

      </option>

    `;

  });

}


function updateSalePrice() {

  const id =
    document.getElementById("saleProduct").value;


  const product =
    data.inventory.find(
      p => p.id == id
    );


  if (!product) return;


  document.getElementById("salePrice").value =
    product.sellPrice;


  document.getElementById("buyPriceInfo").innerText =

    `Buy Price: ${money(product.buyPrice)}
     | Available Stock: ${product.stock}`;

}


function addSaleProduct() {

  const id =
    document.getElementById("saleProduct").value;

  const quantity =
    Number(
      document.getElementById("saleQuantity").value
    );

  const sellingPrice =
    Number(
      document.getElementById("salePrice").value
    );


  const product =
    data.inventory.find(
      p => p.id == id
    );


  if (!product) {

    showMessage("Select a product.");

    return;

  }


  if (quantity <= 0) {

    showMessage("Enter valid quantity.");

    return;

  }


  if (quantity > product.stock) {

    showMessage("Not enough stock.");

    return;

  }


  currentSaleItems.push({

    productId: product.id,

    product: product.name,

    quantity,

    buyPrice: product.buyPrice,

    sellPrice: sellingPrice,

    total: quantity * sellingPrice

  });


  renderSaleItems();

}


function renderSaleItems() {

  const table =
    document.getElementById("saleItems");


  table.innerHTML = "";


  let total = 0;


  currentSaleItems.forEach((item, index) => {

    total += item.total;


    table.innerHTML += `

      <tr>

        <td>${item.product}</td>

        <td>${item.quantity}</td>

        <td>${money(item.buyPrice)}</td>

        <td>${money(item.sellPrice)}</td>

        <td>${money(item.total)}</td>

        <td>

          <button
            class="secondary"
            onclick="removeSaleItem(${index})">

            Remove

          </button>

        </td>

      </tr>

    `;

  });


  document.getElementById("billTotal")
    .innerText = money(total);

}


function removeSaleItem(index) {

  currentSaleItems.splice(index, 1);

  renderSaleItems();

}


function saveSale() {

  const farmer =
    document.getElementById("farmerName")
      .value.trim();

  const village =
    document.getElementById("village")
      .value.trim();

  const type =
    document.getElementById("billType")
      .value;

  const date =
    document.getElementById("saleDate")
      .value || today();


  if (!farmer || !village) {

    showMessage(
      "Please enter farmer name and village."
    );

    return;

  }


  if (!currentSaleItems.length) {

    showMessage(
      "Add at least one product."
    );

    return;

  }


  const total =
    currentSaleItems.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );


  /* REDUCE INVENTORY */

  currentSaleItems.forEach(item => {

    const product =
      data.inventory.find(
        p => p.id === item.productId
      );


    if (product) {

      product.stock -= item.quantity;

    }

  });


  /* SAVE SALE */

  data.sales.push({

    id: Date.now(),

    date,

    farmer,

    village,

    type,

    total,

    items: [...currentSaleItems]

  });


  saveData();


  currentSaleItems = [];


  document.getElementById("farmerName").value = "";

  document.getElementById("village").value = "";


  renderSaleItems();

  renderSalesHistory();

  renderInventory();

  renderDashboard();


  showMessage(
    "Bill saved successfully."
  );

}


/* =========================
   SALES HISTORY
   ========================= */

function renderSalesHistory() {

  const container =
    document.getElementById("salesHistory");


  let from =
    document.getElementById("salesFrom").value;

  let to =
    document.getElementById("salesTo").value;


  let sales =
    data.sales.filter(s => {

      if (from && s.date < from)
        return false;

      if (to && s.date > to)
        return false;

      return true;

    });


  let html = `

    <div class="table-container">

    <table>

    <thead>

      <tr>

        <th>Date</th>
        <th>Farmer</th>
        <th>Village</th>
        <th>Products</th>
        <th>Type</th>
        <th>Total</th>

      </tr>

    </thead>

    <tbody>

  `;


  sales
    .slice()
    .reverse()
    .forEach(sale => {

      const products =
        sale.items
          .map(
            i =>
              `${i.product} × ${i.quantity}`
          )
          .join("<br>");


      html += `

        <tr>

          <td>${sale.date}</td>

          <td>${sale.farmer}</td>

          <td>${sale.village}</td>

          <td>${products}</td>

          <td>${sale.type}</td>

          <td>${money(sale.total)}</td>

        </tr>

      `;

    });


  html += `
    </tbody>
    </table>
    </div>
  `;


  container.innerHTML = html;

}


/* =========================
   FARMER CREDIT
   ========================= */

function getFarmerBalances() {

  const balances = {};


  data.sales
    .filter(s => s.type === "Credit")
    .forEach(sale => {

      if (!balances[sale.farmer])
        balances[sale.farmer] = 0;


      balances[sale.farmer] += sale.total;

    });


  data.farmerPayments
    .forEach(payment => {

      if (!balances[payment.farmer])
        balances[payment.farmer] = 0;


      balances[payment.farmer] -= payment.amount;

    });


  return balances;

}


/* =========================
   COMPANY BALANCE
   ========================= */

function getCompanyBalances() {

  const balances = {};


  data.purchases.forEach(purchase => {

    if (!balances[purchase.company])
      balances[purchase.company] = 0;


    balances[purchase.company] +=
      purchase.total;

  });


  data.companyPayments
    .forEach(payment => {

      if (!balances[payment.company])
        balances[payment.company] = 0;


      balances[payment.company] -=
        payment.amount;

    });


  return balances;

}


/* =========================
   LEDGER
   ========================= */

function renderLedger() {

  const farmerLedger =
    document.getElementById("farmerLedger");

  const companyLedger =
    document.getElementById("companyLedger");


  const farmers =
    getFarmerBalances();

  const companies =
    getCompanyBalances();


  farmerLedger.innerHTML = "";


  Object.entries(farmers)
    .forEach(([name, balance]) => {

      farmerLedger.innerHTML += `

        <div class="ledger-row">

          <strong>${name}</strong>

          <span>
            ${money(Math.max(balance, 0))}
          </span>

        </div>

      `;

    });


  companyLedger.innerHTML = "";


  Object.entries(companies)
    .forEach(([company, balance]) => {

      companyLedger.innerHTML += `

        <div class="ledger-row">

          <strong>${company}</strong>

          <span>
            ${money(Math.max(balance, 0))}
          </span>

        </div>

      `;

    });

}


/* =========================
   FARMER PAYMENT
   ========================= */

function receiveFarmerPayment() {

  const farmer =
    document.getElementById("paymentFarmer")
      .value.trim();

  const amount =
    Number(
      document.getElementById(
        "farmerPaymentAmount"
      ).value
    );

  const date =
    document.getElementById(
      "farmerPaymentDate"
    ).value || today();

  const note =
    document.getElementById(
      "farmerPaymentNote"
    ).value;


  if (!farmer || amount <= 0) {

    showMessage(
      "Enter farmer and payment amount."
    );

    return;

  }


  data.farmerPayments.push({

    id: Date.now(),

    farmer,

    amount,

    date,

    note

  });


  saveData();

  renderLedger();

  renderDashboard();

  renderPaymentHistory();

  showMessage(
    "Farmer payment recorded."
  );

}


/* =========================
   COMPANY PAYMENT
   ========================= */

function payCompany() {

  const company =
    document.getElementById(
      "paymentCompany"
    ).value.trim();

  const amount =
    Number(
      document.getElementById(
        "companyPaymentAmount"
      ).value
    );

  const date =
    document.getElementById(
      "companyPaymentDate"
    ).value || today();

  const note =
    document.getElementById(
      "companyPaymentNote"
    ).value;


  if (!company || amount <= 0) {

    showMessage(
      "Enter company and payment amount."
    );

    return;

  }


  data.companyPayments.push({

    id: Date.now(),

    company,

    amount,

    date,

    note

  });


  saveData();

  renderLedger();

  renderDashboard();

  renderPaymentHistory();

  showMessage(
    "Company payment recorded."
  );

}


/* =========================
   PAYMENT HISTORY
   ========================= */

function renderPaymentHistory() {

  const container =
    document.getElementById(
      "paymentHistory"
    );


  const payments = [

    ...data.farmerPayments.map(p => ({

      date: p.date,

      type: "Farmer Payment Received",

      name: p.farmer,

      amount: p.amount,

      note: p.note

    })),

    ...data.companyPayments.map(p => ({

      date: p.date,

      type: "Company Payment",

      name: p.company,

      amount: p.amount,

      note: p.note

    }))

  ];


  let html = `

    <div class="table-container">

    <table>

    <thead>

      <tr>

        <th>Date</th>
        <th>Type</th>
        <th>Name</th>
        <th>Amount</th>
        <th>Note</th>

      </tr>

    </thead>

    <tbody>

  `;


  payments
    .sort(
      (a,b) =>
        b.date.localeCompare(a.date)
    )
    .forEach(p => {

      html += `

        <tr>

          <td>${p.date}</td>

          <td>${p.type}</td>

          <td>${p.name}</td>

          <td>${money(p.amount)}</td>

          <td>${p.note || ""}</td>

        </tr>

      `;

    });


  html += `
    </tbody>
    </table>
    </div>
  `;


  container.innerHTML = html;

}


/* =========================
   DASHBOARD
   ========================= */

function renderDashboard() {

  const from =
    document.getElementById("dashFrom").value;

  const to =
    document.getElementById("dashTo").value;


  const sales =
    data.sales.filter(s => {

      if (from && s.date < from)
        return false;

      if (to && s.date > to)
        return false;

      return true;

    });


  const purchases =
    data.purchases.filter(p => {

      if (from && p.date < from)
        return false;

      if (to && p.date > to)
        return false;

      return true;

    });


  const companyPayments =
    data.companyPayments.filter(p => {

      if (from && p.date < from)
        return false;

      if (to && p.date > to)
        return false;

      return true;

    });


  const salesTotal =
    sales.reduce(
      (sum,s) => sum + s.total,
      0
    );


  const farmerCredit =
    sales
      .filter(s => s.type === "Credit")
      .reduce(
        (sum,s) => sum + s.total,
        0
      );


  const purchaseTotal =
    purchases.reduce(
      (sum,p) => sum + p.total,
      0
    );


  const paymentTotal =
    companyPayments.reduce(
      (sum,p) => sum + p.amount,
      0
    );


  document.getElementById(
    "totalSales"
  ).innerText = money(salesTotal);


  document.getElementById(
    "farmerCredit"
  ).innerText = money(farmerCredit);


  document.getElementById(
    "companyPurchases"
  ).innerText = money(purchaseTotal);


  document.getElementById(
    "companyPayments"
  ).innerText = money(paymentTotal);


  /* OUTSTANDING FARMER */

  const farmerBalances =
    getFarmerBalances();


  const farmerOutstanding =
    Object.values(farmerBalances)
      .reduce(
        (sum,balance) =>
          sum + Math.max(balance,0),
        0
      );


  document.getElementById(
    "outstandingFarmer"
  ).innerText =
    money(farmerOutstanding);


  /* OUTSTANDING COMPANY */

  const companyBalances =
    getCompanyBalances();


  const companyOutstanding =
    Object.values(companyBalances)
      .reduce(
        (sum,balance) =>
          sum + Math.max(balance,0),
        0
      );


  document.getElementById(
    "outstandingCompany"
  ).innerText =
    money(companyOutstanding);


  /* LOW STOCK */

  const lowStock =
    document.getElementById("lowStock");


  lowStock.innerHTML = "";


  data.inventory
    .filter(p => p.stock <= 5)
    .forEach(p => {

      lowStock.innerHTML += `

        <p>

          <strong>${p.name}</strong>

          —
          ${p.stock} units remaining

        </p>

      `;

    });


  if (!lowStock.innerHTML) {

    lowStock.innerHTML =
      "<p>No low-stock products.</p>";

  }


  /* RECENT SALES */

  const recent =
    document.getElementById(
      "recentSales"
    );


  recent.innerHTML = `

    <div class="table-container">

    <table>

      <tr>

        <th>Date</th>
        <th>Farmer</th>
        <th>Type</th>
        <th>Total</th>

      </tr>

  `;


  sales
    .slice()
    .reverse()
    .slice(0,10)
    .forEach(sale => {

      recent.innerHTML += `

        <tr>

          <td>${sale.date}</td>

          <td>${sale.farmer}</td>

          <td>${sale.type}</td>

          <td>${money(sale.total)}</td>

        </tr>

      `;

    });


  recent.innerHTML += `
    </table>
    </div>
  `;

}


/* =========================
   EXCEL EXPORT
   ========================= */

function downloadExcel(dataArray, filename) {

  if (!window.XLSX) {

    showMessage(
      "Excel library could not load."
    );

    return;

  }


  const worksheet =
    XLSX.utils.json_to_sheet(
      dataArray
    );


  const workbook =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Data"
  );


  XLSX.writeFile(
    workbook,
    filename
  );

}


/* SALES EXCEL */

function exportSales() {

  const rows = [];


  data.sales.forEach(sale => {

    sale.items.forEach(item => {

      rows.push({

        Date: sale.date,

        Farmer: sale.farmer,

        Village: sale.village,

        BillType: sale.type,

        Product: item.product,

        Quantity: item.quantity,

        BuyPrice: item.buyPrice,

        SellPrice: item.sellPrice,

        Total: item.total

      });

    });

  });


  downloadExcel(
    rows,
    "sales.xlsx"
  );

}


/* INVENTORY EXCEL */

function exportInventory() {

  downloadExcel(
    data.inventory,
    "inventory.xlsx"
  );

}


/* PURCHASE EXCEL */

function exportPurchases() {

  downloadExcel(
    data.purchases,
    "purchases.xlsx"
  );

}


/* FARMER CREDIT */

function exportFarmerCredit() {

  const balances =
    getFarmerBalances();


  const rows =
    Object.entries(balances)
      .map(([farmer,balance]) => ({

        Farmer: farmer,

        Outstanding:
          Math.max(balance,0)

      }));


  downloadExcel(
    rows,
    "farmer-credit.xlsx"
  );

}


/* COMPANY PAYABLE */

function exportCompanyPayable() {

  const balances =
    getCompanyBalances();


  const rows =
    Object.entries(balances)
      .map(([company,balance]) => ({

        Company: company,

        Outstanding:
          Math.max(balance,0)

      }));


  downloadExcel(
    rows,
    "company-payables.xlsx"
  );

}


/* PAYMENTS */

function exportPayments() {

  const rows = [];


  data.farmerPayments.forEach(p => {

    rows.push({

      Date: p.date,

      Type: "Farmer Payment Received",

      Name: p.farmer,

      Amount: p.amount,

      Note: p.note

    });

  });


  data.companyPayments.forEach(p => {

    rows.push({

      Date: p.date,

      Type: "Company Payment",

      Name: p.company,

      Amount: p.amount,

      Note: p.note

    });

  });


  downloadExcel(
    rows,
    "payments.xlsx"
  );

}


/* DASHBOARD EXPORT */

function exportDashboard() {

  const row = {

    From:
      document.getElementById(
        "dashFrom"
      ).value,

    To:
      document.getElementById(
        "dashTo"
      ).value,

    Sales:
      document.getElementById(
        "totalSales"
      ).innerText,

    FarmerCredit:
      document.getElementById(
        "farmerCredit"
      ).innerText,

    CompanyPurchases:
      document.getElementById(
        "companyPurchases"
      ).innerText,

    CompanyPayments:
      document.getElementById(
        "companyPayments"
      ).innerText,

    FarmerOutstanding:
      document.getElementById(
        "outstandingFarmer"
      ).innerText,

    CompanyOutstanding:
      document.getElementById(
        "outstandingCompany"
      ).innerText

  };


  downloadExcel(
    [row],
    "dashboard-report.xlsx"
  );

}


/* =========================
   INITIALIZE
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const dateFields = [

      "saleDate",

      "purchaseDate",

      "farmerPaymentDate",

      "companyPaymentDate"

    ];


    dateFields.forEach(id => {

      document.getElementById(id)
        .value = today();

    });


    const firstDay =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
      .toISOString()
      .split("T")[0];


    document.getElementById(
      "dashFrom"
    ).value = firstDay;


    document.getElementById(
      "dashTo"
    ).value = today();


    loadProducts();

    renderSaleItems();

    renderInventory();

    renderSalesHistory();

    renderLedger();

    renderPaymentHistory();

    renderDashboard();

  }
);