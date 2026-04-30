// Advanced Features for Studio Zahraa

// ============================================
// WISHLIST SYSTEM
// ============================================
class WishlistManager {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('zahraa_wishlist')) || [];
  }

  add(product) {
    if (!this.wishlist.find(p => p.id === product.id)) {
      this.wishlist.push(product);
      this.save();
      return true;
    }
    return false;
  }

  remove(productId) {
    this.wishlist = this.wishlist.filter(p => p.id !== productId);
    this.save();
  }

  has(productId) {
    return this.wishlist.some(p => p.id === productId);
  }

  getAll() {
    return this.wishlist;
  }

  clear() {
    this.wishlist = [];
    this.save();
  }

  save() {
    localStorage.setItem('zahraa_wishlist', JSON.stringify(this.wishlist));
  }
}

// ============================================
// CHAT SYSTEM
// ============================================
class ChatManager {
  constructor(db) {
    this.db = db;
    this.currentRoom = null;
    this.messages = [];
  }

  async createRoom(userId, userName, userEmail) {
    try {
      const room = await this.db.collection('chat_rooms').add({
        userId,
        userName,
        userEmail,
        status: 'open',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.currentRoom = room.id;
      return room.id;
    } catch (e) {
      console.error('Error creating chat room:', e);
      throw e;
    }
  }

  async sendMessage(roomId, senderId, senderName, message, image = null) {
    try {
      await this.db.collection('chat_rooms').doc(roomId).collection('messages').add({
        senderId,
        senderName,
        message,
        image,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
      });

      // Update room's last message
      await this.db.collection('chat_rooms').doc(roomId).update({
        lastMessage: message,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error sending message:', e);
      throw e;
    }
  }

  async getMessages(roomId) {
    try {
      const snapshot = await this.db.collection('chat_rooms').doc(roomId).collection('messages').orderBy('timestamp', 'asc').get();
      this.messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return this.messages;
    } catch (e) {
      console.error('Error getting messages:', e);
      return [];
    }
  }

  async markAsRead(roomId, messageId) {
    try {
      await this.db.collection('chat_rooms').doc(roomId).collection('messages').doc(messageId).update({
        read: true
      });
    } catch (e) {
      console.error('Error marking message as read:', e);
    }
  }

  async closeRoom(roomId) {
    try {
      await this.db.collection('chat_rooms').doc(roomId).update({
        status: 'closed',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error closing room:', e);
    }
  }
}

// ============================================
// REFERRAL SYSTEM
// ============================================
class ReferralManager {
  constructor(db) {
    this.db = db;
  }

  async createReferralLink(userId, couponCode) {
    try {
      const referral = await this.db.collection('referrals').add({
        referrerId: userId,
        couponCode,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        usedCount: 0
      });
      return `${window.location.origin}?ref=${referral.id}`;
    } catch (e) {
      console.error('Error creating referral:', e);
      throw e;
    }
  }

  async trackReferral(referralId, newUserId) {
    try {
      await this.db.collection('referrals').doc(referralId).update({
        usedCount: firebase.firestore.FieldValue.increment(1),
        lastUsedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Create referral record
      await this.db.collection('referral_records').add({
        referralId,
        referrerId: (await this.db.collection('referrals').doc(referralId).get()).data().referrerId,
        newUserId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error tracking referral:', e);
    }
  }

  async getReferralStats(userId) {
    try {
      const snapshot = await this.db.collection('referrals').where('referrerId', '==', userId).get();
      let totalUsed = 0;
      snapshot.forEach(doc => {
        totalUsed += doc.data().usedCount || 0;
      });
      return totalUsed;
    } catch (e) {
      console.error('Error getting referral stats:', e);
      return 0;
    }
  }
}

// ============================================
// COUNTDOWN TIMER
// ============================================
class CountdownTimer {
  constructor(elementId, endDate, onComplete) {
    this.elementId = elementId;
    this.endDate = new Date(endDate).getTime();
    this.onComplete = onComplete;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => this.update(), 1000);
    this.update();
  }

  update() {
    const now = new Date().getTime();
    const distance = this.endDate - now;

    if (distance < 0) {
      clearInterval(this.interval);
      if (this.onComplete) this.onComplete();
      document.getElementById(this.elementId).innerHTML = 'انتهت العرض';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(this.elementId).innerHTML = `
      <div class="flex gap-2 justify-center">
        <div class="text-center">
          <div class="bg-gold-text/20 rounded-lg p-2 min-w-12">${days}</div>
          <div class="text-xs mt-1">أيام</div>
        </div>
        <div class="text-center">
          <div class="bg-gold-text/20 rounded-lg p-2 min-w-12">${hours}</div>
          <div class="text-xs mt-1">ساعات</div>
        </div>
        <div class="text-center">
          <div class="bg-gold-text/20 rounded-lg p-2 min-w-12">${minutes}</div>
          <div class="text-xs mt-1">دقائق</div>
        </div>
        <div class="text-center">
          <div class="bg-gold-text/20 rounded-lg p-2 min-w-12">${seconds}</div>
          <div class="text-xs mt-1">ثواني</div>
        </div>
      </div>
    `;
  }

  stop() {
    clearInterval(this.interval);
  }
}

// ============================================
// NOTIFICATION SYSTEM (ENHANCED)
// ============================================
class NotificationManager {
  constructor(db) {
    this.db = db;
    this.notifications = [];
  }

  async subscribeToNotifications(userId) {
    try {
      this.db.collection('notifications').where('userId', '==', userId).where('read', '==', false).onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const notification = change.doc.data();
            this.showNotification(notification.title, notification.message, notification.type);
          }
        });
      });
    } catch (e) {
      console.error('Error subscribing to notifications:', e);
    }
  }

  showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type} active`;
    notification.innerHTML = `
      <div class="flex gap-3">
        <div class="flex-1">
          <p class="font-bold">${title}</p>
          <p class="text-sm">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-lg">×</button>
      </div>
    `;
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove('active');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  async sendNotification(userId, title, message, type = 'info') {
    try {
      await this.db.collection('notifications').add({
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error sending notification:', e);
    }
  }
}

// ============================================
// ANALYTICS TRACKER
// ============================================
class AnalyticsTracker {
  constructor(db) {
    this.db = db;
  }

  async trackPageView(page) {
    try {
      await this.db.collection('analytics').add({
        type: 'page_view',
        page,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
    } catch (e) {
      console.error('Error tracking page view:', e);
    }
  }

  async trackProductView(productId, productName) {
    try {
      await this.db.collection('analytics').add({
        type: 'product_view',
        productId,
        productName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error tracking product view:', e);
    }
  }

  async trackAddToCart(productId, quantity) {
    try {
      await this.db.collection('analytics').add({
        type: 'add_to_cart',
        productId,
        quantity,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error tracking add to cart:', e);
    }
  }

  async trackCheckout(totalPrice) {
    try {
      await this.db.collection('analytics').add({
        type: 'checkout',
        totalPrice,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error tracking checkout:', e);
    }
  }
}

// Initialize managers globally
let wishlistManager = new WishlistManager();
let chatManager = null;
let referralManager = null;
let notificationManager = null;
let analyticsTracker = null;

// Initialize after Firebase is ready
function initializeAdvancedFeatures(db, auth) {
  chatManager = new ChatManager(db);
  referralManager = new ReferralManager(db);
  notificationManager = new NotificationManager(db);
  analyticsTracker = new AnalyticsTracker(db);

  // Subscribe to notifications if user is logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      notificationManager.subscribeToNotifications(user.uid);
    }
  });
}
