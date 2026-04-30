/**
 * COUNTDOWN TIMER SYSTEM
 * Display countdown for limited-time offers
 */

class CountdownTimer {
  constructor() {
    this.timers = [];
  }

  // Create countdown timer
  createTimer(elementId, endTime, onComplete = null) {
    const timer = {
      elementId: elementId,
      endTime: new Date(endTime).getTime(),
      onComplete: onComplete,
      intervalId: null
    };

    this.timers.push(timer);
    this.startTimer(timer);

    return timer;
  }

  // Start timer
  startTimer(timer) {
    const update = () => {
      const now = new Date().getTime();
      const distance = timer.endTime - now;

      if (distance < 0) {
        clearInterval(timer.intervalId);
        const element = document.getElementById(timer.elementId);
        if (element) {
          element.innerHTML = '<p class="text-red-500 font-bold">انتهت صلاحية العرض</p>';
        }
        if (timer.onComplete) {
          timer.onComplete();
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const element = document.getElementById(timer.elementId);
      if (element) {
        element.innerHTML = `
          <div class="flex gap-2 justify-center items-center">
            <div class="text-center">
              <div class="text-2xl font-bold gold-text">${String(days).padStart(2, '0')}</div>
              <div class="text-xs text-zinc-500">يوم</div>
            </div>
            <div class="text-gold-text">:</div>
            <div class="text-center">
              <div class="text-2xl font-bold gold-text">${String(hours).padStart(2, '0')}</div>
              <div class="text-xs text-zinc-500">ساعة</div>
            </div>
            <div class="text-gold-text">:</div>
            <div class="text-center">
              <div class="text-2xl font-bold gold-text">${String(minutes).padStart(2, '0')}</div>
              <div class="text-xs text-zinc-500">دقيقة</div>
            </div>
            <div class="text-gold-text">:</div>
            <div class="text-center">
              <div class="text-2xl font-bold gold-text">${String(seconds).padStart(2, '0')}</div>
              <div class="text-xs text-zinc-500">ثانية</div>
            </div>
          </div>
        `;
      }
    };

    update(); // Initial call
    timer.intervalId = setInterval(update, 1000);
  }

  // Stop timer
  stopTimer(elementId) {
    const timer = this.timers.find(t => t.elementId === elementId);
    if (timer) {
      clearInterval(timer.intervalId);
      this.timers = this.timers.filter(t => t.elementId !== elementId);
    }
  }

  // Create flash sale banner
  createFlashSaleBanner(title, endTime, discount, onComplete = null) {
    const bannerId = `flash-sale-${Date.now()}`;
    
    const banner = document.createElement('div');
    banner.id = bannerId;
    banner.className = 'bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl mb-6 border-2 border-red-400 animate-pulse';
    banner.innerHTML = `
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-2">🔥 ${title}</h2>
        <p class="text-lg mb-4">خصم ${discount}% على المنتجات المختارة</p>
        <div id="countdown-${bannerId}"></div>
      </div>
    `;

    document.body.insertAdjacentElement('afterbegin', banner);

    // Create countdown
    this.createTimer(`countdown-${bannerId}`, endTime, () => {
      banner.remove();
      if (onComplete) onComplete();
    });

    return bannerId;
  }

  // Create product countdown
  createProductCountdown(productId, endTime, onComplete = null) {
    const countdownId = `countdown-product-${productId}`;
    
    const container = document.createElement('div');
    container.id = countdownId;
    container.className = 'bg-zinc-800 p-4 rounded-lg border border-gold-text mt-2';
    
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (productElement) {
      productElement.appendChild(container);
    }

    this.createTimer(countdownId, endTime, onComplete);

    return countdownId;
  }
}

// Initialize countdown system
const countdownTimer = new CountdownTimer();

// Example: Create flash sale banner
document.addEventListener('DOMContentLoaded', () => {
  // Check for active flash sales
  loadFlashSales();
});

// Load flash sales from Firebase
async function loadFlashSales() {
  try {
    const now = new Date();
    const snapshot = await db.collection('flash_sales')
      .where('endTime', '>', now)
      .where('active', '==', true)
      .get();

    snapshot.forEach(doc => {
      const sale = doc.data();
      countdownTimer.createFlashSaleBanner(
        sale.title,
        sale.endTime,
        sale.discount,
        () => {
          console.log('Flash sale ended:', sale.title);
        }
      );
    });
  } catch (e) {
    console.error('❌ Error loading flash sales:', e);
  }
}

// Create flash sale (for admin)
async function createFlashSale(title, discount, endTime) {
  try {
    await db.collection('flash_sales').add({
      title: title,
      discount: discount,
      endTime: new Date(endTime),
      active: true,
      createdAt: new Date()
    });

    showNotification('✓ تم إنشاء العرض المحدود', 'success');
    loadFlashSales();
  } catch (e) {
    console.error('❌ Error creating flash sale:', e);
    showPopup('خطأ', 'فشل إنشاء العرض', 'error');
  }
}
