// ============================================================
// FESTIVE CART - COMPLETE SCRIPT.JS
// Product-card quantity synchronized with cart
// Same-tab order confirmation
// Automatic spreadsheet categories
// ============================================================


// ============================================================
// BUSINESS SETTINGS
// ============================================================

const businessWhatsApp = "919500417696";

const customerSupportNumber = "9500417696";

const instagramURL = "";

const googleScriptURL =
  "https://script.google.com/macros/s/AKfycbwtXCf4FvtaCEoKQH9PvXfwWc1Xa1UNLa_dcK5I1c11IJiolxfuybQCBqZ2OHtSy4ufDA/exec";


// ============================================================
// GLOBAL DATA
// ============================================================

let cart = [];

let products = [];

let categories = [];

let currentCategory = "all";

let catalogueLoaded = false;

let orderSubmissionInProgress = false;


// ============================================================
// START
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  updateCart();
  loadProducts();
});


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

  const loading =
    document.getElementById("products-loading");

  const errorBox =
    document.getElementById("products-error");

  const noProducts =
    document.getElementById("no-products");


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
      normalizeProducts(data.products);


    if (Array.isArray(data.categories)) {

      categories =
        normalizeCategories(data.categories);

    } else {

      categories =
        getCategoriesFromProducts();
    }


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


// ============================================================
// FETCH LATEST PRODUCT CATALOGUE
// ============================================================

