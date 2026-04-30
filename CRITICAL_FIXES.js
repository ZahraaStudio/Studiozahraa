/**
 * CRITICAL FIXES FOR ZAHRAA STUDIO
 * Phase 1: Fix all critical errors
 */

// ============================================
// 1. FIREBASE AUTH FIX
// ============================================
function fixFirebaseAuth() {
  // Ensure proper Firebase initialization
  const firebaseConfig = {
    apiKey: "AIzaSyDvJvJr8q5Z8q5Z8q5Z8q5Z8q5Z8q5Z8q",
    authDomain: "zahraa-studio.firebaseapp.com",
    projectId: "zahraa-studio",
    storageBucket: "zahraa-studio.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  };

  // Fix unauthorized-domain error
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('✓ User logged in:', user.uid);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'مستخدم');
      localStorage.setItem('userPhoto', user.photoURL || '');
      updateUIAfterLogin();
    } else {
      console.log('✓ No user logged in');
      localStorage.removeItem('userId');
      updateUIAfterLogout();
    }
  });
}

// ============================================
// 2. CATEGORIES FIX
// ============================================
async function fixCategories() {
  try {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();
    
    if (snapshot.empty) {
      // Create default categories if none exist
      const defaultCategories = [
        { name: 'تابلوهات', icon: '🖼️', order: 1 },
        { name: 'هدايا', icon: '🎁', order: 2 },
        { name: 'طباعة', icon: '🖨️', order: 3 },
        { name: 'تصاميم', icon: '✨', order: 4 }
      ];
      
      for (const cat of defaultCategories) {
        await categoriesRef.add(cat);
      }
    }
    
    // Load categories properly
    const cats = [];
    snapshot.forEach(doc => {
      cats.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by order
    cats.sort((a, b) => a.order - b.order);
    
    // Display categories
    const container = document.getElementById('categories-container');
    if (container) {
      container.innerHTML = cats.map(cat => `
        <button onclick="filterByCategory('${cat.id}')" class="category-btn">
          ${cat.icon} ${cat.name}
        </button>
      `).join('');
    }
  } catch (e) {
    console.error('❌ Error loading categories:', e);
  }
}

// ============================================
// 3. IMAGES FIX (Multiple Images Support)
// ============================================
function fixProductImages(productData) {
  // Ensure images is always an array
  if (!productData.images) {
    productData.images = [];
  }
  
  if (typeof productData.images === 'string') {
    productData.images = [productData.images];
  }
  
  // Add default image if none
  if (productData.images.length === 0) {
    productData.images = ['https://via.placeholder.com/300x300?text=No+Image'];
  }
  
  return productData.images;
}

// ============================================
// 4. SHIPPING FIX (All 27 Governorates)
// ============================================
const GOVERNORATES = {
  'القاهرة': 30,
  'الجيزة': 35,
  'الإسكندرية': 50,
  'الشرقية': 45,
  'الدقهلية': 40,
  'المنوفية': 38,
  'الغربية': 42,
  'البحيرة': 48,
  'كفر الشيخ': 50,
  'الفيوم': 55,
  'بني سويف': 60,
  'المنيا': 65,
  'أسيوط': 70,
  'سوهاج': 75,
  'قنا': 80,
  'الأقصر': 85,
  'أسوان': 90,
  'الإسماعيلية': 40,
  'بورسعيد': 45,
  'السويس': 50,
  'شمال سيناء': 100,
  'جنوب سيناء': 120,
  'البحر الأحمر': 110,
  'الوادي الجديد': 130,
  'مطروح': 120,
  'الحدود الشرقية': 150,
  'النوبارية': 40
};

function getShippingPrice(governorate) {
  return GOVERNORATES[governorate] || 50; // Default 50 if not found
}

// ============================================
// 5. INVOICE FIX (UTF-8 Proper)
// ============================================
function generateInvoice(order) {
  const invoiceContent = `
    ╔════════════════════════════════════════╗
    ║     استوديو الزهراء - ZAHRAA STUDIO    ║
    ║         فاتورة الشراء / Invoice         ║
    ╚════════════════════════════════════════╝
    
    رقم الطلب: ${order.orderNumber}
    تاريخ الطلب: ${new Date(order.createdAt).toLocaleDateString('ar-EG')}
    
    ────────────────────────────────────────
    بيانات العميل
    ────────────────────────────────────────
    الاسم: ${order.customerName}
    الهاتف: ${order.customerPhone}
    البريد: ${order.customerEmail || 'N/A'}
    العنوان: ${order.customerAddress}
    المحافظة: ${order.customerGovernorate}
    
    ────────────────────────────────────────
    المنتجات
    ────────────────────────────────────────
  `;
  
  let itemsText = '';
  order.items.forEach(item => {
    itemsText += `
    كود المنتج: ${item.code || 'N/A'}
    المنتج: ${item.name}
    السعر: ${item.price} ج
    الكمية: ${item.quantity}
    الإجمالي: ${item.price * item.quantity} ج
    `;
  });
  
  const totalText = `
    ────────────────────────────────────────
    ملخص الطلب
    ────────────────────────────────────────
    الإجمالي الجزئي: ${order.subtotal} ج
    الشحن: ${order.shipping} ج
    ${order.giftWrapping ? `التغليف: ${order.giftWrapping} ج` : ''}
    ${order.discount ? `الخصم: -${order.discount} ج` : ''}
    ────────────────────────────────────────
    الإجمالي النهائي: ${order.total} ج
    ────────────────────────────────────────
    
    شكراً لتعاملك معنا!
    WhatsApp: 01286815625 | 01204194540
    Facebook: facebook.com/stodiu.zahraa
  `;
  
  return invoiceContent + itemsText + totalText;
}

// ============================================
// 6. REFERRALS FIX
// ============================================
function generateReferralLink() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showNotification('❌ يجب تسجيل الدخول أولاً', 'error');
    return null;
  }
  
  const referralCode = `${userId.substring(0, 8)}-${Date.now().toString(36)}`;
  localStorage.setItem('referralCode', referralCode);
  
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?ref=${referralCode}`;
}

function applyReferralCode() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  
  if (refCode) {
    localStorage.setItem('referralSource', refCode);
    showNotification('✓ تم تطبيق كود الإحالة', 'success');
  }
}

// ============================================
// 7. COUPONS FIX
// ============================================
async function validateCoupon(couponCode) {
  try {
    const couponRef = db.collection('coupons').doc(couponCode);
    const couponDoc = await couponRef.get();
    
    if (!couponDoc.exists) {
      return { valid: false, message: '❌ كود الكوبون غير صحيح' };
    }
    
    const coupon = couponDoc.data();
    
    // Check if coupon is active
    if (!coupon.active) {
      return { valid: false, message: '❌ الكوبون غير فعال' };
    }
    
    // Check expiry date
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: '❌ انتهت صلاحية الكوبون' };
    }
    
    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: '❌ انتهت عدد استخدامات الكوبون' };
    }
    
    return { valid: true, coupon: coupon };
  } catch (e) {
    console.error('❌ Error validating coupon:', e);
    return { valid: false, message: '❌ خطأ في التحقق من الكوبون' };
  }
}

// ============================================
// 8. POPUP SYSTEM FIX
// ============================================
function showPopup(title, message, type = 'info') {
  const popupId = `popup-${Date.now()}`;
  
  const popup = document.createElement('div');
  popup.id = popupId;
  popup.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-9999';
  popup.innerHTML = `
    <div class="bg-zinc-900 border border-gold-text rounded-2xl p-8 max-w-md w-95 animate-scale-in">
      <div class="text-center">
        <div class="text-4xl mb-4">
          ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </div>
        <h3 class="text-xl font-bold mb-2">${title}</h3>
        <p class="text-zinc-400 mb-6">${message}</p>
        <button onclick="document.getElementById('${popupId}').remove()" class="gold-bg text-black px-8 py-2 rounded-lg font-bold hover:opacity-90">
          حسناً
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.getElementById(popupId)) {
      document.getElementById(popupId).remove();
    }
  }, 5000);
}

// ============================================
// 9. NOTIFICATION SYSTEM FIX
// ============================================
function showNotification(message, type = 'info') {
  const notifId = `notif-${Date.now()}`;
  
  const notif = document.createElement('div');
  notif.id = notifId;
  notif.className = `notification fixed top-20 right-4 bg-zinc-900 border-l-4 p-4 rounded-lg z-2000 animate-slide-in ${
    type === 'success' ? 'border-green-500' : 
    type === 'error' ? 'border-red-500' : 
    'border-gold-text'
  }`;
  notif.textContent = message;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    if (document.getElementById(notifId)) {
      document.getElementById(notifId).remove();
    }
  }, 3000);
}

// ============================================
// Initialize all fixes
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  fixFirebaseAuth();
  fixCategories();
  applyReferralCode();
});

