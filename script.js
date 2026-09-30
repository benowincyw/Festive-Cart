// ============================================================
// FESTIVE CART - SCRIPT.JS
// CART PRODUCT IMAGE VERSION
// ============================================================

const businessWhatsApp =
  "919500417696";

const customerSupportNumber =
  "9500417696";

const instagramURL = "";

const googleScriptURL =
  "https://script.google.com/macros/s/AKfycbwtXCf4FvtaCEoKQH9PvXfwWc1Xa1UNLa_dcK5I1c11IJiolxfuybQCBqZ2OHtSy4ufDA/exec";


let cart = [];

let products = [];

let currentCategory = "all";

let catalogueLoaded = false;

let orderSubmissionInProgress = false;


// ============================================================
// START
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {
    updateCart();
    loadProducts();
  }
);


// ============================================================
// PRODUCTS
// ============================================================

async function loadProducts() {
  const loading =
    document.getElementById(
      "products-loading"
    );

  const errorBox =
    document.getElementById(
      "products-error"
    );

  const noProducts =
    document.getElementById(
      "no-products"
    );

  if (loading) {
    loading.style.display = "block";
  }

  if (errorBox) {
    errorBox.style.display = "none";
  }

  if (noProducts) {
    noProducts.style.display = "none";
  }

  try {
    const data =
      await fetchLatestCatalogue();

    products =
      normalizeProducts(
        data.products
      );

    catalogueLoaded = true;

    if (loading) {
      loading.style.display = "none";
    }

    createCategoryMenu();
    renderProducts();

  } catch (error) {
    console.error(error);

    catalogueLoaded = false;

    if (loading) {
      loading.style.display = "none";
    }

    if (errorBox) {
      errorBox.style.display = "block";
    }
  }
}


async function fetchLatestCatalogue() {
  const response =
    await fetch(
      googleScriptURL +
      "?action=products&t=" +
      Date.now()
    );

  if (!response.ok) {
    throw new Error(
      "Unable to load products."
    );
  }

  const data =
    await response.json();

  if (
    !data ||
    data.success !== true ||
    !Array.isArray(data.products)
  ) {
    throw new Error(
      data && data.error
        ? data.error
        : "Unable to load products."
    );
  }

  return data;
}


function normalizeProducts(list) {
  return list.map(function (p) {
    return {
      category:
        String(p.category || "").trim(),

      productNo:
        String(p.productNo || "")
          .trim()
          .toUpperCase(),

      productName:
        String(p.productName || "").trim(),

      description:
        String(p.description || "").trim(),

      actualPrice:
        Number(p.actualPrice) || 0,

      offerPrice:
        Number(p.offerPrice) || 0,

      availableQty:
        Math.max(
          0,
          Number(p.availableQty) || 0
        ),

      stockStatus:
        String(p.stockStatus || "")
          .trim()
          .toUpperCase(),

      imageURL:
        String(p.imageURL || "").trim()
    };
  });
}


// ============================================================
// CATEGORY MENU
// ============================================================

function createCategoryMenu() {
  const categoryList =
    document.getElementById(
      "category-list"
    );

  if (!categoryList) return;

  categoryList.innerHTML = "";

  const allButton =
    document.createElement("button");

  allButton.type = "button";
  allButton.className = "menu-item";
  allButton.textContent = "All Products";

  allButton.onclick = function () {
    filterProducts("all");
  };

  categoryList.appendChild(allButton);

  const categories = [];

  products.forEach(function (product) {
    if (
      product.category &&
      !categories.includes(
        product.category
      )
    ) {
      categories.push(
        product.category
      );
    }
  });

  categories.forEach(function (category) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "menu-item";
    button.textContent = category;

    button.onclick = function () {
      filterProducts(category);
    };

    categoryList.appendChild(button);
  });

  updateActiveCategoryButton();
}


function filterProducts(category) {
  currentCategory =
    category || "all";

  updateActiveCategoryButton();
  renderProducts();
  closeCategoryMenu();
}


function updateActiveCategoryButton() {
  const categoryList =
    document.getElementById(
      "category-list"
    );

  if (!categoryList) return;

  categoryList
    .querySelectorAll(".menu-item")
    .forEach(function (button) {
      button.classList.remove(
        "active-category"
      );

      if (
        currentCategory === "all" &&
        button.textContent.trim() ===
          "All Products"
      ) {
        button.classList.add(
          "active-category"
        );
      }

      if (
        currentCategory !== "all" &&
        button.textContent.trim() ===
          currentCategory
      ) {
        button.classList.add(
          "active-category"
        );
      }
    });
}


// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts() {
  const list =
    document.getElementById(
      "product-list"
    );

  const noProducts =
    document.getElementById(
      "no-products"
    );

  if (!list) return;

  list.innerHTML = "";

  const visible =
    currentCategory === "all"
      ? products
      : products.filter(
          function (product) {
            return (
              product.category ===
              currentCategory
            );
          }
        );

  if (!visible.length) {
    if (noProducts) {
      noProducts.style.display =
        "block";
    }

    return;
  }

  if (noProducts) {
    noProducts.style.display =
      "none";
  }

  visible.forEach(function (product) {
    list.appendChild(
      createProductCard(product)
    );
  });
}


function createProductCard(product) {
  const card =
    document.createElement("article");

  card.className = "product";

  const imageContainer =
    document.createElement("div");

  imageContainer.className =
    "product-image-container";

  const placeholder =
    document.createElement("div");

  placeholder.className =
    "image-placeholder";

  placeholder.textContent =
    "Product Image";

  if (product.imageURL) {
    placeholder.style.display =
      "none";

    const image =
      document.createElement("img");

    image.src = product.imageURL;
    image.alt = product.productName;
    image.className = "product-image";
    image.loading = "lazy";
    image.decoding = "async";

    image.onerror = function () {
      image.style.display = "none";
      placeholder.style.display =
        "flex";
    };

    imageContainer.appendChild(image);
  }

  imageContainer.appendChild(
    placeholder
  );

  card.appendChild(
    imageContainer
  );


  const info =
    document.createElement("div");

  info.className = "product-info";


  const number =
    document.createElement("div");

  number.className = "product-number";
  number.textContent =
    product.productNo;

  info.appendChild(number);


  const name =
    document.createElement("h3");

  name.className = "product-name";
  name.textContent =
    product.productName;

  info.appendChild(name);


  if (product.description) {
    const description =
      document.createElement("p");

    description.className =
      "product-description";

    description.textContent =
      product.description;

    info.appendChild(description);
  }


  const priceArea =
    document.createElement("div");

  priceArea.className =
    "product-price-area";


  if (
    product.actualPrice >
    product.offerPrice
  ) {
    const actual =
      document.createElement("span");

    actual.className =
      "actual-price";

    actual.textContent =
      formatCurrency(
        product.actualPrice
      );

    priceArea.appendChild(actual);
  }


  const offer =
    document.createElement("span");

  offer.className =
    "offer-price";

  offer.textContent =
    formatCurrency(
      product.offerPrice
    );

  priceArea.appendChild(offer);

  info.appendChild(priceArea);


  const inStock =
    product.availableQty > 0 &&
    product.stockStatus !==
      "OUT OF STOCK";


  const stock =
    document.createElement("div");

  stock.className =
    inStock
      ? "stock-status in-stock"
      : "stock-status out-of-stock";

  stock.textContent =
    inStock
      ? "In Stock"
      : "Out of Stock";

  info.appendChild(stock);


  const button =
    document.createElement("button");

  button.type = "button";
  button.className = "add-button";

  if (inStock) {
    button.textContent =
      "Add to Cart";

    button.onclick = function () {
      addToCart(
        product.productNo
      );
    };

  } else {
    button.textContent =
      "Out of Stock";

    button.disabled = true;

    button.classList.add(
      "disabled"
    );
  }

  info.appendChild(button);

  card.appendChild(info);

  return card;
}


// ============================================================
// CART
// ============================================================

function findProduct(productNo) {
  return products.find(
    function (product) {
      return (
        product.productNo ===
        String(productNo)
          .trim()
          .toUpperCase()
      );
    }
  );
}


function addToCart(productNo) {
  const product =
    findProduct(productNo);

  if (!product) return;

  if (product.availableQty <= 0) {
    alert(
      "This product is out of stock."
    );
    return;
  }

  const existing =
    cart.find(
      function (item) {
        return (
          item.productNo ===
          product.productNo
        );
      }
    );

  if (existing) {
    if (
      existing.quantity >=
      product.availableQty
    ) {
      alert(
        "Only " +
        product.availableQty +
        " item(s) are currently available."
      );

      return;
    }

    existing.quantity++;

  } else {
    cart.push({
      productNo:
        product.productNo,

      productName:
        product.productName,

      price:
        product.offerPrice,

      imageURL:
        product.imageURL,

      quantity: 1
    });
  }

  updateCart();
}


