// ============================================================
// FESTIVE CART - SCRIPT.JS
// AUTOMATIC CATEGORIES
// OPTIMIZED IMAGE LOADING
// PRODUCT QUANTITY SELECTOR
// SAME-TAB ORDER CONFIRMATION
// ============================================================


// ============================================================
// BUSINESS SETTINGS
// ============================================================

const businessWhatsApp =
  "919500417696";

const customerSupportNumber =
  "9500417696";

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


// Stores the quantity currently selected
// beside each product card.
//
// Example:
// {
//   "WR001": 2,
//   "TREE001": 1
// }

let productSelectedQuantities = {};


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
// LOAD PRODUCTS
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

    loading.style.display =
      "block";
  }


  if (errorBox) {

    errorBox.style.display =
      "none";
  }


  if (noProducts) {

    noProducts.style.display =
      "none";
  }


  try {

    const data =
      await fetchLatestCatalogue();


    products =
      normalizeProducts(
        data.products
      );


    // --------------------------------------------------------
    // AUTOMATIC CATEGORIES
    // --------------------------------------------------------

    if (
      Array.isArray(
        data.categories
      )
    ) {

      categories =
        normalizeCategories(
          data.categories
        );

    } else {

      categories =
        getCategoriesFromProducts();
    }


    // Make sure every product has
    // a default selected quantity of 1.

    products.forEach(
      function (product) {

        if (
          !productSelectedQuantities[
            product.productNo
          ]
        ) {

          productSelectedQuantities[
            product.productNo
          ] = 1;
        }
      }
    );


    catalogueLoaded = true;


    if (loading) {

      loading.style.display =
        "none";
    }


    createCategoryMenu();

    renderProducts();


  } catch (error) {

    console.error(error);

    catalogueLoaded = false;


    if (loading) {

      loading.style.display =
        "none";
    }


    if (errorBox) {

      errorBox.style.display =
        "block";
    }
  }
}


