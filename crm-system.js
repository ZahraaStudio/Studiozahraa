/**
 * CRM SYSTEM - Customer Relationship Management
 * Complete admin management for customers
 */

class CRMSystem {
  constructor() {
    this.customers = [];
    this.selectedCustomer = null;
  }

  // Load all customers
  async loadCustomers() {
    try {
      const snapshot = await db.collection('users').get();
      this.customers = [];
      
      snapshot.forEach(doc => {
        this.customers.push({ id: doc.id, ...doc.data() });
      });

      return this.customers;
    } catch (e) {
      console.error('❌ Error loading customers:', e);
      return [];
    }
  }

  // Get customer details
  async getCustomerDetails(customerId) {
    try {
      const userDoc = await db.collection('users').doc(customerId).get();
      const ordersSnapshot = await db.collection('orders')
        .where('userId', '==', customerId)
        .get();

      const orders = [];
      ordersSnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      return {
        user: userDoc.data(),
        orders: orders,
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        orderCount: orders.length
      };
    } catch (e) {
      console.error('❌ Error loading customer details:', e);
      return null;
    }
  }

  // Update customer status
  async updateCustomerStatus(customerId, status) {
    try {
      await db.collection('users').doc(customerId).update({
        status: status,
        updatedAt: new Date()
      });

      showNotification('✓ تم تحديث حالة العميل', 'success');
    } catch (e) {
      console.error('❌ Error updating customer status:', e);
      showPopup('خطأ', 'فشل تحديث حالة العميل', 'error');
    }
  }

  // Mark customer as VIP
  async markAsVIP(customerId) {
    try {
      await db.collection('users').doc(customerId).update({
        isVIP: true,
        vipSince: new Date()
      });

      showNotification('✓ تم تصنيف العميل كعميل مميز', 'success');
    } catch (e) {
      console.error('❌ Error marking as VIP:', e);
    }
  }

  // Block customer
  async blockCustomer(customerId, reason = '') {
    try {
      await db.collection('users').doc(customerId).update({
        blocked: true,
        blockReason: reason,
        blockedAt: new Date()
      });

      showNotification('✓ تم حظر العميل', 'success');
    } catch (e) {
      console.error('❌ Error blocking customer:', e);
    }
  }

  // Unblock customer
  async unblockCustomer(customerId) {
    try {
      await db.collection('users').doc(customerId).update({
        blocked: false,
        blockReason: '',
        blockedAt: null
      });

      showNotification('✓ تم إلغاء حظر العميل', 'success');
    } catch (e) {
      console.error('❌ Error unblocking customer:', e);
    }
  }

  // Send message to customer
  async sendMessage(customerId, message) {
    try {
      await db.collection('admin_messages').add({
        customerId: customerId,
        message: message,
        sentAt: new Date(),
        read: false
      });

      showNotification('✓ تم إرسال الرسالة', 'success');
    } catch (e) {
      console.error('❌ Error sending message:', e);
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      const usersSnapshot = await db.collection('users').get();
      const ordersSnapshot = await db.collection('orders').get();

      const stats = {
        totalCustomers: usersSnapshot.size,
        totalOrders: ordersSnapshot.size,
        totalRevenue: 0,
        averageOrderValue: 0,
        vipCustomers: 0,
        blockedCustomers: 0
      };

      usersSnapshot.forEach(doc => {
        const user = doc.data();
        if (user.isVIP) stats.vipCustomers++;
        if (user.blocked) stats.blockedCustomers++;
      });

      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        stats.totalRevenue += order.total || 0;
      });

      stats.averageOrderValue = stats.totalOrders > 0 
        ? stats.totalRevenue / stats.totalOrders 
        : 0;

