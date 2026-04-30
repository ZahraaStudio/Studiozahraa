/**
 * نظام تتبع الطلبات
 * يوفر وظائف متقدمة لتتبع حالة الطلبات والإشعارات
 */

class OrderTracker {
    constructor(db) {
        this.db = db;
        this.orders = [];
        this.listeners = [];
    }

    /**
     * الاستماع لتغييرات الطلبات
     */
    watchOrders(callback) {
        if (!this.db) return;
        
        this.db.collection('orders')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                this.orders = [];
                snapshot.forEach(doc => {
                    this.orders.push({ id: doc.id, ...doc.data() });
                });
                callback(this.orders);
            });
    }

    /**
     * البحث عن طلب برقم التتبع
     */
    async findOrderByNumber(orderNumber) {
        if (!this.db) return null;
        
        try {
            const snapshot = await this.db.collection('orders')
                .where('orderNumber', '==', orderNumber)
                .get();
            
            if (snapshot.empty) return null;
            
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (e) {
            console.error('Error finding order:', e);
            return null;
        }
    }

    /**
     * الحصول على طلبات العميل
     */
    async getCustomerOrders(phone) {
        if (!this.db) return [];
        
        try {
            const snapshot = await this.db.collection('orders')
                .where('customerPhone', '==', phone)
                .orderBy('createdAt', 'desc')
                .get();
            
            const orders = [];
            snapshot.forEach(doc => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            return orders;
        } catch (e) {
            console.error('Error getting customer orders:', e);
            return [];
        }
    }

    /**
     * تحديث حالة الطلب
     */
    async updateOrderStatus(orderId, newStatus) {
        if (!this.db) return false;
        
        try {
            await this.db.collection('orders').doc(orderId).update({
                status: newStatus,
                updatedAt: new Date()
            });
            return true;
        } catch (e) {
            console.error('Error updating order status:', e);
            return false;
        }
    }

    /**
     * الحصول على إحصائيات الطلبات
     */
    async getOrderStats() {
        if (!this.db) return null;
        
        try {
            const snapshot = await this.db.collection('orders').get();
            const orders = [];
            snapshot.forEach(doc => {
                orders.push(doc.data());
            });

            const stats = {
                total: orders.length,
                pending: orders.filter(o => o.status === 'قيد التنفيذ').length,
                shipped: orders.filter(o => o.status === 'تم الشحن').length,
                delivered: orders.filter(o => o.status === 'تم التوصيل').length,
                completed: orders.filter(o => o.status === 'مكتمل').length,
                cancelled: orders.filter(o => o.status === 'ملغي').length,
                totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
            };

            return stats;
        } catch (e) {
            console.error('Error getting order stats:', e);
            return null;
        }
    }

    /**
     * الحصول على حالة الطلب بصيغة عربية
     */
    getStatusLabel(status) {
        const labels = {
            'قيد التنفيذ': { ar: 'قيد التنفيذ', icon: '⏳', color: '#fbbf24' },
            'تم الشحن': { ar: 'تم الشحن', icon: '📦', color: '#8b5cf6' },
            'تم التوصيل': { ar: 'تم التوصيل', icon: '🚚', color: '#3b82f6' },
            'مكتمل': { ar: 'مكتمل', icon: '✓', color: '#10b981' },
            'ملغي': { ar: 'ملغي', icon: '✕', color: '#ef4444' }
        };
        return labels[status] || { ar: status, icon: '?', color: '#6b7280' };
    }

    /**
     * حساب الوقت المتبقي للتوصيل
     */
    getEstimatedDelivery(createdAt, status) {
        const created = new Date(createdAt?.toDate?.() || createdAt);
        const now = new Date();
        const daysElapsed = Math.floor((now - created) / (1000 * 60 * 60 * 24));

        if (status === 'مكتمل' || status === 'تم التوصيل') {
            return 'تم التوصيل';
        } else if (status === 'ملغي') {
            return 'تم الإلغاء';
        } else if (daysElapsed >= 5) {
            return 'متأخر - يرجى التواصل';
        } else {
            return `متوقع خلال ${5 - daysElapsed} أيام`;
        }
    }

    /**
     * إرسال إشعار بتحديث الطلب
     */
    async sendNotification(orderId, message, type = 'info') {
        // يمكن توسيع هذه الدالة لاستخدام Firebase Cloud Messaging
        console.log(`Notification for order ${orderId}: ${message}`);
    }

    /**
     * حساب رسوم الشحن بناءً على المدينة
     */
    calculateShippingFee(city) {
        const shippingRates = {
            'القاهرة': 50,
            'الجيزة': 50,
            'الإسكندرية': 80,
            'الشرقية': 100,
            'الدقهلية': 90,
            'المنوفية': 80,
            'الغربية': 90,
            'البحيرة': 100,
            'أخرى': 120
        };
        return shippingRates[city] || shippingRates['أخرى'];
    }

    /**
     * التحقق من توفر المنتج
     */
    async checkProductAvailability(productId) {
        if (!this.db) return true;
        
        try {
            const doc = await this.db.collection('products').doc(productId).get();
            if (!doc.exists) return false;
            
            const product = doc.data();
            return product.status === 'available' || product.stock > 0;
        } catch (e) {
            console.error('Error checking product availability:', e);
            return true;
        }
    }
}

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderTracker;
}