function increaseQuantity(productNo) {
  const item =
    cart.find(
      function (item) {
        return (
          item.productNo ===
          productNo
        );
      }
    );

  const product =
    findProduct(productNo);

  if (!item || !product) return;

  if (
    item.quantity >=
    product.availableQty
  ) {
    alert(
      "Only " +
      product.availableQty +
      " item(s) are currently available."
    );

    return;
  }

  item.quantity++;

  updateCart();
}


function decreaseQuantity(productNo) {
  const item =
    cart.find(
      function (item) {
        return (
          item.productNo ===
          productNo
        );
      }
    );

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    removeFromCart(productNo);
    return;
  }

  updateCart();
}


function removeFromCart(productNo) {
  cart =
    cart.filter(
      function (item) {
        return (
          item.productNo !==
          productNo
        );
      }
    );

  updateCart();
}


function getCartTotal() {
  return cart.reduce(
    function (total, item) {
      return (
        total +
        item.price *
        item.quantity
      );
    },
    0
  );
}


function getCartCount() {
  return cart.reduce(
    function (total, item) {
      return (
        total +
        item.quantity
      );
    },
    0
  );
}


function updateCart() {
  const itemsBox =
    document.getElementById(
      "cart-items"
    );

  const countBox =
    document.getElementById(
      "cart-count"
    );

  const totalBox =
    document.getElementById(
      "cart-total"
    );

  const barTotal =
    document.getElementById(
      "cart-bar-total"
    );

  const checkoutButton =
    document.getElementById(
      "checkout-button"
    );

  const total =
    getCartTotal();

  if (countBox) {
    countBox.textContent =
      getCartCount();
  }

  if (totalBox) {
    totalBox.textContent =
      formatCurrency(total);
  }

  if (barTotal) {
    barTotal.textContent =
      formatCurrency(total);
  }

  if (checkoutButton) {
    checkoutButton.disabled =
      cart.length === 0;
  }

  if (!itemsBox) {
    updateCheckoutSummary();
    return;
  }

  itemsBox.innerHTML = "";

  if (!cart.length) {
    const empty =
      document.createElement("p");

    empty.className =
      "empty-cart-message";

    empty.textContent =
      "Your cart is empty.";

    itemsBox.appendChild(empty);

    updateCheckoutSummary();

    return;
  }


  cart.forEach(function (item) {
    const row =
      document.createElement("div");

    row.className = "cart-item";


    // ========================================================
    // SMALL PRODUCT IMAGE
    // ========================================================

    const imageBox =
      document.createElement("div");

    imageBox.className =
      "cart-item-image-box";


    if (item.imageURL) {
      const image =
        document.createElement("img");

      image.src = item.imageURL;

      image.alt =
        item.productName;

      image.className =
        "cart-item-image";

      image.loading = "lazy";
      image.decoding = "async";

      image.onerror = function () {
        image.style.display = "none";

        imageBox.classList.add(
          "cart-image-placeholder"
        );

        imageBox.textContent =
          "No Image";
      };

      imageBox.appendChild(image);

    } else {
      imageBox.classList.add(
        "cart-image-placeholder"
      );

      imageBox.textContent =
        "No Image";
    }


    // ========================================================
    // PRODUCT DETAILS
    // ========================================================

    const details =
      document.createElement("div");

    details.className =
      "cart-item-details";


    const name =
      document.createElement("div");

    name.className =
      "cart-item-name";

    name.textContent =
      item.productName;


    const number =
      document.createElement("div");

    number.className =
      "cart-item-product-number";

    number.textContent =
      item.productNo;


    const price =
      document.createElement("div");

    price.className =
      "cart-item-price";

    price.textContent =
      formatCurrency(item.price) +
      " each";


    details.appendChild(name);
    details.appendChild(number);
    details.appendChild(price);


    // ========================================================
    // QUANTITY CONTROLS
    // ========================================================

    const controls =
      document.createElement("div");

    controls.className =
      "cart-item-controls";


    const minus =
      document.createElement("button");

    minus.type = "button";
    minus.textContent = "−";

    minus.onclick = function () {
      decreaseQuantity(
        item.productNo
      );
    };


    const quantity =
      document.createElement("span");

    quantity.className =
      "cart-item-quantity";

    quantity.textContent =
      item.quantity;


    const plus =
      document.createElement("button");

    plus.type = "button";
    plus.textContent = "+";

    plus.onclick = function () {
      increaseQuantity(
        item.productNo
      );
    };


    const remove =
      document.createElement("button");

    remove.type = "button";

    remove.className =
      "remove-cart-item";

    remove.textContent = "Remove";

    remove.onclick = function () {
      removeFromCart(
        item.productNo
      );
    };


    controls.appendChild(minus);
    controls.appendChild(quantity);
    controls.appendChild(plus);
    controls.appendChild(remove);


    row.appendChild(imageBox);
    row.appendChild(details);
    row.appendChild(controls);

    itemsBox.appendChild(row);
  });

  updateCheckoutSummary();
}


