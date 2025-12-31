// Layout Management (Header, Footer, Modals)
class LayoutManager {
  constructor() {
    this.initHeader();
    this.initFooter();
    this.initModals();
  }

  initHeader() {
    const headerContainer = document.getElementById('site-header-container');
    if (!headerContainer) return;

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    const currentUser = JSON.parse(localStorage.getItem('dwarforca_current_user'));
    
    let authLink = `<a href="login.html" class="${page === 'login.html' ? 'active' : ''}">Login</a>`;
    if (currentUser) {
      authLink = `<a href="profile.html" class="${page === 'profile.html' ? 'active' : ''}">Profile (${currentUser.username})</a>`;
    }

    headerContainer.innerHTML = `
      <header class="site-header">
        <div class="container">
          <div class="header-content">
            <h1 class="logo">🐋 Dwarf Orca</h1>
            <nav class="nav-links">
              <a href="index.html" class="${page === 'index.html' || page === '' ? 'active' : ''}">Shop</a>
              <a href="about.html" class="${page === 'about.html' ? 'active' : ''}">About</a>
              <a href="faq.html" class="${page === 'faq.html' ? 'active' : ''}">FAQ</a>
              <a href="docs.html" class="${page === 'docs.html' ? 'active' : ''}" style="font-family: monospace; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px;">{docs}</a>
              ${authLink}
            </nav>
            <button class="cart-button" id="cartBtn">
              <span class="cart-icon">🛒</span>
              <span class="cart-count" id="cartCount">0</span>
            </button>
          </div>
          <p class="tagline">Premium Miniature Killer Whale Collectibles</p>
        </div>
      </header>
    `;
  }

  initFooter() {
    const footerContainer = document.getElementById('site-footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <p>© 2025 Dwarf Orca — Premium Killer Whale Collectibles</p>
          <p class="disclaimer">This is a joke site. We really don't sell killer whales (miniature or otherwise).</p>
        </div>
      </footer>
    `;
  }

  initModals() {
    // We append modals to the body if they don't exist
    if (document.getElementById('cartModal')) return;

    const modalsHTML = `
      <!-- Shopping Cart Modal -->
      <div class="modal" id="cartModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Shopping Cart</h2>
            <button class="close-btn" id="closeCartBtn">&times;</button>
          </div>
          <div class="cart-items" id="cartItems">
            <!-- Cart items loaded by JavaScript -->
          </div>
          <div class="cart-footer">
            <div class="cart-total">
              <strong>Total:</strong>
              <span id="cartTotal">$0.00</span>
            </div>
            <button class="btn btn-checkout" id="checkoutBtn">Proceed to Checkout</button>
          </div>
        </div>
      </div>

      <!-- Checkout Modal -->
      <div class="modal" id="checkoutModal">
        <div class="modal-content checkout-modal">
          <div class="modal-header">
            <h2>Checkout</h2>
            <button class="close-btn" id="closeCheckoutBtn">&times;</button>
          </div>
          <div class="checkout-content">
            <p class="out-of-stock-message">
              <strong>All items are currently out of stock.</strong>
            </p>
            <p>Thank you for your interest in Dwarf Orca merchandise! We're currently restocking our inventory. Please check back soon.</p>
            <button class="btn" id="continueShoppingBtn">Continue Shopping</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalsHTML);
  }
}

