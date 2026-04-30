/**
 * WISHLIST SYSTEM - Complete Implementation
 * Save favorite products for later
 */

class WishlistSystem {
  constructor() {
    this.wishlist = this.loadWishlist();
    this.userId = localStorage.getItem('userId');
  }

  // Load wishlist from localStorage
  loadWishlist() {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  }

  // Save wishlist to localStorage
  saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }

  // Add to wishlist
  addToWishlist(productId, productName, productPrice, productImage) {
    if (this.isInWishlist(productId)) {
      showNotification('❌ المنتج موجود بالفعل في المفضلة', 'error');
      return;
    }

    this.wishlist.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      addedAt: new Date().toISOString()
    });

    this.saveWishlist();
    this.updateWishlistUI();
    showNotification('✓ تم إضافة المنتج للمفضلة', 'success');

    // Save to Firebase if logged in
    if (this.userId) {
      this.syncToFirebase();
    }
  }

  // Remove from wishlist
  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.saveWishlist();
    this.updateWishlistUI();
    showNotification('✓ تم حذف المنتج من المفضلة', 'success');

    if (this.userId) {
      this.syncToFirebase();
    }
  }

  // Check if product is in wishlist
  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  }

  // Get wishlist count
  getWishlistCount() {
    return this.wishlist.length;
  }

  // Update wishlist UI
  updateWishlistUI() {
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      badge.textContent = this.getWishlistCount();
      badge.style.display = this.getWishlistCount() > 0 ? 'flex' : 'none';
    }
  }

  // Display wishlist modal
  showWishlist() {
    const modalHTML = `
      <div id="wishlist-modal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-1000">
        <div class="bg-zinc-900 border border-gold-text rounded-2xl p-8 max-w-2xl w-95 max-h-96 overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text">❤️ المفضلة</h2>
            <button onclick="document.getElementById('wishlist-modal').remove()" class="text-2xl">✕</button>
          </div>

          ${this.wishlist.length === 0 ? `
            <p class="text-center text-zinc-500 py-8">لا توجد منتجات في المفضلة</p>
          ` : `
            <div class="space-y-4">
              ${this.wishlist.map(item => `
                <div class="flex gap-4 bg-black p-4 rounded-lg border border-zinc-800">
                  <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
                  <div class="flex-1">
                    <h3 class="font-bold">${item.name}</h3>
                    <p class="text-gold-text font-bold">${item.price} ج</p>
                    <div class="flex gap-2 mt-2">
                      <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})" class="gold-bg text-black px-4 py-1 rounded text-sm font-bold hover:opacity-90">
                        أضف للسلة
                      </button>
                      <button onclick="wishlistSystem.removeFromWishlist('${item.id}')" class="bg-red-600 text-white px-4 py-1 rounded text-sm font-bold hover:opacity-90">
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Sync wishlist to Firebase
  async syncToFirebase() {
    if (!this.userId) return;

    try {
      await db.collection('users').doc(this.userId).set({
        wishlist: this.wishlist,
        updatedAt: new Date()
      }, { merge: true });
    } catch (e) {
      console.error('❌ Error syncing wishlist:', e);
    }
  }

  // Load wishlist from Firebase
  async loadFromFirebase() {
    if (!this.userId) return;

    try {
      const userDoc = await db.collection('users').doc(this.userId).get();
      if (userDoc.exists && userDoc.data().wishlist) {
        this.wishlist = userDoc.data().wishlist;
        this.saveWishlist();
        this.updateWishlistUI();
      }
    } catch (e) {
      console.error('❌ Error loading wishlist:', e);
    }
  }
}

// Initialize wishlist system
const wishlistSystem = new WishlistSystem();

// Add wishlist button to page
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('wishlist-button')) {
    const button = document.createElement('button');
    button.id = 'wishlist-button';
    button.className = 'fixed top-24 right-4 gold-bg text-black px-4 py-2 rounded-lg font-bold z-100 hover:opacity-90';
    button.innerHTML = `
      ❤️ المفضلة
      <span id="wishlist-badge" class="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold" style="display: none;">0</span>
    `;
    button.onclick = () => wishlistSystem.showWishlist();
    document.body.appendChild(button);
  }

  wishlistSystem.updateWishlistUI();
  wishlistSystem.loadFromFirebase();
});