// ============================================================
// CHECKOUT SUMMARY
// ============================================================

function updateCheckoutSummary() {
  const box =
    document.getElementById(
      "checkout-items"
    );

  const total =
    document.getElementById(
      "checkout-total"
    );

  if (total) {
    total.textContent =
      formatCurrency(
        getCartTotal()
      );
  }

  if (!box) return;

  box.innerHTML = "";

  cart.forEach(function (item) {
    const row =
      document.createElement("div");

    row.className =
      "checkout-summary-item";

    const name =
      document.createElement("span");

    name.textContent =
      item.productName +
      " × " +
      item.quantity;

    const price =
      document.createElement("strong");

    price.textContent =
      formatCurrency(
        item.price *
        item.quantity
      );

    row.appendChild(name);
    row.appendChild(price);

    box.appendChild(row);
  });
}


// ============================================================
// CART DISPLAY
// ============================================================

function openCart() {
  const popup =
    document.getElementById(
      "cart-popup"
    );

  const overlay =
    document.getElementById(
      "cart-overlay"
    );

  if (popup) {
    popup.classList.add("open");
  }

  if (overlay) {
    overlay.classList.add("show");
  }
}


function closeCart() {
  const popup =
    document.getElementById(
      "cart-popup"
    );

  const overlay =
    document.getElementById(
      "cart-overlay"
    );

  if (popup) {
    popup.classList.remove("open");
  }

  if (overlay) {
    overlay.classList.remove("show");
  }
}


// ============================================================
// CHECKOUT DISPLAY
// ============================================================

function showCheckout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  closeCart();

  updateCheckoutSummary();

  const checkout =
    document.getElementById(
      "checkout-section"
    );

  if (checkout) {
    checkout.style.display =
      "block";
  }
}


function closeCheckout() {
  if (orderSubmissionInProgress) {
    return;
  }

  const checkout =
    document.getElementById(
      "checkout-section"
    );

  if (checkout) {
    checkout.style.display =
      "none";
  }
}


// ============================================================
// PRODUCT DATA
// ============================================================

function createProductData() {
  return cart
    .map(function (item) {
      return (
        item.productNo +
        ":" +
        item.quantity
      );
    })
    .join("|");
}


// ============================================================
// VALIDATE CHECKOUT
// ============================================================

function getCustomerData() {
  const name =
    document
      .getElementById(
        "customer-name"
      )
      .value
      .trim();

  const mobile =
    document
      .getElementById(
        "customer-mobile"
      )
      .value
      .replace(/\D/g, "");

  const address =
    document
      .getElementById(
        "customer-address"
      )
      .value
      .trim();

  const city =
    document
      .getElementById(
        "customer-city"
      )
      .value
      .trim();

  const pincode =
    document
      .getElementById(
        "customer-pincode"
      )
      .value
      .replace(/\D/g, "");

  if (!name) {
    alert("Please enter your name.");
    return null;
  }

  if (mobile.length !== 10) {
    alert(
      "Please enter a valid 10-digit mobile number."
    );
    return null;
  }

  if (!address) {
    alert(
      "Please enter your delivery address."
    );
    return null;
  }

  if (!city) {
    alert("Please enter your city.");
    return null;
  }

  if (pincode.length !== 6) {
    alert(
      "Please enter a valid 6-digit pincode."
    );
    return null;
  }

  if (!cart.length) {
    alert("Your cart is empty.");
    return null;
  }

  return {
    name: name,
    mobile: mobile,
    address: address,
    city: city,
    pincode: pincode
  };
}


// ============================================================
// FINAL PLACE ORDER
// ============================================================

