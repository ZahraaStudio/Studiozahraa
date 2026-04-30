// Portfolio and Testimonials Functions

function renderPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  grid.innerHTML = '';
  portfolio.forEach(item => {
    grid.innerHTML += `
      <div class="group relative overflow-hidden rounded-xl cursor-pointer">
        <img src="${item.image}" class="w-full h-64 object-cover transition-transform group-hover:scale-110">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
          <div class="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 class="font-bold text-lg">${item.title}</h3>
            <p class="text-sm text-zinc-300">${item.category}</p>
          </div>
        </div>
      </div>
    `;
  });
}

function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  grid.innerHTML = '';
  testimonials.forEach(item => {
    const stars = '⭐'.repeat(item.rating);
    grid.innerHTML += `
      <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
        <div class="flex items-center gap-3">
          <img src="${item.image}" class="w-12 h-12 rounded-full object-cover">
          <div>
            <h4 class="font-bold">${item.name}</h4>
            <p class="text-xs text-gold-text">${stars}</p>
          </div>
        </div>
        <p class="text-sm text-zinc-300 leading-relaxed">"${item.text}"</p>
      </div>
    `;
  });
}

function updateGiftWrap() {
  giftWrap = document.getElementById('gift-wrap').checked;
  const msgBox = document.getElementById('gift-message');
  if (msgBox) msgBox.classList.toggle('hidden', !giftWrap);
  updateCheckoutTotal();
}

function applyCoupon() {
  const code = document.getElementById('coupon-input').value.trim().toUpperCase();
  const msgDiv = document.getElementById('coupon-message');
  
  if (!code) {
    msgDiv.classList.add('hidden');
    appliedCoupon = null;
    discountAmount = 0;
    updateCheckoutTotal();
    return;
  }

  const coupon = coupons.find(c => c.code === code && c.active);
  if (coupon) {
    appliedCoupon = coupon;
    msgDiv.classList.remove('hidden');
    msgDiv.className = 'text-xs mt-2 text-green-500';
    msgDiv.textContent = `✅ تم تطبيق الخصم: ${coupon.description}`;
    updateCheckoutTotal();
  } else {
    msgDiv.classList.remove('hidden');
    msgDiv.className = 'text-xs mt-2 text-red-500';
    msgDiv.textContent = '❌ كود الخصم غير صحيح أو منتهي الصلاحية';
    appliedCoupon = null;
    discountAmount = 0;
    updateCheckoutTotal();
  }
}

function updateCheckoutTotal() {
  const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
  let finalTotal = total;
  discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (total * appliedCoupon.discount) / 100;
    } else {
      discountAmount = appliedCoupon.discount;
    }
    finalTotal = Math.max(0, total - discountAmount);
  }

  if (giftWrap) {
    finalTotal += 30;
  }

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.innerText = finalTotal + ' جنيه';
}
