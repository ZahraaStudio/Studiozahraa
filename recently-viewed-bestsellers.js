/**
 * RECENTLY VIEWED & BEST SELLERS SYSTEM
 * Track viewed products and display best sellers
 */

class RecentlyViewedSystem {
  constructor() {
    this.recentlyViewed = this.loadRecentlyViewed();
    this.maxItems = 10;
  }

  // Load recently viewed from localStorage
  loadRecentlyViewed() {
    const saved = localStorage.getItem('recentlyViewed');
    return saved ? JSON.parse(saved) : [];
  }

  // Save recently viewed to localStorage
  saveRecentlyViewed() {
    localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed));
  }

  // Add product to recently viewed
  addProduct(productId, productName, productPrice, productImage) {
    // Remove if already exists
    this.recentlyViewed = this.recentlyViewed.filter(item => item.id !== productId);

    // Add to beginning
    this.recentlyViewed.unshift({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      viewedAt: new Date().toISOString()
    });

    // Keep only last 10
    if (this.recentlyViewed.length > this.maxItems) {
      this.recentlyViewed = this.recentlyViewed.slice(0, this.maxItems);
    }

    this.saveRecentlyViewed();
  }

  // Get recently viewed products
  getRecentlyViewed() {
    return this.recentlyViewed;
  }

  // Display recently viewed section
  displayRecentlyViewed(containerId) {
    const container = document.getElementById(containerId);
    if (!container || this.recentlyViewed.length === 0) return;

    const html = `
      <div class="mt-12 bg-zinc-950 p-8 rounded-2xl border border-zinc-800">
        <h3 class="text-2xl font-bold mb-6 gradient-text">👁️ المنتجات المشاهدة مؤخراً</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          ${this.recentlyViewed.slice(0, 5).map(item => `
            <div class="product-card">
              <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover rounded-lg">
              <h4 class="font-bold mt-2 text-sm">${item.name}</h4>
              <p class="text-gold-text font-bold">${item.price} ج</p>
              <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})" class="w-full gold-bg text-black py-2 rounded mt-2 text-sm font-bold hover:opacity-90">
                أضف للسلة
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  }
}

class BestSellersSystem {
  constructor() {
    this.bestSellers = [];
    this.loadBestSellers();
  }

  // Load best sellers from Firebase
  async loadBestSellers() {
    try {
      const snapshot = await db.collection('products')
        .where('sales', '>', 0)
        .orderBy('sales', 'desc')
        .limit(10)
        .get();

      this.bestSellers = [];
      snapshot.forEach(doc => {
        this.bestSellers.push({ id: doc.id, ...doc.data() });
      });
    } catch (e) {
      console.error('❌ Error loading best sellers:', e);
    }
  }

  // Get best sellers
  getBestSellers() {
    return this.bestSellers;
  }

  // Display best sellers section
  displayBestSellers(containerId) {
    const container = document.getElementById(containerId);
    if (!container || this.bestSellers.length === 0) return;

    const html = `
      <div class="mt-12 bg-zinc-950 p-8 rounded-2xl border border-zinc-800">
        <h3 class="text-2xl font-bold mb-6 gradient-text">🔥 الأكثر مبيعاً</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          ${this.bestSellers.slice(0, 5).map((item, index) => `
            <div class="product-card relative">
              <div class="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                #${index + 1}
              </div>
              <img src="${item.images ? item.images[0] : ''}" alt="${item.name}" class="w-full h-40 object-cover rounded-lg">
              <h4 class="font-bold mt-2 text-sm">${item.name}</h4>
              <p class="text-gold-text font-bold">${item.price} ج</p>
              <p class="text-zinc-500 text-xs">📊 ${item.sales || 0} عملية بيع</p>
              <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})" class="w-full gold-bg text-black py-2 rounded mt-2 text-sm font-bold hover:opacity-90">
                أضف للسلة
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  }
}

// Initialize systems
const recentlyViewedSystem = new RecentlyViewedSystem();
const bestSellersSystem = new BestSellersSystem();

// Track product views
function trackProductView(productId, productName, productPrice, productImage) {
  recentlyViewedSystem.addProduct(productId, productName, productPrice, productImage);
}

// Display on page load
document.addEventListener('DOMContentLoaded', () => {
  const mainContainer = document.querySelector('main') || document.body;
  
  // Display recently viewed
  const viewedContainer = document.createElement('div');
  viewedContainer.id = 'recently-viewed-container';
  mainContainer.appendChild(viewedContainer);
  recentlyViewedSystem.displayRecentlyViewed('recently-viewed-container');

  // Display best sellers
  const sellersContainer = document.createElement('div');
  sellersContainer.id = 'best-sellers-container';
  mainContainer.appendChild(sellersContainer);
  bestSellersSystem.displayBestSellers('best-sellers-container');
});