async function placeOrder() {
  if (orderSubmissionInProgress) {
    return;
  }

  const customer =
    getCustomerData();

  if (!customer) return;

  orderSubmissionInProgress = true;

  const button =
    document.getElementById(
      "place-order-button"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Checking Stock...";
  }

  try {
    const latest =
      await fetchLatestCatalogue();

    products =
      normalizeProducts(
        latest.products
      );

    for (
      let i = 0;
      i < cart.length;
      i++
    ) {
      const item = cart[i];

      const product =
        findProduct(
          item.productNo
        );

      if (!product) {
        throw new Error(
          item.productName +
          " is no longer available."
        );
      }

      if (
        product.availableQty <= 0
      ) {
        throw new Error(
          product.productName +
          " is out of stock."
        );
      }

      if (
        item.quantity >
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

      item.price =
        product.offerPrice;
    }

    updateCart();

    const submissionId =
      "SUB-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 10);

    const orderData = {
      submissionId:
        submissionId,

      name:
        customer.name,

      mobile:
        customer.mobile,

      address:
        customer.address,

      city:
        customer.city,

      pincode:
        customer.pincode,

      productData:
        createProductData()
    };


    const form =
      document.createElement(
        "form"
      );

    form.method = "POST";

    form.action =
      googleScriptURL;

    form.target = "_blank";

    form.style.display = "none";


    const action =
      document.createElement(
        "input"
      );

    action.type = "hidden";
    action.name = "action";
    action.value = "placeOrder";


    const data =
      document.createElement(
        "input"
      );

    data.type = "hidden";
    data.name = "orderData";

    data.value =
      JSON.stringify(orderData);


    form.appendChild(action);
    form.appendChild(data);

    document.body.appendChild(form);

    form.submit();

    form.remove();


    if (button) {
      button.textContent =
        "Order Submitted - Check New Tab";
    }

    const message =
      document.getElementById(
        "order-message"
      );

    if (message) {
      message.textContent =
        "Please check the new tab for the confirmed order result. Do not press Place Order again.";
    }


  } catch (error) {
    orderSubmissionInProgress =
      false;

    if (button) {
      button.disabled = false;
      button.textContent =
        "Place Order";
    }

    alert(
      error.message ||
      "Unable to verify stock."
    );
  }
}


// ============================================================
// CATEGORY DRAWER
// ============================================================

function openCategoryMenu() {
  const menu =
    document.getElementById(
      "category-menu"
    );

  const overlay =
    document.getElementById(
      "category-overlay"
    );

  if (menu) {
    menu.classList.add("open");
  }

  if (overlay) {
    overlay.classList.add("show");
  }
}


function closeCategoryMenu() {
  const menu =
    document.getElementById(
      "category-menu"
    );

  const overlay =
    document.getElementById(
      "category-overlay"
    );

  if (menu) {
    menu.classList.remove("open");
  }

  if (overlay) {
    overlay.classList.remove("show");
  }
}


// ============================================================
// CUSTOMER DRAWER
// ============================================================

function openCustomerMenu() {
  const menu =
    document.getElementById(
      "customer-menu"
    );

  const overlay =
    document.getElementById(
      "customer-overlay"
    );

  if (menu) {
    menu.classList.add("open");
  }

  if (overlay) {
    overlay.classList.add("show");
  }
}


function closeCustomerMenu() {
  const menu =
    document.getElementById(
      "customer-menu"
    );

  const overlay =
    document.getElementById(
      "customer-overlay"
    );

  if (menu) {
    menu.classList.remove("open");
  }

  if (overlay) {
    overlay.classList.remove("show");
  }
}


// ============================================================
// CONTACT
// ============================================================

function openBusinessWhatsApp() {
  window.open(
    "https://wa.me/" +
    businessWhatsApp +
    "?text=" +
    encodeURIComponent(
      "Hello Festive Cart, I need assistance."
    ),
    "_blank"
  );
}


function openInstagram() {
  if (!instagramURL) {
    alert(
      "Festive Cart Instagram page will be added soon."
    );

    return;
  }

  window.open(
    instagramURL,
    "_blank"
  );
}


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(amount) {
  return (
    "₹" +
    (Number(amount) || 0)
      .toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2
        }
      )
  );
}


// ============================================================
// ESCAPE
// ============================================================

document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Escape") {
      closeCategoryMenu();
      closeCustomerMenu();
      closeCart();
    }
  }
);
