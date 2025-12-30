// Shopping Cart Application
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.products = [];
    this.init();
  }

  async init() {
    await this.loadInventory();
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

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = this.products.map(product => `
      <div class="product-card">
        <div class="product-image">${product.image}</div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
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
    `).join('');

    // Add event listeners to add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => this.addToCart(parseInt(e.target.dataset.id)));
    });
  }

  setupEventListeners() {
    // Cart button
    document.getElementById('cartBtn').addEventListener('click', () => this.openCart());
    
    // Close cart modal
    document.getElementById('closeCartBtn').addEventListener('click', () => this.closeCart());
    
    // Close checkout modal
    document.getElementById('closeCheckoutBtn').addEventListener('click', () => this.closeCheckout());
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', () => this.openCheckout());
    
    // Continue shopping button
    document.getElementById('continueShoppingBtn').addEventListener('click', () => {
      this.closeCheckout();
      this.openCart();
    });

    // Close modals when clicking outside
    document.getElementById('cartModal').addEventListener('click', (e) => {
      if (e.target.id === 'cartModal') this.closeCart();
    });
    document.getElementById('checkoutModal').addEventListener('click', (e) => {
      if (e.target.id === 'checkoutModal') this.closeCheckout();
    });
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
    
    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-items empty">Your cart is empty</div>';
      document.getElementById('checkoutBtn').disabled = true;
      return;
    }

    document.getElementById('checkoutBtn').disabled = false;

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
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  }

  updateCartCount() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
  }

  openCart() {
    this.renderCartItems();
    document.getElementById('cartModal').classList.add('active');
  }

  closeCart() {
    document.getElementById('cartModal').classList.remove('active');
  }

  openCheckout() {
    this.closeCart();
    document.getElementById('checkoutModal').classList.add('active');
  }

  closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
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
