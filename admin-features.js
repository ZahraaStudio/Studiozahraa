// Admin Dashboard Features

// ============================================
// CRM SYSTEM
// ============================================
class CRMManager {
  constructor(db) {
    this.db = db;
  }

  async getCustomers() {
    try {
      const snapshot = await this.db.collection('users').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.error('Error getting customers:', e);
      return [];
    }
  }

  async getCustomerOrders(userId) {
    try {
      const snapshot = await this.db.collection('orders').where('userId', '==', userId).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.error('Error getting customer orders:', e);
      return [];
    }
  }

  async getCustomerStats(userId) {
    try {
      const orders = await this.getCustomerOrders(userId);
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const orderCount = orders.length;
      const lastOrder = orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];

      return {
        totalSpent,
        orderCount,
        lastOrderDate: lastOrder?.createdAt,
        lastOrderStatus: lastOrder?.status
      };
    } catch (e) {
      console.error('Error getting customer stats:', e);
      return {};
    }
  }

  async updateCustomer(userId, data) {
    try {
      await this.db.collection('users').doc(userId).update(data);
      return true;
    } catch (e) {
      console.error('Error updating customer:', e);
      return false;
    }
  }

  async addNote(userId, note) {
    try {
      await this.db.collection('customer_notes').add({
        userId,
        note,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: firebase.auth().currentUser.uid
      });
      return true;
    } catch (e) {
      console.error('Error adding note:', e);
      return false;
    }
  }

  async getNotes(userId) {
    try {
      const snapshot = await this.db.collection('customer_notes').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.error('Error getting notes:', e);
      return [];
    }
  }
}

// ============================================
// SHIPPING MANAGER
// ============================================
class ShippingManager {
  constructor(db) {
    this.db = db;
  }

  async updateOrderStatus(orderId, status) {
    try {
      await this.db.collection('orders').doc(orderId).update({
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('Error updating order status:', e);
      return false;
    }
  }

  async addTrackingCode(orderId, trackingCode) {
    try {
      await this.db.collection('orders').doc(orderId).update({
        trackingCode,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('Error adding tracking code:', e);
      return false;
    }
  }

  async getShippingStats() {
    try {
      const snapshot = await this.db.collection('orders').get();
      const stats = {
        total: 0,
        pending: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      };

      snapshot.forEach(doc => {
        const order = doc.data();
        stats.total++;
        if (order.status === 'قيد التنفيذ') stats.pending++;
        else if (order.status === 'تم الشحن') stats.shipped++;
        else if (order.status === 'تم التوصيل') stats.delivered++;
        else if (order.status === 'ملغي') stats.cancelled++;
      });

      return stats;
    } catch (e) {
      console.error('Error getting shipping stats:', e);
      return {};
    }
  }

  async generateShippingLabel(orderId) {
    try {
      const order = await this.db.collection('orders').doc(orderId).get();
      const data = order.data();

      return {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        customerGovernorate: data.customerGovernorate,
        items: data.items,
        totalPrice: data.totalPrice
      };
    } catch (e) {
      console.error('Error generating shipping label:', e);
      return null;
    }
  }
}

// ============================================
// ANALYTICS DASHBOARD
// ============================================
class AdminAnalytics {
  constructor(db) {
    this.db = db;
  }

  async getDashboardStats() {
    try {
      const ordersSnapshot = await this.db.collection('orders').get();
      const productsSnapshot = await this.db.collection('products').get();
      const usersSnapshot = await this.db.collection('users').get();

      let totalRevenue = 0;
      let totalOrders = 0;
      let completedOrders = 0;

      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        totalOrders++;
        totalRevenue += order.totalPrice || 0;
        if (order.status === 'مكتمل') completedOrders++;
      });

      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        totalProducts: productsSnapshot.size,
        totalCustomers: usersSnapshot.size,
        conversionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(2) : 0
      };
    } catch (e) {
      console.error('Error getting dashboard stats:', e);
      return {};
    }
  }

  async getTopProducts(limit = 10) {
    try {
      const snapshot = await this.db.collection('orders').get();
      const productStats = {};

      snapshot.forEach(doc => {
        const order = doc.data();
        order.items?.forEach(item => {
          if (!productStats[item.name]) {
            productStats[item.name] = { name: item.name, count: 0, revenue: 0 };
          }
          productStats[item.name].count += item.qty;
          productStats[item.name].revenue += item.price * item.qty;
        });
      });

      return Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    } catch (e) {
      console.error('Error getting top products:', e);
      return [];
    }
  }

  async getSalesChart() {
    try {
      const snapshot = await this.db.collection('orders').get();
      const salesByDate = {};

      snapshot.forEach(doc => {
        const order = doc.data();
        if (order.createdAt) {
          const date = order.createdAt.toDate().toLocaleDateString('ar-EG');
          if (!salesByDate[date]) {
            salesByDate[date] = 0;
          }
          salesByDate[date] += order.totalPrice || 0;
        }
      });

      return Object.entries(salesByDate).map(([date, revenue]) => ({
        date,
        revenue
      }));
    } catch (e) {
      console.error('Error getting sales chart:', e);
      return [];
    }
  }

  async getRevenueByGovernorate() {
    try {
      const snapshot = await this.db.collection('orders').get();
      const revenueByGov = {};

      snapshot.forEach(doc => {
        const order = doc.data();
        const gov = order.customerGovernorate || 'غير محدد';
        if (!revenueByGov[gov]) {
          revenueByGov[gov] = 0;
        }
        revenueByGov[gov] += order.totalPrice || 0;
      });

      return Object.entries(revenueByGov)
        .map(([gov, revenue]) => ({ gov, revenue }))
        .sort((a, b) => b.revenue - a.revenue);
    } catch (e) {
      console.error('Error getting revenue by governorate:', e);
      return [];
    }
  }
}

// ============================================
// SETTINGS MANAGER
// ============================================
class AdminSettings {
  constructor(db) {
    this.db = db;
  }

  async getSettings() {
    try {
      const doc = await this.db.collection('settings').doc('store').get();
      return doc.exists ? doc.data() : {};
    } catch (e) {
      console.error('Error getting settings:', e);
      return {};
    }
  }

  async updateSettings(settings) {
    try {
      await this.db.collection('settings').doc('store').set(settings, { merge: true });
      return true;
    } catch (e) {
      console.error('Error updating settings:', e);
      return false;
    }
  }

  async updateWhatsAppNumbers(number1, number2) {
    try {
      await this.updateSettings({
        whatsapp: number1,
        whatsapp2: number2
      });
      return true;
    } catch (e) {
      console.error('Error updating WhatsApp numbers:', e);
      return false;
    }
  }

  async updateSocialLinks(facebook, instagram) {
    try {
      await this.updateSettings({
        facebook,
        instagram
      });
      return true;
    } catch (e) {
      console.error('Error updating social links:', e);
      return false;
    }
  }

  async updateShippingRates(rates) {
    try {
      await this.updateSettings({
        shippingRates: rates
      });
      return true;
    } catch (e) {
      console.error('Error updating shipping rates:', e);
      return false;
    }
  }
}

// Initialize admin managers globally
let crmManager = null;
let shippingManager = null;
let adminAnalytics = null;
let adminSettings = null;

// Initialize after Firebase is ready
function initializeAdminFeatures(db, auth) {
  crmManager = new CRMManager(db);
  shippingManager = new ShippingManager(db);
  adminAnalytics = new AdminAnalytics(db);
  adminSettings = new AdminSettings(db);
}
