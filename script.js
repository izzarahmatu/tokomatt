// Event listener ini memastikan kode JavaScript baru berjalan setelah seluruh elemen HTML dimuat.
document.addEventListener("DOMContentLoaded", () => {
  // --- Elemen DOM ---
  const productGrid = document.getElementById("product-grid");
  const loader = document.getElementById("loader");
  const errorMessage = document.getElementById("error-message");
  const cartCount = document.getElementById("cart-count");
  const cartBtn = document.getElementById("cart-btn");
  const productCount = document.getElementById("product-count");

  // Elemen Modal Produk
  const modal = document.getElementById("productModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalImage = document.getElementById("modal-image");
  const modalCategory = document.getElementById("modal-category");
  const modalProductName = document.getElementById("modal-product-name");
  const modalPrice = document.getElementById("modal-price");
  const modalDescription = document.getElementById("modal-description");
  const modalAddToCartBtn = document.getElementById("modal-add-to-cart");

  // Elemen Modal Keranjang
  const cartModal = document.getElementById("cartModal");
  const closeCartModalBtn = document.getElementById("closeCartModalBtn");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Elemen Filter Kategori
  const categoryFilter = document.getElementById("category-filter");

  // Elemen Toast
  const toastContainer = document.getElementById("toast-container");

  // Elemen Form Checkout
  const buyerName = document.getElementById("buyer-name");
  const buyerAddress = document.getElementById("buyer-address");
  const buyerPhone = document.getElementById("buyer-phone");

  // --- State ---
  let products = [];
  let cart = [];
  let activeCategory = "all"; // Kategori aktif, default 'all'
  const API_URL = "https://fakestoreapi.com/products";

  // --- Functions ---

  /** Mengambil produk dari Fake Store API */
  async function fetchProducts() {
    loader.style.display = "block";
    productGrid.innerHTML = "";
    errorMessage.classList.add("hidden");
    categoryFilter.innerHTML = ""; // Bersihkan filter kategori sebelumnya
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      products = await response.json();
      displayCategories();
      displayProducts(products);
      updateProductCount(products.length);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
      errorMessage.classList.remove("hidden");
    } finally {
      loader.style.display = "none";
    }
  }

  /** Menampilkan kategori produk */
  function displayCategories() {
    const categories = [...new Set(products.map((product) => product.category))];

    const allBtn = document.createElement("button");
    allBtn.className = `category-btn ${activeCategory === "all" ? "active" : ""}`;
    allBtn.innerHTML = '<i class="fas fa-th-large mr-2"></i> Semua';
    allBtn.dataset.category = "all";
    categoryFilter.appendChild(allBtn);

    categories.forEach((category) => {
      const btn = document.createElement("button");
      btn.className = `category-btn ${
        activeCategory === category ? "active" : ""
      }`;

      let icon = "fas fa-tag";
      if (category.includes("clothing")) icon = "fas fa-tshirt";
      else if (category.includes("electronics")) icon = "fas fa-laptop";
      else if (category.includes("jewelery")) icon = "fas fa-gem";

      btn.innerHTML = `<i class="${icon} mr-2"></i> ${
        category.charAt(0).toUpperCase() + category.slice(1)
      }`;
      btn.dataset.category = category;
      categoryFilter.appendChild(btn);
    });
  }

  /** Filter produk berdasarkan kategori */
  function filterProducts(category) {
    activeCategory = category;
    const categoryBtns = categoryFilter.querySelectorAll(".category-btn");
    categoryBtns.forEach((btn) => {
      if (btn.dataset.category === category) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    let filteredProducts;
    if (category === "all") {
      filteredProducts = products;
    } else {
      filteredProducts = products.filter((p) => p.category === category);
    }
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
  }

  /** Update jumlah produk yang ditampilkan */
  function updateProductCount(count) {
    productCount.textContent = count;
  }

  /** Menampilkan produk di dalam grid */
  function displayProducts(productsToDisplay) {
    productGrid.innerHTML = "";
    productsToDisplay.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card bg-white flex flex-col cursor-pointer";
      productCard.dataset.productId = product.id;

      productCard.innerHTML = `
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.title}" class="product-image">
        </div>
        <div class="p-5 border-t border-gray-100 flex flex-col flex-grow">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">${product.title}</h3>
          <div class="mt-auto pt-4 flex justify-between items-center">
            <p class="product-price">Rp ${Math.round(product.price * 15000).toLocaleString("id-ID")}</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      `;
      productGrid.appendChild(productCard);
    });
  }

  /** Menampilkan modal detail produk */
  function showProductDetail(productId) {
    const product = products.find((p) => p.id == productId);
    if (!product) return;

    modalImage.src = product.image;
    modalCategory.textContent = product.category;
    modalProductName.textContent = product.title;
    modalPrice.textContent = `Rp ${Math.round(product.price * 15000).toLocaleString("id-ID")}`;
    modalDescription.textContent = product.description;
    modalAddToCartBtn.dataset.productId = product.id;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  /** Menyembunyikan modal detail produk */
  function hideModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  /** Menambahkan produk ke keranjang */
  function addToCart(productId) {
    const product = products.find((p) => p.id == productId);
    if (product) {
      cart.push(product);
      updateCartCounter();
      showToast(`${product.title.substring(0, 20)}... ditambahkan ke keranjang!`);
    }
  }

  /** Memperbarui tampilan counter keranjang */
  function updateCartCounter() {
    cartCount.textContent = cart.length;
  }

  /** Menampilkan notifikasi toast */
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className =
      "toast-notification bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center transition-all duration-300";
    toast.innerHTML = `
      <i class="fas fa-check-circle mr-2 text-green-400"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  /** Menampilkan keranjang belanja */
  function displayCart() {
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-shopping-cart text-gray-300 text-5xl mb-4"></i>
          <p class="text-gray-500">Keranjang belanja kosong</p>
        </div>
      `;
    } else {
      cart.forEach((product, index) => {
        const priceInIDR = Math.round(product.price * 15000);
        total += priceInIDR;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${product.title}</h4>
            <p class="cart-item-price">Rp ${priceInIDR.toLocaleString("id-ID")}</p>
          </div>
          <button class="remove-from-cart-btn" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        `;
        cartItems.appendChild(cartItem);
      });
    }

    cartTotal.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  }

  /** Menghapus item dari keranjang */
  function removeFromCart(index) {
    const product = cart[index];
    cart.splice(index, 1);
    updateCartCounter();
    displayCart();
    showToast(`${product.title.substring(0, 20)}... dihapus dari keranjang`);
  }

  /** Membuka modal keranjang */
  function openCartModal() {
    displayCart();
    cartModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  /** Menutup modal keranjang */
  function closeCartModal() {
    cartModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  /** Validasi Form Checkout */
  function validateCheckoutForm() {
    if (!buyerName.value || !buyerAddress.value || !buyerPhone.value) {
      showToast("Harap isi semua data pembeli!");
      return false;
    }
    return true;
  }

  /** Checkout via WhatsApp */
  function checkout() {
    if (cart.length === 0) {
      showToast("Keranjang belanja kosong");
      return;
    }

    if (!validateCheckoutForm()) return;

    let message = "Halo, saya ingin membeli produk berikut:\n\n";
    let total = 0;

    cart.forEach((product) => {
      const priceInIDR = Math.round(product.price * 15000);
      total += priceInIDR;
      message += `- ${product.title}\n  Harga: Rp ${priceInIDR.toLocaleString("id-ID")}\n\n`;
    });

    message += `Total: Rp ${total.toLocaleString("id-ID")}\n\n`;
    message += "Informasi Pembeli:\n";
    message += `Nama: ${buyerName.value}\n`;
    message += `Alamat: ${buyerAddress.value}\n`;
    message += `No. HP: ${buyerPhone.value}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/6281217471492?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");

    cart = [];
    buyerName.value = "";
    buyerAddress.value = "";
    buyerPhone.value = "";
    updateCartCounter();
    closeCartModal();
    showToast("Terima kasih! Pesanan Anda telah dikirim via WhatsApp.");
  }

  // --- Event Listeners ---
  productGrid.addEventListener("click", (e) => {
    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    if (addToCartBtn) {
      const productId = addToCartBtn.dataset.productId;
      addToCart(productId);
      return;
    }

    const card = e.target.closest(".product-card");
    if (card) {
      const productId = card.dataset.productId;
      showProductDetail(productId);
    }
  });

  // 🔧 Perbaikan klik kategori (klik ikon juga berfungsi)
  categoryFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (btn) {
      filterProducts(btn.dataset.category);
    }
  });

  modalAddToCartBtn.addEventListener("click", () => {
    const productId = modalAddToCartBtn.dataset.productId;
    addToCart(productId);
    hideModal();
  });

  closeModalBtn.addEventListener("click", hideModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  cartBtn.addEventListener("click", openCartModal);
  closeCartModalBtn.addEventListener("click", closeCartModal);
  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCartModal();
  });

  cartItems.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-from-cart-btn");
    if (btn) removeFromCart(parseInt(btn.dataset.index));
  });

  checkoutBtn.addEventListener("click", checkout);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!modal.classList.contains("hidden")) hideModal();
      else if (!cartModal.classList.contains("hidden")) closeCartModal();
    }
  });

  // --- Pemuatan Awal ---
  fetchProducts();
});