async function fetchLatestCatalogue() {

  const response =
    await fetch(
      googleScriptURL +
      "?action=products&t=" +
      Date.now(),
      {
        method: "GET",
        cache: "no-store"
      }
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


// ============================================================
// NORMALIZE PRODUCTS
// ============================================================

function normalizeProducts(list) {

  if (!Array.isArray(list)) {
    return [];
  }


  return list.map(function (p) {

    return {

      category:
        String(
          p.category || ""
        ).trim(),

      productNo:
        String(
          p.productNo || ""
        )
          .trim()
          .toUpperCase(),

      productName:
        String(
          p.productName || ""
        ).trim(),

      description:
        String(
          p.description || ""
        ).trim(),

      actualPrice:
        Number(
          p.actualPrice
        ) || 0,

      offerPrice:
        Number(
          p.offerPrice
        ) || 0,

      availableQty:
        Math.max(
          0,
          Number(
            p.availableQty
          ) || 0
        ),

      stockStatus:
        String(
          p.stockStatus || ""
        )
          .trim()
          .toUpperCase(),

      imageURL:
        String(
          p.imageURL || ""
        ).trim()
    };
  });
}


// ============================================================
// NORMALIZE CATEGORIES
// ============================================================

function normalizeCategories(list) {

  const clean = [];


  list.forEach(function (category) {

    const name =
      String(
        category || ""
      ).trim();


    if (
      name &&
      !clean.includes(name)
    ) {

      clean.push(name);
    }
  });


  return clean;
}


// ============================================================
// CATEGORY FALLBACK
// ============================================================

function getCategoriesFromProducts() {

  const result = [];


  products.forEach(function (product) {

    if (
      product.category &&
      !result.includes(
        product.category
      )
    ) {

      result.push(
        product.category
      );
    }
  });


  return result;
}


// ============================================================
// CATEGORY MENU
// ============================================================

function createCategoryMenu() {

  const categoryList =
    document.getElementById(
      "category-list"
    );


  if (!categoryList) {
    return;
  }


  categoryList.innerHTML = "";


  // ALL PRODUCTS

  const allButton =
    document.createElement(
      "button"
    );

  allButton.type = "button";

  allButton.className =
    "menu-item";

  allButton.textContent =
    "All Products";

  allButton.onclick =
    function () {

      filterProducts("all");
    };


  categoryList.appendChild(
    allButton
  );


  // SPREADSHEET CATEGORIES

  categories.forEach(
    function (category) {

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        "menu-item";

      button.textContent =
        category;

      button.onclick =
        function () {

          filterProducts(
            category
          );
        };


      categoryList.appendChild(
        button
      );
    }
  );


  updateActiveCategoryButton();
}


// ============================================================
// FILTER PRODUCTS
// ============================================================

function filterProducts(category) {

  currentCategory =
    category || "all";


  updateActiveCategoryButton();

  renderProducts();

  closeCategoryMenu();
}


// ============================================================
// ACTIVE CATEGORY
// ============================================================

function updateActiveCategoryButton() {

  const categoryList =
    document.getElementById(
      "category-list"
    );


  if (!categoryList) {
    return;
  }


  categoryList
    .querySelectorAll(
      ".menu-item"
    )
    .forEach(
      function (button) {

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
      }
    );
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


  if (!list) {
    return;
  }


  list.innerHTML = "";


  const visibleProducts =
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


  if (!visibleProducts.length) {

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


  const fragment =
    document.createDocumentFragment();


  visibleProducts.forEach(
    function (product, index) {

      fragment.appendChild(
        createProductCard(
          product,
          index
        )
      );
    }
  );


  list.appendChild(fragment);
}


// ============================================================
// CREATE PRODUCT CARD
// ============================================================

function createProductCard(
  product,
  index
) {

  const card =
    document.createElement(
      "article"
    );

  card.className = "product";


  // ==========================================================
  // IMAGE
  // ==========================================================

  const imageContainer =
    document.createElement(
      "div"
    );

  imageContainer.className =
    "product-image-container";


  const placeholder =
    document.createElement(
      "div"
    );

  placeholder.className =
    "image-placeholder";

  placeholder.textContent =
    "Product Image";


  if (product.imageURL) {

    const image =
      document.createElement(
        "img"
      );

    image.src =
      product.imageURL;

    image.alt =
      product.productName;

    image.className =
      "product-image";


    if (index === 0) {

      image.loading = "eager";

      try {
        image.fetchPriority =
          "high";
      } catch (error) {}

    } else {

      image.loading = "lazy";

      try {
        image.fetchPriority =
          "low";
      } catch (error) {}
    }


    image.decoding = "async";


    image.onload =
      function () {

        placeholder.style.display =
          "none";
      };


    image.onerror =
      function () {

        image.style.display =
          "none";

        placeholder.style.display =
          "flex";
      };


    imageContainer.appendChild(
      image
    );
  }


  imageContainer.appendChild(
    placeholder
  );

  card.appendChild(
    imageContainer
  );


  // ==========================================================
  // PRODUCT INFO
  // ==========================================================

  const info =
    document.createElement(
      "div"
    );

  info.className =
    "product-info";


  const number =
    document.createElement(
      "div"
    );

  number.className =
    "product-number";

  number.textContent =
    product.productNo;

  info.appendChild(number);


  const name =
    document.createElement(
      "h3"
    );

  name.className =
    "product-name";

  name.textContent =
    product.productName;

  info.appendChild(name);


  if (product.description) {

    const description =
      document.createElement(
        "p"
      );

    description.className =
      "product-description";

    description.textContent =
      product.description;

    info.appendChild(
      description
    );
  }


  // ==========================================================
  // PRICE
  // ==========================================================

  const priceArea =
    document.createElement(
      "div"
    );

  priceArea.className =
    "product-price-area";


  if (
    product.actualPrice >
    product.offerPrice
  ) {

    const actual =
      document.createElement(
        "span"
      );

    actual.className =
      "actual-price";

    actual.textContent =
      formatCurrency(
        product.actualPrice
      );

    priceArea.appendChild(
      actual
    );
  }


  const offer =
    document.createElement(
      "span"
    );

  offer.className =
    "offer-price";

  offer.textContent =
    formatCurrency(
      product.offerPrice
    );

  priceArea.appendChild(
    offer
  );

  info.appendChild(
    priceArea
  );


  // ==========================================================
  // STOCK STATUS
  // ==========================================================

  const inStock =
    product.availableQty > 0 &&
    product.stockStatus !==
      "OUT OF STOCK";


  const stock =
    document.createElement(
      "div"
    );

  stock.className =
    inStock
      ? "stock-status in-stock"
      : "stock-status out-of-stock";

  stock.textContent =
    inStock
      ? "In Stock"
      : "Out of Stock";

  info.appendChild(stock);


  // ==========================================================
  // ACTION ROW
  // ==========================================================

  const actionRow =
    document.createElement(
      "div"
    );

  actionRow.className =
    "product-action-row";


  // ==========================================================
  // ADD TO CART BUTTON
  // ==========================================================

  const addButton =
    document.createElement(
      "button"
    );

  addButton.type = "button";

  addButton.className =
    "add-button product-add-button";


  if (inStock) {

    addButton.textContent =
      "Add to Cart";

    addButton.onclick =
      function () {

        addToCart(
          product.productNo
        );
      };

  } else {

    addButton.textContent =
      "Out of Stock";

    addButton.disabled = true;

    addButton.classList.add(
      "disabled"
    );
  }


  actionRow.appendChild(
    addButton
  );


  // ==========================================================
  // QUANTITY CONTROL
  //
  // IMPORTANT:
  // It is created ONLY when this product is already in cart.
  // ==========================================================

  const cartItem =
    cart.find(
      function (item) {

        return (
          item.productNo ===
          product.productNo
        );
      }
    );


  if (
    inStock &&
    cartItem &&
    cartItem.quantity > 0
  ) {

    const quantityControls =
      document.createElement(
        "div"
      );

    quantityControls.className =
      "product-quantity-controls";


    // MINUS

    const minusButton =
      document.createElement(
        "button"
      );

    minusButton.type = "button";

    minusButton.className =
      "product-quantity-button";

    minusButton.textContent = "−";

    minusButton.setAttribute(
      "aria-label",
      "Decrease quantity"
    );

    minusButton.onclick =
      function () {

        decreaseQuantity(
          product.productNo
        );
      };


    // QUANTITY NUMBER

    const quantity =
      document.createElement(
        "span"
      );

    quantity.className =
      "product-selected-quantity";

    quantity.textContent =
      cartItem.quantity;


    // PLUS

    const plusButton =
      document.createElement(
        "button"
      );

    plusButton.type = "button";

    plusButton.className =
      "product-quantity-button";

    plusButton.textContent = "+";

    plusButton.setAttribute(
      "aria-label",
      "Increase quantity"
    );

    plusButton.onclick =
      function () {

        increaseQuantity(
          product.productNo
        );
      };


    quantityControls.appendChild(
      minusButton
    );

    quantityControls.appendChild(
      quantity
    );

    quantityControls.appendChild(
      plusButton
    );


    actionRow.appendChild(
      quantityControls
    );
  }


  info.appendChild(
    actionRow
  );

  card.appendChild(info);

  return card;
}


// ============================================================
// FIND PRODUCT
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


// ============================================================
// FIND CART ITEM
// ============================================================

function findCartItem(productNo) {

  return cart.find(
    function (item) {

      return (
        item.productNo ===
        String(productNo)
          .trim()
          .toUpperCase()
      );
    }
  );
}


// ============================================================
// ADD TO CART
//
// First click:
// 0 -> 1
//
// If already in cart:
// Add to Cart also increases it by one.
// ============================================================

function addToCart(productNo) {

  const product =
    findProduct(productNo);


  if (!product) {
    return;
  }


  if (
    product.availableQty <= 0 ||
    product.stockStatus ===
      "OUT OF STOCK"
  ) {

    alert(
      "This product is out of stock."
    );

    return;
  }


  const existing =
    findCartItem(
      product.productNo
    );


  if (existing) {

    if (
      existing.quantity >=
      product.availableQty
    ) {

      alert(
        "Only " +
        product.availableQty +
        " item(s) of " +
        product.productName +
        " are currently available."
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

      quantity: 1
    });
  }


  syncCartAndProducts();
}


// ============================================================
// INCREASE QUANTITY
//
// Used by BOTH:
// 1. Product card +
// 2. Cart +
// ============================================================

function increaseQuantity(productNo) {

  const item =
    findCartItem(productNo);

  const product =
    findProduct(productNo);


  if (
    !item ||
    !product
  ) {
    return;
  }


  if (
    item.quantity >=
    product.availableQty
  ) {

    alert(
      "Only " +
      product.availableQty +
      " item(s) of " +
      product.productName +
      " are currently available."
    );

    return;
  }


  item.quantity++;


  syncCartAndProducts();
}


// ============================================================
// DECREASE QUANTITY
//
// 3 -> 2
// 2 -> 1
// 1 -> 0
//
// At zero:
// item is removed from cart and product-card
// quantity controls disappear.
// ============================================================

function decreaseQuantity(productNo) {

  const item =
    findCartItem(productNo);


  if (!item) {
    return;
  }


  item.quantity--;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        function (cartItem) {

          return (
            cartItem.productNo !==
            item.productNo
          );
        }
      );
  }


  syncCartAndProducts();
}


// ============================================================
// REMOVE FROM CART
// ============================================================

function removeFromCart(productNo) {

  const normalizedProductNo =
    String(productNo)
      .trim()
      .toUpperCase();


  cart =
    cart.filter(
      function (item) {

        return (
          item.productNo !==
          normalizedProductNo
        );
      }
    );


  syncCartAndProducts();
}


// ============================================================
// SYNCHRONIZE PRODUCT CARDS + CART
//
// This is the important part.
//
// Any quantity change made:
// - on product card
// - inside cart
//
// updates BOTH places.
// ============================================================

function syncCartAndProducts() {

  updateCart();

  renderProducts();
}


// ============================================================
// CART TOTAL
// ============================================================

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


// ============================================================
// CART COUNT
// ============================================================

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


// ============================================================
// UPDATE CART
// ============================================================

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
      document.createElement(
        "p"
      );

    empty.className =
      "empty-cart-message";

    empty.textContent =
      "Your cart is empty.";

    itemsBox.appendChild(
      empty
    );


    updateCheckoutSummary();

    return;
  }


  const fragment =
    document.createDocumentFragment();


  cart.forEach(
    function (item) {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "cart-item";


      // PRODUCT DETAILS

      const details =
        document.createElement(
          "div"
        );

      details.className =
        "cart-item-details";


      const name =
        document.createElement(
          "div"
        );

      name.className =
        "cart-item-name";

      name.textContent =
        item.productName;


      const number =
        document.createElement(
          "div"
        );

      number.className =
        "cart-item-product-number";

      number.textContent =
        item.productNo;


      const price =
        document.createElement(
          "div"
        );

      price.className =
        "cart-item-price";

      price.textContent =
        formatCurrency(
          item.price
        ) +
        " each";


      details.appendChild(name);

      details.appendChild(number);

      details.appendChild(price);


      // CART QUANTITY CONTROLS

      const controls =
        document.createElement(
          "div"
        );

      controls.className =
        "cart-item-controls";


      const minus =
        document.createElement(
          "button"
        );

      minus.type = "button";

      minus.textContent = "−";

      minus.onclick =
        function () {

          decreaseQuantity(
            item.productNo
          );
        };


      const quantity =
        document.createElement(
          "span"
        );

      quantity.className =
        "cart-item-quantity";

      quantity.textContent =
        item.quantity;


      const plus =
        document.createElement(
          "button"
        );

      plus.type = "button";

      plus.textContent = "+";

      plus.onclick =
        function () {

          increaseQuantity(
            item.productNo
          );
        };


      const remove =
        document.createElement(
          "button"
        );

      remove.type = "button";

      remove.className =
        "remove-cart-item";

      remove.textContent =
        "Remove";

      remove.onclick =
        function () {

          removeFromCart(
            item.productNo
          );
        };


      controls.appendChild(
        minus
      );

      controls.appendChild(
        quantity
      );

      controls.appendChild(
        plus
      );

      controls.appendChild(
        remove
      );


      row.appendChild(
        details
      );

      row.appendChild(
        controls
      );


      fragment.appendChild(
        row
      );
    }
  );


  itemsBox.appendChild(
    fragment
  );


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


  if (!box) {
    return;
  }


  box.innerHTML = "";


  const fragment =
    document.createDocumentFragment();


  cart.forEach(
    function (item) {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "checkout-summary-item";


      const name =
        document.createElement(
          "span"
        );

      name.textContent =
        item.productName +
        " × " +
        item.quantity;


      const price =
        document.createElement(
          "strong"
        );

      price.textContent =
        formatCurrency(
          item.price *
          item.quantity
        );


      row.appendChild(name);

      row.appendChild(price);

      fragment.appendChild(row);
    }
  );


  box.appendChild(fragment);
}