// Auth Management
class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    // Login Page Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        if (!username) return;

        // Check if user exists
        let users = JSON.parse(localStorage.getItem('dwarforca_users') || '{}');
        
        if (!users[username]) {
          // Create new user
          users[username] = {
            username: username,
            fullName: '',
            address: '',
            contact: ''
          };
          localStorage.setItem('dwarforca_users', JSON.stringify(users));
        }

        // Set current user
        localStorage.setItem('dwarforca_current_user', JSON.stringify(users[username]));
        
        // Redirect to profile
        window.location.href = 'profile.html';
      });
    }

    // Profile Page Logic
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      const currentUser = JSON.parse(localStorage.getItem('dwarforca_current_user'));
      
      if (!currentUser) {
        window.location.href = 'login.html';
        return;
      }

      // Populate form
      document.getElementById('profileGreeting').textContent = `Welcome, ${currentUser.username}`;
      document.getElementById('fullName').value = currentUser.fullName || '';
      document.getElementById('address').value = currentUser.address || '';
      document.getElementById('contact').value = currentUser.contact || '';

      // Handle logout
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('dwarforca_current_user');
        window.location.href = 'index.html';
      });

      // Handle save
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedUser = {
          ...currentUser,
          fullName: document.getElementById('fullName').value,
          address: document.getElementById('address').value,
          contact: document.getElementById('contact').value
        };

        // Update current user
        localStorage.setItem('dwarforca_current_user', JSON.stringify(updatedUser));

        // Update in users database
        const users = JSON.parse(localStorage.getItem('dwarforca_users') || '{}');
        users[updatedUser.username] = updatedUser;
        localStorage.setItem('dwarforca_users', JSON.stringify(users));

        alert('Profile updated successfully!');
      });
    }
  }
}

