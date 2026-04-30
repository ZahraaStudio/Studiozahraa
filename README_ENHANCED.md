# 📱 متجر استوديو الزهراء - النسخة المحسنة

> متجر إلكتروني احترافي متكامل مع نظام إدارة متقدم وتتبع طلبات ذكي

---

## 🎯 نظرة عامة

هذا المشروع عبارة عن متجر إلكتروني كامل لاستوديو الزهراء مع:
- ✅ واجهة متجر عصرية وسهلة الاستخدام
- ✅ نظام إدارة متقدم للمنتجات والطلبات
- ✅ نظام تتبع طلبات ذكي مع إشعارات
- ✅ نظام كوبونات متقدم مع تاريخ انتهاء
- ✅ تسجيل دخول اجتماعي (Google, Facebook)
- ✅ نظام سلة تسوق مع تخزين محلي
- ✅ عداد زوار متقدم

---

## 📁 هيكل الملفات

```
Studiozahraa-main/
├── index-enhanced.html          # واجهة المتجر المحسنة ⭐
├── admin-final.html             # لوحة التحكم المحسنة ⭐
├── notifications.js             # نظام الإشعارات
├── cart-manager.js              # مدير السلة
├── order-tracker.js             # نظام تتبع الطلبات
├── UPDATES.md                   # تفاصيل التحديثات
├── INSTALLATION.md              # دليل التثبيت
├── README_ENHANCED.md           # هذا الملف
├── index.html                   # النسخة الأصلية
├── admin.html                   # النسخة الأصلية
└── ...ملفات أخرى
```

---

## 🚀 البدء السريع

### 1. استخدام الملفات المحسنة

#### واجهة المتجر
```html
<!-- استخدم هذا الملف بدلاً من index.html -->
<script src="index-enhanced.html"></script>
```

#### لوحة التحكم
```html
<!-- استخدم هذا الملف بدلاً من admin.html -->
<script src="admin-final.html"></script>
```

### 2. تحميل الملفات المساعدة

```html
<!-- في index-enhanced.html -->
<script src="notifications.js"></script>
<script src="cart-manager.js"></script>
<script src="order-tracker.js"></script>
```

### 3. إعداد Firebase

```javascript
// في كلا الملفين
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## 💡 الميزات الرئيسية

### 🛒 واجهة المتجر (index-enhanced.html)

#### إدارة المنتجات
- عرض المنتجات مع الصور والوصف
- نظام الأنواع والمقاسات مع أسعار مختلفة
- عرض الصور بنظام Swipe
- زر إضافة للسلة مباشر

#### نظام السلة
```javascript
// إضافة منتج
cartManager.addItem(product, quantity, variant);

// تحديث الكمية
cartManager.updateQuantity(cartId, 2);

// حساب الإجمالي
const total = cartManager.getTotal();

// الحصول على الملخص
const summary = cartManager.getSummary();
```

#### نظام الدفع
- عرض بيانات العميل
- خيار تغليف الهدية
- تطبيق الكوبونات
- عرض الإجمالي النهائي

#### نظام الإشعارات
```javascript
// إشعار نجاح
notificationSystem.success('تمت الإضافة بنجاح');

// إشعار خطأ
notificationSystem.error('حدث خطأ ما');

// إشعار بحالة الطلب
notificationSystem.orderStatus('ZHR-ABC123', 'تم الشحن');

// إشعار بالكوبون
notificationSystem.couponApplied(20, 'percentage');
```

#### تسجيل الدخول الاجتماعي
- تسجيل دخول عبر Google
- تسجيل دخول عبر Facebook
- عرض بيانات المستخدم

### 🎛️ لوحة التحكم (admin-final.html)

#### إدارة المنتجات
- إضافة/تعديل/حذف المنتجات
- رفع الصور مع شريط تقدم
- إدارة الأنواع والمقاسات
- تحديد سعر تغليف الهدية

#### إدارة الطلبات
- عرض جميع الطلبات
- عرض تفاصيل الطلب الكاملة
- تحديث حالة الطلب
- نسخ الفاتورة
- إرسال رسالة واتساب

#### إدارة الكوبونات
- إنشاء كوبونات
- تحديد حد الاستخدام
- تحديد تاريخ الانتهاء
- عرض الإحصائيات

#### الإحصائيات
- عداد الزوار الإجمالي
- عداد الزوار الحاليين
- إجمالي المنتجات
- إجمالي الطلبات

---

## 🔧 الاستخدام المتقدم

### نظام تتبع الطلبات

```javascript
// البحث عن طلب
const order = await orderTracker.findOrderByNumber('ZHR-ABC123');

// الحصول على طلبات العميل
const orders = await orderTracker.getCustomerOrders('01234567890');