// ============================================================
// OPEN CART
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

    popup.classList.add(
      "open"
    );
  }


  if (overlay) {

    overlay.classList.add(
      "show"
    );
  }
}


// ============================================================
// CLOSE CART
// ============================================================

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

    popup.classList.remove(
      "open"
    );
  }


  if (overlay) {

    overlay.classList.remove(
      "show"
    );
  }
}


// ============================================================
// SHOW CHECKOUT
// ============================================================

function showCheckout() {

  if (!cart.length) {

    alert(
      "Your cart is empty."
    );

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


// ============================================================
// CLOSE CHECKOUT
// ============================================================

function closeCheckout() {

  if (
    orderSubmissionInProgress
  ) {
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
// CREATE PRODUCT DATA
// ============================================================

function createProductData() {

  return cart
    .map(
      function (item) {

        return (
          item.productNo +
          ":" +
          item.quantity
        );
      }
    )
    .join("|");
}


// ============================================================
// CUSTOMER DATA
// ============================================================

function getCustomerData() {

  const nameElement =
    document.getElementById(
      "customer-name"
    );

  const mobileElement =
    document.getElementById(
      "customer-mobile"
    );

  const addressElement =
    document.getElementById(
      "customer-address"
    );

  const cityElement =
    document.getElementById(
      "customer-city"
    );

  const pincodeElement =
    document.getElementById(
      "customer-pincode"
    );


  if (
    !nameElement ||
    !mobileElement ||
    !addressElement ||
    !cityElement ||
    !pincodeElement
  ) {

    alert(
      "Checkout form could not be loaded."
    );

    return null;
  }


  const name =
    nameElement.value.trim();

  const mobile =
    mobileElement.value.replace(
      /\D/g,
      ""
    );

  const address =
    addressElement.value.trim();

  const city =
    cityElement.value.trim();

  const pincode =
    pincodeElement.value.replace(
      /\D/g,
      ""
    );


  if (!name) {

    alert(
      "Please enter your name."
    );

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

    alert(
      "Please enter your city."
    );

    return null;
  }


  if (pincode.length !== 6) {

    alert(
      "Please enter a valid 6-digit pincode."
    );

    return null;
  }


  if (!cart.length) {

    alert(
      "Your cart is empty."
    );

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
// PLACE ORDER
// ============================================================

async function placeOrder() {

  if (
    orderSubmissionInProgress
  ) {
    return;
  }


  const customer =
    getCustomerData();


  if (!customer) {
    return;
  }


  orderSubmissionInProgress =
    true;


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

    // ========================================================
    // FRESH CATALOGUE CHECK
    // ========================================================

    const latest =
      await fetchLatestCatalogue();


    products =
      normalizeProducts(
        latest.products
      );


    if (
      Array.isArray(
        latest.categories
      )
    ) {

      categories =
        normalizeCategories(
          latest.categories
        );
    }


    // ========================================================
    // VERIFY EACH CART ITEM AGAINST CURRENT STOCK
    // ========================================================

    for (
      let i = 0;
      i < cart.length;
      i++
    ) {

      const item =
        cart[i];


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
        product.availableQty <= 0 ||
        product.stockStatus ===
          "OUT OF STOCK"
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


      // Always use latest server price.

      item.price =
        product.offerPrice;
    }


    updateCart();

    renderProducts();


    // ========================================================
    // UNIQUE SUBMISSION ID
    // ========================================================

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


    // ========================================================
    // NORMAL FORM POST TO APPS SCRIPT
    // ========================================================

    const form =
      document.createElement(
        "form"
      );


    form.method = "POST";

    form.action =
      googleScriptURL;


    // SAME BROWSER TAB

    form.target = "_self";


    form.style.display =
      "none";


    // ACTION

    const action =
      document.createElement(
        "input"
      );

    action.type = "hidden";

    action.name = "action";

    action.value =
      "placeOrder";


    // ORDER DATA

    const data =
      document.createElement(
        "input"
      );

    data.type = "hidden";

    data.name = "orderData";

    data.value =
      JSON.stringify(
        orderData
      );


    form.appendChild(action);

    form.appendChild(data);

    document.body.appendChild(
      form
    );


    if (button) {

      button.textContent =
        "Placing Order...";
    }


    // Apps Script now validates and
    // displays the confirmed order page.

    form.submit();


  } catch (error) {

    orderSubmissionInProgress =
      false;


    if (button) {

      button.disabled = false;

      button.textContent =
        "Place Order";
    }


    // Refresh the product display using
    // the latest catalogue we received.

    renderProducts();


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

    menu.classList.add(
      "open"
    );
  }


  if (overlay) {

    overlay.classList.add(
      "show"
    );
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

    menu.classList.remove(
      "open"
    );
  }


  if (overlay) {

    overlay.classList.remove(
      "show"
    );
  }
}


// ============================================================
// CUSTOMER / CONTACT MENU
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

    menu.classList.add(
      "open"
    );
  }


  if (overlay) {

    overlay.classList.add(
      "show"
    );
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

    menu.classList.remove(
      "open"
    );
  }


  if (overlay) {

    overlay.classList.remove(
      "show"
    );
  }
}


// ============================================================
// WHATSAPP
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


// ============================================================
// INSTAGRAM
// ============================================================

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
    (
      Number(amount) || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2
      }
    )
  );
}


// ============================================================
// ESCAPE KEY
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