// ============================================================
// FETCH LATEST CATALOGUE
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
    !Array.isArray(
      data.products
    )
  ) {

    throw new Error(

      data &&
      data.error

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


  return list.map(

    function (p) {

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
    }
  );
}


// ============================================================
// NORMALIZE CATEGORIES
// ============================================================

function normalizeCategories(list) {

  const clean = [];


  list.forEach(

    function (category) {

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
    }
  );


  return clean;
}


// ============================================================
// CATEGORY FALLBACK
// ============================================================

function getCategoriesFromProducts() {

  const result = [];


  products.forEach(

    function (product) {

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
    }
  );


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


  categoryList.innerHTML =
    "";


  // ----------------------------------------------------------
  // ALL PRODUCTS BUTTON
  // ----------------------------------------------------------

  const allButton =
    document.createElement(
      "button"
    );


  allButton.type =
    "button";


  allButton.className =
    "menu-item";


  allButton.textContent =
    "All Products";


  allButton.onclick =
    function () {

      filterProducts(
        "all"
      );
    };


  categoryList.appendChild(
    allButton
  );


  // ----------------------------------------------------------
  // SHEET CATEGORIES
  // ----------------------------------------------------------

  categories.forEach(

    function (category) {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


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
// ACTIVE CATEGORY BUTTON
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
          currentCategory ===
            "all" &&

          button
            .textContent
            .trim() ===
            "All Products"
        ) {

          button.classList.add(
            "active-category"
          );
        }


        if (
          currentCategory !==
            "all" &&

          button
            .textContent
            .trim() ===
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


  list.innerHTML =
    "";


  const visible =

    currentCategory ===
      "all"

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


  const fragment =
    document.createDocumentFragment();


  visible.forEach(

    function (
      product,
      index
    ) {

      fragment.appendChild(

        createProductCard(
          product,
          index
        )
      );
    }
  );


  list.appendChild(
    fragment
  );
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


  card.className =
    "product";


  // ==========================================================
  // PRODUCT IMAGE
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


    // First visible product gets
    // loading priority.

    if (index === 0) {

      image.loading =
        "eager";


      try {

        image.fetchPriority =
          "high";

      } catch (error) {

        // Ignore unsupported browser.
      }

    } else {

      image.loading =
        "lazy";


      try {

        image.fetchPriority =
          "low";

      } catch (error) {

        // Ignore unsupported browser.
      }
    }


    image.decoding =
      "async";


    placeholder.style.display =
      "flex";


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
  // PRODUCT INFORMATION
  // ==========================================================

  const info =
    document.createElement(
      "div"
    );


  info.className =
    "product-info";


  // ----------------------------------------------------------
  // PRODUCT NUMBER
  // ----------------------------------------------------------

  const number =
    document.createElement(
      "div"
    );


  number.className =
    "product-number";


  number.textContent =
    product.productNo;


  info.appendChild(
    number
  );


  // ----------------------------------------------------------
  // PRODUCT NAME
  // ----------------------------------------------------------

  const name =
    document.createElement(
      "h3"
    );


  name.className =
    "product-name";


  name.textContent =
    product.productName;


  info.appendChild(
    name
  );


  // ----------------------------------------------------------
  // DESCRIPTION
  // ----------------------------------------------------------

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
  // STOCK
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


  info.appendChild(
    stock
  );


  // ==========================================================
  // PRODUCT ACTION ROW
  //
  // LEFT:
  // Add to Cart
  //
  // RIGHT:
  // -  quantity  +
  // ==========================================================

  const actionRow =
    document.createElement(
      "div"
    );


  actionRow.className =
    "product-action-row";


  // ----------------------------------------------------------
  // ADD TO CART BUTTON
  // ----------------------------------------------------------

  const addButton =
    document.createElement(
      "button"
    );


  addButton.type =
    "button";


  addButton.className =
    "add-button product-add-button";


  // ----------------------------------------------------------
  // QUANTITY CONTROL AREA
  // ----------------------------------------------------------

  const quantityControls =
    document.createElement(
      "div"
    );


  quantityControls.className =
    "product-quantity-controls";


  // MINUS BUTTON

  const minusButton =
    document.createElement(
      "button"
    );


  minusButton.type =
    "button";


  minusButton.className =
    "product-quantity-button";


  minusButton.textContent =
    "−";


  // QUANTITY DISPLAY

  const quantityDisplay =
    document.createElement(
      "span"
    );


  quantityDisplay.className =
    "product-selected-quantity";


  // PLUS BUTTON

  const plusButton =
    document.createElement(
      "button"
    );


  plusButton.type =
    "button";


  plusButton.className =
    "product-quantity-button";


  plusButton.textContent =
    "+";


  // ----------------------------------------------------------
  // INITIAL QUANTITY
  // ----------------------------------------------------------

  if (
    !productSelectedQuantities[
      product.productNo
    ]
  ) {

    productSelectedQuantities[
      product.productNo
    ] = 1;
  }


  let selectedQuantity =
    productSelectedQuantities[
      product.productNo
    ];


  // Safety in case stock has changed.

  if (
    inStock &&
    selectedQuantity >
      product.availableQty
  ) {

    selectedQuantity =
      product.availableQty;


    productSelectedQuantities[
      product.productNo
    ] =
      selectedQuantity;
  }


  if (
    selectedQuantity < 1
  ) {

    selectedQuantity = 1;


    productSelectedQuantities[
      product.productNo
    ] = 1;
  }


  quantityDisplay.textContent =
    selectedQuantity;


  // ==========================================================
  // IN STOCK CONTROLS
  // ==========================================================

  if (inStock) {

    addButton.textContent =
      "Add to Cart";


    addButton.onclick =
      function () {

        addSelectedQuantityToCart(
          product.productNo
        );
      };


    minusButton.onclick =
      function () {

        decreaseProductSelection(
          product.productNo,
          quantityDisplay
        );
      };


    plusButton.onclick =
      function () {

        increaseProductSelection(
          product.productNo,
          quantityDisplay
        );
      };


  } else {

    // ========================================================
    // OUT OF STOCK
    // ========================================================

    addButton.textContent =
      "Out of Stock";


    addButton.disabled =
      true;


    addButton.classList.add(
      "disabled"
    );


    minusButton.disabled =
      true;


    plusButton.disabled =
      true;


    quantityDisplay.textContent =
      "0";


    quantityControls.classList.add(
      "disabled"
    );
  }


  quantityControls.appendChild(
    minusButton
  );


  quantityControls.appendChild(
    quantityDisplay
  );


  quantityControls.appendChild(
    plusButton
  );


  actionRow.appendChild(
    addButton
  );


  actionRow.appendChild(
    quantityControls
  );


  info.appendChild(
    actionRow
  );


  card.appendChild(
    info
  );


  return card;
}


// ============================================================
// PRODUCT-CARD QUANTITY - DECREASE
// ============================================================

function decreaseProductSelection(
  productNo,
  display
) {

  const product =
    findProduct(
      productNo
    );


  if (!product) {

    return;
  }


  let quantity =
    productSelectedQuantities[
      productNo
    ] || 1;


  // On the product card,
  // quantity cannot go below 1.

  if (quantity > 1) {

    quantity--;
  }


  productSelectedQuantities[
    productNo
  ] = quantity;


  if (display) {

    display.textContent =
      quantity;
  }
}


// ============================================================
// PRODUCT-CARD QUANTITY - INCREASE
// ============================================================

function increaseProductSelection(
  productNo,
  display
) {

  const product =
    findProduct(
      productNo
    );


  if (!product) {

    return;
  }


  let quantity =
    productSelectedQuantities[
      productNo
    ] || 1;


  // ----------------------------------------------------------
  // CHECK QUANTITY ALREADY IN CART
  // ----------------------------------------------------------

  const cartItem =
    cart.find(

      function (item) {

        return (
          item.productNo ===
          productNo
        );
      }
    );


  const alreadyInCart =

    cartItem

      ? cartItem.quantity

      : 0;


  // Maximum that can still be
  // selected for another Add to Cart.

  const remainingAvailable =

    product.availableQty -
    alreadyInCart;


  if (
    remainingAvailable <= 0
  ) {

    alert(
      "You already have the maximum available quantity of this product in your cart."
    );


    return;
  }


  if (
    quantity >=
    remainingAvailable
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


  quantity++;


  productSelectedQuantities[
    productNo
  ] = quantity;


  if (display) {

    display.textContent =
      quantity;
  }
}


// ============================================================
// FIND PRODUCT
// ============================================================

function findProduct(
  productNo
) {

  return products.find(

    function (product) {

      return (

        product.productNo ===

        String(
          productNo
        )
          .trim()
          .toUpperCase()
      );
    }
  );
}


// ============================================================
// ADD SELECTED PRODUCT QUANTITY TO CART
// ============================================================

function addSelectedQuantityToCart(
  productNo
) {

  const product =
    findProduct(
      productNo
    );


  if (!product) {

    return;
  }


  if (
    product.availableQty <= 0
  ) {

    alert(
      "This product is out of stock."
    );


    return;
  }


  let selectedQuantity =

    productSelectedQuantities[
      productNo
    ] || 1;


  selectedQuantity =
    Math.max(
      1,
      Number(
        selectedQuantity
      ) || 1
    );


  const existing =
    cart.find(

      function (item) {

        return (

          item.productNo ===
          product.productNo
        );
      }
    );


  const currentCartQuantity =

    existing

      ? existing.quantity

      : 0;


  const newTotalQuantity =

    currentCartQuantity +
    selectedQuantity;


  // ----------------------------------------------------------
  // DO NOT ALLOW MORE THAN AVAILABLE STOCK
  // ----------------------------------------------------------

  if (
    newTotalQuantity >
    product.availableQty
  ) {

    const remaining =

      product.availableQty -
      currentCartQuantity;


    if (remaining <= 0) {

      alert(
        "You already have the maximum available quantity of this product in your cart."
      );

    } else {

      alert(
        "You can add only " +
        remaining +
        " more item(s) of " +
        product.productName +
        "."
      );
    }


    return;
  }


  // ----------------------------------------------------------
  // ADD TO EXISTING CART ITEM
  // ----------------------------------------------------------

  if (existing) {

    existing.quantity =
      newTotalQuantity;

  } else {

    cart.push({

      productNo:
        product.productNo,

      productName:
        product.productName,

      price:
        product.offerPrice,

      quantity:
        selectedQuantity
    });
  }


  // ----------------------------------------------------------
  // RESET PRODUCT SELECTOR TO 1
  //
  // This prevents the customer accidentally
  // adding the same large quantity twice.
  // ----------------------------------------------------------

  productSelectedQuantities[
    productNo
  ] = 1;


  updateCart();


  // Re-render so selector visibly
  // returns to 1.

  renderProducts();
}


// ============================================================
// OLD SINGLE-ITEM ADD FUNCTION
//
// Kept for compatibility in case any existing HTML
// or future code still calls addToCart().
// ============================================================

function addToCart(
  productNo
) {

  productSelectedQuantities[
    productNo
  ] = 1;


  addSelectedQuantityToCart(
    productNo
  );
}


// ============================================================
// CART - INCREASE QUANTITY
// ============================================================

function increaseQuantity(
  productNo
) {

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
    findProduct(
      productNo
    );


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
      " item(s) are currently available."
    );


    return;
  }


  item.quantity++;


  updateCart();
}


// ============================================================
// CART - DECREASE QUANTITY
// ============================================================

function decreaseQuantity(
  productNo
) {

  const item =
    cart.find(

      function (item) {

        return (
          item.productNo ===
          productNo
        );
      }
    );


  if (!item) {

    return;
  }


  item.quantity--;


  if (
    item.quantity <= 0
  ) {

    removeFromCart(
      productNo
    );


    return;
  }


  updateCart();
}


// ============================================================
// REMOVE FROM CART
// ============================================================

function removeFromCart(
  productNo
) {

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


// ============================================================
// CART TOTAL
// ============================================================

function getCartTotal() {

  return cart.reduce(

    function (
      total,
      item
    ) {

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

    function (
      total,
      item
    ) {

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
      formatCurrency(
        total
      );
  }


  if (barTotal) {

    barTotal.textContent =
      formatCurrency(
        total
      );
  }


  if (checkoutButton) {

    checkoutButton.disabled =
      cart.length === 0;
  }


  if (!itemsBox) {

    updateCheckoutSummary();

    return;
  }


  itemsBox.innerHTML =
    "";


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


      // ------------------------------------------------------
      // PRODUCT DETAILS
      // ------------------------------------------------------

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


      details.appendChild(
        name
      );


      details.appendChild(
        number
      );


      details.appendChild(
        price
      );


      // ------------------------------------------------------
      // SECOND-CHANCE QUANTITY CONTROLS
      // ------------------------------------------------------

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


      minus.type =
        "button";


      minus.textContent =
        "−";


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


      plus.type =
        "button";


      plus.textContent =
        "+";


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


      remove.type =
        "button";


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


  box.innerHTML =
    "";


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


      row.appendChild(
        name
      );


      row.appendChild(
        price
      );


      fragment.appendChild(
        row
      );
    }
  );


  box.appendChild(
    fragment
  );
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
// CHECKOUT DISPLAY
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
      .replace(
        /\D/g,
        ""
      );


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
      .replace(
        /\D/g,
        ""
      );


  if (!name) {

    alert(
      "Please enter your name."
    );


    return null;
  }


  if (
    mobile.length !== 10
  ) {

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


  if (
    pincode.length !== 6
  ) {

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
// PLACE ORDER
// SAME-TAB ORDER CONFIRMATION
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

    button.disabled =
      true;


    button.textContent =
      "Checking Stock...";
  }


  try {

    // --------------------------------------------------------
    // FRESH SERVER STOCK CHECK
    //
    // This is intentionally retained.
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // VERIFY EVERY CART ITEM
    // --------------------------------------------------------

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


      // Latest server price wins.

      item.price =
        product.offerPrice;
    }


    updateCart();


    // --------------------------------------------------------
    // UNIQUE SUBMISSION ID
    // --------------------------------------------------------

    const submissionId =

      "SUB-" +

      Date.now() +

      "-" +

      Math.random()
        .toString(36)
        .substring(
          2,
          10
        );


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


    // --------------------------------------------------------
    // FORM SUBMISSION
    // --------------------------------------------------------

    const form =
      document.createElement(
        "form"
      );


    form.method =
      "POST";


    form.action =
      googleScriptURL;


    // SAME TAB

    form.target =
      "_self";


    form.style.display =
      "none";


    // ACTION INPUT

    const action =
      document.createElement(
        "input"
      );


    action.type =
      "hidden";


    action.name =
      "action";


    action.value =
      "placeOrder";


    // ORDER DATA INPUT

    const data =
      document.createElement(
        "input"
      );


    data.type =
      "hidden";


    data.name =
      "orderData";


    data.value =
      JSON.stringify(
        orderData
      );


    form.appendChild(
      action
    );


    form.appendChild(
      data
    );


    document.body.appendChild(
      form
    );


    if (button) {

      button.textContent =
        "Placing Order...";
    }


    // --------------------------------------------------------
    // APPS SCRIPT NOW TAKES OVER THIS TAB.
    //
    // It verifies and creates the order,
    // then displays the confirmed order page
    // containing the WhatsApp confirmation button.
    // --------------------------------------------------------

    form.submit();


  } catch (error) {

    orderSubmissionInProgress =
      false;


    if (button) {

      button.disabled =
        false;


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
// CUSTOMER MENU
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

function formatCurrency(
  amount
) {

  return (

    "₹" +

    (
      Number(amount) ||
      0
    ).toLocaleString(

      "en-IN",

      {
        maximumFractionDigits:
          2
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

    if (
      event.key ===
      "Escape"
    ) {

      closeCategoryMenu();

      closeCustomerMenu();

      closeCart();
    }
  }
);