// Shopping Cart Application
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.products = [];
    this.activeCategory = 'All';
    this.init();
  }

  async init() {
    await this.loadInventory();
    this.renderFilters();
    this.renderProducts();
    this.setupEventListeners();
    this.updateCartCount();
  }

  async loadInventory() {
    try {
      const response = await fetch('data/inventory.json');
      const data = await response.json();
      this.products = data.products;
    } catch (error) {
      console.error('Error loading inventory:', error);
      // Fallback products if JSON fails
      this.products = [
        { id: 1, name: 'Killer Whale Plush - Small', price: 14.99, image: '🐋', description: 'Adorable small orca plushie', stock: 0 },
        { id: 2, name: 'Killer Whale Plush - Medium', price: 24.99, image: '🐋', description: 'Medium-sized orca companion', stock: 0 },
        { id: 3, name: 'Killer Whale Plush - Large', price: 34.99, image: '🐋', description: 'Large orca plush', stock: 0 },
        { id: 4, name: 'Killer Whale Figurine Set', price: 19.99, image: '🐋', description: 'Set of 5 miniature figurines', stock: 0 },
        { id: 5, name: 'Orca Enamel Pin', price: 8.99, image: '📌', description: 'Cool enamel pin design', stock: 0 },
        { id: 6, name: 'Killer Whale Bundle', price: 49.99, image: '📦', description: 'Everything bundle', stock: 0 }
      ];
    }
  }

  renderFilters() {
    const filtersContainer = document.getElementById('filters');
    if (!filtersContainer) return;

    // Get unique categories
    const categories = ['All', ...new Set(this.products.map(p => p.category || 'Merchandise'))];

    filtersContainer.innerHTML = categories.map(category => `
      <button class="filter-btn ${category === this.activeCategory ? 'active' : ''}" data-category="${category}">
        ${category}
      </button>
    `).join('');

    // Add event listeners
    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeCategory = e.target.dataset.category;
        this.renderFilters(); // Re-render to update active state
        this.renderProducts();
      });
    });
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const filteredProducts = this.activeCategory === 'All' 
      ? this.products 
      : this.products.filter(p => (p.category || 'Merchandise') === this.activeCategory);

    grid.innerHTML = filteredProducts.map(product => {
      // Build extra details HTML if available
      let extraDetails = '';
      if (product.specs) extraDetails += `<div class="product-detail"><strong>Specs:</strong> ${product.specs}</div>`;
      if (product.leadTime) extraDetails += `<div class="product-detail"><strong>Lead Time:</strong> ${product.leadTime}</div>`;
      if (product.yield) extraDetails += `<div class="product-detail"><strong>Yield:</strong> ${product.yield}</div>`;
      if (product.components) extraDetails += `<div class="product-detail"><strong>Components:</strong> ${product.components}</div>`;
      if (product.software) extraDetails += `<div class="product-detail"><strong>Software:</strong> ${product.software}</div>`;
      if (product.feedType) extraDetails += `<div class="product-detail"><strong>Feed Type:</strong> ${product.feedType}</div>`;
      if (product.contents) extraDetails += `<div class="product-detail"><strong>Contents:</strong> ${product.contents}</div>`;
      if (product.includes) extraDetails += `<div class="product-detail"><strong>Includes:</strong> ${product.includes}</div>`;
      if (product.usage) extraDetails += `<div class="product-detail"><strong>Usage:</strong> ${product.usage}</div>`;

      return `
      <div class="product-card">
        <div class="product-image">${product.image}</div>
        <div class="product-info">
          <div class="product-category">${product.category || 'Merchandise'}</div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          ${extraDetails}
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <div class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
          <div class="product-actions">
            <button class="btn-add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `}).join('');

    // Add event listeners to add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => this.addToCart(parseInt(e.target.dataset.id)));
    });
  }

  setupEventListeners() {
    // Cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', () => this.openCart());
    
    // Close cart modal
    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.closeCart());
    
    // Close checkout modal
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', () => this.closeCheckout());
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.openCheckout());
    
    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', () => {
      this.closeCheckout();
      this.openCart();
    });

    // Close modals when clicking outside
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') this.closeCart();
      });
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      checkoutModal.addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') this.closeCheckout();
      });
    }
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = this.items.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.showNotification(`${product.name} added to cart!`);
  }

  removeFromCart(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.updateCartCount();
      this.renderCartItems();
    }
  }

  renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-items empty">Your cart is empty</div>';
      const checkoutBtn = document.getElementById('checkoutBtn');
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = false;

    cartItemsContainer.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn" data-id="${item.id}" data-action="decrease">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

    // Add event listeners to quantity buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const action = e.target.dataset.action;
        const item = this.items.find(item => item.id === id);
        if (item) {
          this.updateQuantity(id, action === 'increase' ? item.quantity + 1 : item.quantity - 1);
        }
      });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.removeFromCart(parseInt(e.target.dataset.id));
      });
    });

    this.updateCartTotal();
  }

  updateCartTotal() {
    const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
  }

  updateCartCount() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = count;
  }

  openCart() {
    this.renderCartItems();
    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.classList.add('active');
  }

  closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.classList.remove('active');
  }

  openCheckout() {
    this.closeCart();
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.classList.add('active');
  }

  closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.classList.remove('active');
  }

  showNotification(message) {
    // Simple notification - you can enhance this
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      z-index: 2000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  saveCart() {
    localStorage.setItem('dwarforca_cart', JSON.stringify(this.items));
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('dwarforca_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

// FAQ Management
class FAQManager {
  constructor() {
    this.faqs = [];
    this.init();
  }

  async init() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return; // Only initialize if on FAQ page
    
    await this.loadFAQs();
    this.renderFAQs();
  }

  async loadFAQs() {
    try {
      const response = await fetch('data/faq.json');
      if (!response.ok) throw new Error('Failed to load FAQ');
      const data = await response.json();
      this.faqs = data.faqs || [];
    } catch (error) {
      console.error('Error loading FAQ:', error);
      this.faqs = [];
    }
  }

  renderFAQs() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
    faqList.innerHTML = this.faqs.map((faq, index) => `
      <div class="faq-item" data-id="${faq.id}">
        <div class="faq-question" onclick="toggleFAQ(this)">
          <span>${faq.question}</span>
          <span class="faq-toggle">▼</span>
        </div>
        <div class="faq-answer">
          ${faq.answer}
        </div>
      </div>
    `).join('');
  }
}

function toggleFAQ(element) {
  const faqItem = element.closest('.faq-item');
  const answer = faqItem.querySelector('.faq-answer');
  const toggle = faqItem.querySelector('.faq-toggle');
  
  if (answer && toggle) {
    answer.classList.toggle('open');
    toggle.classList.toggle('open');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LayoutManager(); // Injects Header, Footer, Modals
  new AuthManager();
  new ShoppingCart();
  new FAQManager();
});

// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