      return stats;
    } catch (e) {
      console.error('❌ Error getting customer stats:', e);
      return null;
    }
  }

  // Display CRM dashboard
  async displayDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = await this.getCustomerStats();
    const customers = await this.loadCustomers();

    const html = `
      <div class="space-y-6">
        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-zinc-900 border border-gold-text p-6 rounded-lg text-center">
            <p class="text-zinc-500 text-sm">إجمالي العملاء</p>
            <p class="text-3xl font-bold gold-text">${stats.totalCustomers}</p>
          </div>
          <div class="bg-zinc-900 border border-gold-text p-6 rounded-lg text-center">
            <p class="text-zinc-500 text-sm">إجمالي الطلبات</p>
            <p class="text-3xl font-bold gold-text">${stats.totalOrders}</p>
          </div>
          <div class="bg-zinc-900 border border-gold-text p-6 rounded-lg text-center">
            <p class="text-zinc-500 text-sm">إجمالي الإيرادات</p>
            <p class="text-3xl font-bold gold-text">${stats.totalRevenue} ج</p>
          </div>
          <div class="bg-zinc-900 border border-gold-text p-6 rounded-lg text-center">
            <p class="text-zinc-500 text-sm">متوسط قيمة الطلب</p>
            <p class="text-3xl font-bold gold-text">${stats.averageOrderValue.toFixed(0)} ج</p>
          </div>
        </div>

        <!-- Customers List -->
        <div class="bg-zinc-900 border border-gold-text p-6 rounded-lg">
          <h3 class="text-xl font-bold mb-4 gradient-text">قائمة العملاء</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-zinc-700">
                  <th class="text-right p-2">الاسم</th>
                  <th class="text-right p-2">البريد الإلكتروني</th>
                  <th class="text-right p-2">الطلبات</th>
                  <th class="text-right p-2">الإنفاق</th>
                  <th class="text-right p-2">الحالة</th>
                  <th class="text-right p-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(customer => `
                  <tr class="border-b border-zinc-800 hover:bg-zinc-800">
                    <td class="p-2">${customer.displayName || 'بدون اسم'}</td>
                    <td class="p-2 text-zinc-400">${customer.email}</td>
                    <td class="p-2">${customer.orderCount || 0}</td>
                    <td class="p-2 gold-text">${customer.totalSpent || 0} ج</td>
                    <td class="p-2">
                      ${customer.isVIP ? '<span class="bg-yellow-600 text-white px-2 py-1 rounded text-xs">VIP</span>' : ''}
                      ${customer.blocked ? '<span class="bg-red-600 text-white px-2 py-1 rounded text-xs">محظور</span>' : ''}
                    </td>
                    <td class="p-2">
                      <button onclick="crmSystem.showCustomerDetails('${customer.id}')" class="text-gold-text hover:underline text-xs">
                        عرض
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Show customer details modal
  async showCustomerDetails(customerId) {
    const details = await this.getCustomerDetails(customerId);
    if (!details) return;

    const modalHTML = `
      <div id="customer-modal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-1000">
        <div class="bg-zinc-900 border border-gold-text rounded-2xl p-8 max-w-2xl w-95 max-h-96 overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text">تفاصيل العميل</h2>
            <button onclick="document.getElementById('customer-modal').remove()" class="text-2xl">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <p class="text-zinc-500 text-sm">الاسم</p>
              <p class="font-bold">${details.user.displayName || 'بدون اسم'}</p>
            </div>
            <div>
              <p class="text-zinc-500 text-sm">البريد الإلكتروني</p>
              <p class="font-bold">${details.user.email}</p>
            </div>
            <div>
              <p class="text-zinc-500 text-sm">الهاتف</p>
              <p class="font-bold">${details.user.phone || 'لم يتم التحديد'}</p>
            </div>
            <div>
              <p class="text-zinc-500 text-sm">إجمالي الطلبات</p>
              <p class="font-bold gold-text">${details.orderCount}</p>
            </div>
            <div>
              <p class="text-zinc-500 text-sm">إجمالي الإنفاق</p>
              <p class="font-bold gold-text">${details.totalSpent} ج</p>
            </div>

            <div class="border-t border-zinc-700 pt-4 mt-4">
              <p class="text-zinc-500 text-sm mb-2">الإجراءات</p>
              <div class="space-y-2">
                <button onclick="crmSystem.markAsVIP('${details.user.id}')" class="w-full gold-bg text-black py-2 rounded font-bold hover:opacity-90">
                  تصنيف كعميل مميز
                </button>
                <button onclick="crmSystem.blockCustomer('${details.user.id}')" class="w-full bg-red-600 text-white py-2 rounded font-bold hover:opacity-90">
                  حظر العميل
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

// Initialize CRM system
const crmSystem = new CRMSystem();
