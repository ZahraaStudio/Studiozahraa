/**
 * مدير السلة المتقدم
 * يوفر وظائف متقدمة لإدارة سلة التسوق مع التخزين المحلي
 */

class CartManager {
    constructor() {
        this.cart = [];
        this.storageKey = 'zahraa_cart';
        this.loadFromStorage();
    }

    /**
     * إضافة منتج للسلة
     */
    addItem(product, quantity = 1, variant = null) {
        const cartId = variant ? `${product.id}-${variant}` : product.id;
        const existingItem = this.cart.find(item => item.cartId === cartId);

        if (existingItem) {
            existingItem.qty += quantity;
        } else {
            this.cart.push({
                ...product,
                cartId,
                qty: quantity,
                variant: variant,
                addedAt: Date.now()
            });
        }

        this.saveToStorage();
        return true;
    }

    /**
     * إزالة منتج من السلة
     */
    removeItem(cartId) {
        this.cart = this.cart.filter(item => item.cartId !== cartId);
        this.saveToStorage();
    }

    /**
     * تحديث كمية المنتج
     */
    updateQuantity(cartId, quantity) {
        const item = this.cart.find(item => item.cartId === cartId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(cartId);
            } else {
                item.qty = quantity;
                this.saveToStorage();
            }
        }
    }

    /**
     * حساب الإجمالي
     */
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.qty), 0);
    }

    /**
     * حساب عدد العناصر
     */
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.qty, 0);
    }

    /**
     * الحصول على جميع العناصر
     */
    getItems() {
        return this.cart;
    }

    /**
     * تفريغ السلة
     */
    clear() {
        this.cart = [];
        this.saveToStorage();
    }

    /**
     * حفظ السلة في التخزين المحلي
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error saving cart to storage:', e);
        }
    }

    /**
     * تحميل السلة من التخزين المحلي
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.cart = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            this.cart = [];
        }
    }

    /**
     * تطبيق كود الخصم
     */
    applyCoupon(coupon) {
        if (!coupon) return 0;
        
        const subtotal = this.getTotal();
        if (coupon.type === 'percentage') {
            return subtotal * (coupon.discount / 100);
        } else {
            return coupon.discount;
        }
    }

    /**
     * حساب الإجمالي النهائي مع الخصم والتغليف
     */
    getFinalTotal(coupon = null, giftWrapPrice = 0) {
        let total = this.getTotal();
        const discount = this.applyCoupon(coupon);
        total = Math.max(0, total - discount);
        
        if (giftWrapPrice > 0) {
            total += giftWrapPrice;
        }

        return total;
    }

    /**
     * الحصول على ملخص السلة
     */
    getSummary() {
        return {
            items: this.cart,
            itemCount: this.getItemCount(),
            subtotal: this.getTotal(),
            isEmpty: this.cart.length === 0
        };
    }

    /**
     * تحويل السلة إلى تنسيق الطلب
     */
    toOrderFormat() {
        return this.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            variant: item.variant
        }));
    }
}

// إنشاء instance عام
const cartManager = new CartManager();

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cartManager;
}
