// ============================================================
// FESTIVE CART - SCRIPT.JS
// MULTIPLE PRODUCT IMAGE SLIDER - SWIPE + DOTS VERSION
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


// ============================================================
// NORMALIZE PRODUCTS
// Supports both old imageURL and new imageURLs
// ============================================================

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
        String(p.imageURL || "").trim(),

      imageURLs:
        Array.isArray(p.imageURLs)
          ? p.imageURLs
              .map(function (url) {
                return String(url || "").trim();
              })
              .filter(function (url) {
                return url !== "";
              })
          : (
              p.imageURL
                ? [String(p.imageURL).trim()]
                : []
            )
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


// ============================================================
// CREATE PRODUCT CARD
// ============================================================

function createProductCard(product) {
  const card =
    document.createElement("article");

  card.className = "product";


  // ==========================================================
  // PRODUCT IMAGE SLIDER
  // SWIPE + SMALL DOT INDICATORS
  // ==========================================================

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


  const imageURLs =
    Array.isArray(product.imageURLs) &&
    product.imageURLs.length
      ? product.imageURLs
      : (
          product.imageURL
            ? [product.imageURL]
            : []
        );


  if (imageURLs.length) {

    placeholder.style.display =
      "none";


    let currentImageIndex = 0;

    let touchStartX = 0;

    let touchEndX = 0;


    const image =
      document.createElement("img");

    image.src =
      imageURLs[0];

    image.alt =
      product.productName;

    image.className =
      "product-image";

    image.loading =
      "lazy";

    image.decoding =
      "async";

    image.draggable =
      false;


    const dots = [];


    // ========================================================
    // SHOW SELECTED IMAGE
    // ========================================================

    function showImage(index) {

      if (!imageURLs.length) {
        return;
      }


      if (index < 0) {

        index =
          imageURLs.length - 1;

      }


      if (
        index >=
        imageURLs.length
      ) {

        index = 0;

      }


      currentImageIndex =
        index;


      image.style.display =
        "block";


      placeholder.style.display =
        "none";


      image.src =
        imageURLs[
          currentImageIndex
        ];


      dots.forEach(
        function (
          dot,
          dotIndex
        ) {

          dot.classList.toggle(
            "active",
            dotIndex ===
              currentImageIndex
          );

        }
      );
    }


    // ========================================================
    // IMAGE LOAD / ERROR
    // ========================================================

    image.onerror =
      function () {

        image.style.display =
          "none";

        placeholder.style.display =
          "flex";

      };


    image.onload =
      function () {

        image.style.display =
          "block";

        placeholder.style.display =
          "none";

      };


    imageContainer.appendChild(
      image
    );


    // ========================================================
    // MULTIPLE IMAGES ONLY
    // ========================================================

    if (
      imageURLs.length > 1
    ) {

      imageContainer.classList.add(
        "has-image-slider"
      );


      // ======================================================
      // DOT INDICATORS
      // ======================================================

      const dotsContainer =
        document.createElement(
          "div"
        );

      dotsContainer.className =
        "product-image-dots";


      imageURLs.forEach(
        function (_, index) {

          const dot =
            document.createElement(
              "button"
            );

          dot.type =
            "button";

          dot.className =
            "product-image-dot";

          dot.setAttribute(
            "aria-label",
            "Show product image " +
              (index + 1)
          );


          dot.onclick =
            function (event) {

              event.preventDefault();

              event.stopPropagation();

              showImage(index);

            };


          dots.push(dot);

          dotsContainer.appendChild(
            dot
          );

        }
      );


      imageContainer.appendChild(
        dotsContainer
      );


      // ======================================================
      // MOBILE SWIPE
      // Swipe left  = next image
      // Swipe right = previous image
      // ======================================================

      imageContainer.addEventListener(
        "touchstart",
        function (event) {

          if (
            !event.touches.length
          ) {
            return;
          }

          touchStartX =
            event.touches[0]
              .clientX;

          touchEndX =
            touchStartX;

        },
        {
          passive: true
        }
      );


      imageContainer.addEventListener(
        "touchmove",
        function (event) {

          if (
            !event.touches.length
          ) {
            return;
          }

          touchEndX =
            event.touches[0]
              .clientX;

        },
        {
          passive: true
        }
      );


      imageContainer.addEventListener(
        "touchend",
        function () {

          const swipeDistance =
            touchEndX -
            touchStartX;


          // Ignore very small finger movements.
          if (
            Math.abs(
              swipeDistance
            ) < 40
          ) {

            return;

          }


          // Swipe left = next image.
          if (
            swipeDistance < 0
          ) {

            showImage(
              currentImageIndex + 1
            );

          } else {

            // Swipe right = previous image.
            showImage(
              currentImageIndex - 1
            );

          }

        },
        {
          passive: true
        }
      );


      showImage(0);
    }
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
    document.createElement("div");

  info.className =
    "product-info";


  const number =
    document.createElement("div");

  number.className =
    "product-number";

  number.textContent =
    product.productNo;

  info.appendChild(number);


  const name =
    document.createElement("h3");

  name.className =
    "product-name";

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

    info.appendChild(
      description
    );
  }


  // ==========================================================
  // PRICE
  // ==========================================================

  const priceArea =
    document.createElement("div");

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

  info.appendChild(stock);


  // ==========================================================
  // PRODUCT ACTION ROW
  // ==========================================================

  const actionRow =
    document.createElement(
      "div"
    );

  actionRow.className =
    "product-action-row";


  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "add-button";


  const quantityControls =
    document.createElement(
      "div"
    );

  quantityControls.className =
    "product-quantity-controls";


  const minus =
    document.createElement(
      "button"
    );

  minus.type =
    "button";

  minus.className =
    "product-quantity-button";

  minus.textContent =
    "−";


  const quantity =
    document.createElement(
      "span"
    );

  quantity.className =
    "product-quantity-value";


  const plus =
    document.createElement(
      "button"
    );

  plus.type =
    "button";

  plus.className =
    "product-quantity-button";

  plus.textContent =
    "+";


  function refreshProductControls() {

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
      cartItem &&
      cartItem.quantity > 0
    ) {

      quantity.textContent =
        cartItem.quantity;

      quantityControls.classList.add(
        "show"
      );

      actionRow.classList.add(
        "has-quantity"
      );

    } else {

      quantity.textContent =
        "0";

      quantityControls.classList.remove(
        "show"
      );

      actionRow.classList.remove(
        "has-quantity"
      );
    }
  }


  if (inStock) {

    button.textContent =
      "Add to Cart";


    button.onclick =
      function () {

        addToCart(
          product.productNo
        );

        refreshProductControls();

      };


    minus.onclick =
      function () {

        decreaseQuantity(
          product.productNo
        );

        refreshProductControls();

      };


    plus.onclick =
      function () {

        increaseQuantity(
          product.productNo
        );

        refreshProductControls();

      };

  } else {

    button.textContent =
      "Out of Stock";

    button.disabled =
      true;

    button.classList.add(
      "disabled"
    );
  }


  quantityControls.appendChild(
    minus
  );

  quantityControls.appendChild(
    quantity
  );

  quantityControls.appendChild(
    plus
  );


  actionRow.appendChild(
    button
  );

  actionRow.appendChild(
    quantityControls
  );


  info.appendChild(
    actionRow
  );


  refreshProductControls();


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


  if (
    product.availableQty <= 0
  ) {

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

      // Cart uses the first product image.
      imageURL:
        product.imageURL ||
        (
          product.imageURLs &&
          product.imageURLs[0]
            ? product.imageURLs[0]
            : ""
        ),

      quantity:
        1
    });
  }


  updateCart();
}