// تحديث حالة الطلب
await orderTracker.updateOrderStatus(orderId, 'تم الشحن');

// الحصول على إحصائيات
const stats = await orderTracker.getOrderStats();

// حساب الشحن
const fee = orderTracker.calculateShippingFee('القاهرة');
```

### مدير السلة

```javascript
// إضافة منتج مع نوع
cartManager.addItem(product, 1, 'حجم-كبير');

// تحديث الكمية
cartManager.updateQuantity('product-id-variant', 3);

// إزالة منتج
cartManager.removeItem('product-id-variant');

// حساب الإجمالي مع الخصم
const finalTotal = cartManager.getFinalTotal(coupon, giftWrapPrice);

// تحويل للطلب
const orderItems = cartManager.toOrderFormat();

// تفريغ السلة
cartManager.clear();
```

### نظام الإشعارات

```javascript
// إشعار مخصص
notificationSystem.show('رسالة مخصصة', 'warning', 5000);

// إشعار بخطأ الكوبون
notificationSystem.couponError('expired');

// إشعار بحالة الطلب
notificationSystem.orderStatus('ZHR-001', 'تم الشحن');
```

---

## 🎨 التخصيص

### تغيير الألوان

```css
/* الذهبي الأساسي */
.gold-bg { background-color: #d4af37; }
.gold-text { color: #d4af37; }
.gold-border { border: 1px solid #d4af37; }

/* تغيير إلى لون آخر */
.gold-bg { background-color: #YOUR_COLOR; }
```

### تغيير الخطوط

```html
<!-- في رأس الملف -->
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" rel="stylesheet">
<style>
  body { font-family: 'YOUR_FONT', sans-serif; }
</style>
```

---

## 🔐 الأمان

### قواعس Firestore الموصى بها

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قراءة المنتجات للجميع
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // الطلبات
    match /orders/{document=**} {
      allow read, create: if true;
      allow update: if request.auth != null;
    }

    // الكوبونات
    match /coupons/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📊 قاعدة البيانات

### Collections المطلوبة

#### products
```javascript
{
  id: "auto",
  name: "اسم المنتج",
  price: 250,
  category: "تابلوهات",
  description: "الوصف",
  images: ["url1", "url2"],
  variants: [{name: "صغير", price: 0}, {name: "كبير", price: 100}],
  giftWrapPrice: 50,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### orders
```javascript
{
  id: "auto",
  orderNumber: "ZHR-001",
  customerName: "أحمد محمد",
  customerPhone: "01234567890",
  customerAddress: "القاهرة",
  items: [{name: "منتج", price: 250, qty: 1}],
  subtotal: 250,
  discountAmount: 0,
  giftWrap: false,
  giftPrice: 0,
  totalPrice: 250,
  status: "قيد التنفيذ",
  createdAt: timestamp
}
```

#### coupons
```javascript
{
  id: "auto",
  code: "WELCOME20",
  discount: 20,
  type: "percentage",
  limit: 100,
  usedCount: 0,
  expiryDate: date,
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر المنتجات
```javascript
// افتح console وتحقق من:
console.log('Firebase Config:', firebaseConfig);
console.log('Products:', allProducts);
```

### المشكلة: لا يعمل الدفع
```javascript
// تحقق من Cloudinary
console.log('Cloudinary URL:', CLOUDINARY_URL);
console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
```

### المشكلة: لا تظهر الإشعارات
```javascript
// تحقق من تحميل notifications.js
console.log('Notification System:', notificationSystem);
```

---

## 📱 التوافقية

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS, Android
- ✅ Tablets
- ✅ RTL (من اليمين لليسار)
- ✅ اللغة العربية

---

## 🚀 النشر

### على GitHub Pages
```bash
git add .
git commit -m "Deploy"
git push origin main
```

### على Firebase Hosting
```bash
firebase deploy
```

### على Netlify
```bash
netlify deploy --prod
```

---

## 📞 الدعم

### روابط مهمة
- 🌐 الموقع: https://studiozahraa.com
- 💬 الواتساب: 01204194540
- 📧 البريد: info@studiozahraa.com
- 📱 الفيسبوك: facebook.com/StudioZahraa

### المساعدة
- 📖 [دليل التثبيت](./INSTALLATION.md)
- 📝 [تفاصيل التحديثات](./UPDATES.md)
- 💻 [الملفات الأصلية](./index.html)

---

## 📜 الترخيص

جميع الحقوق محفوظة © 2026 استوديو الزهراء

---

## 🙏 شكر وتقدير

شكراً لاستخدامك متجر استوديو الزهراء المحسن!

**آخر تحديث**: 2026-04-28  
**الإصدار**: 2.0.0