// ============================================================
// INCREASE QUANTITY
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
      " item(s) are currently available."
    );

    return;
  }


  item.quantity++;

  updateCart();
}


// ============================================================
// DECREASE QUANTITY
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


  if (!item) return;


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
// REMOVE PRODUCT
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

    if (catalogueLoaded) {
      renderProducts();
    }

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


    if (catalogueLoaded) {

      renderProducts();

    }


    return;
  }


  cart.forEach(
    function (item) {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "cart-item";


      // ======================================================
      // SMALL PRODUCT IMAGE
      // ======================================================

      const imageBox =
        document.createElement(
          "div"
        );

      imageBox.className =
        "cart-item-image-box";


      if (item.imageURL) {

        const image =
          document.createElement(
            "img"
          );

        image.src =
          item.imageURL;

        image.alt =
          item.productName;

        image.className =
          "cart-item-image";

        image.loading =
          "lazy";

        image.decoding =
          "async";


        image.onerror =
          function () {

            image.style.display =
              "none";

            imageBox.classList.add(
              "cart-image-placeholder"
            );

            imageBox.textContent =
              "No Image";

          };


        imageBox.appendChild(
          image
        );

      } else {

        imageBox.classList.add(
          "cart-image-placeholder"
        );

        imageBox.textContent =
          "No Image";

      }


      // ======================================================
      // PRODUCT DETAILS
      // ======================================================

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


      // ======================================================
      // PRODUCT SUBTOTAL
      // ======================================================

      const itemSubtotal =
        document.createElement(
          "div"
        );

      itemSubtotal.className =
        "cart-item-subtotal";

      itemSubtotal.textContent =
        item.quantity +
        " × " +
        formatCurrency(
          item.price
        ) +
        " = " +
        formatCurrency(
          item.price *
          item.quantity
        );


      details.appendChild(
        name
      );

      details.appendChild(
        number
      );

      details.appendChild(
        price
      );

      details.appendChild(
        itemSubtotal
      );


      // ======================================================
      // CART QUANTITY CONTROLS
      // ======================================================

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

          decreaseQuantity
