# دليل التثبيت والإعداد - متجر استوديو الزهراء

## 📋 المتطلبات

### متطلبات النظام
- متصفح حديث (Chrome, Firefox, Safari, Edge)
- اتصال بالإنترنت
- حساب Firebase
- حساب Cloudinary

### المتطلبات البرمجية
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Firebase Firestore
- Firebase Authentication

---

## 🔧 خطوات الإعداد

### 1. إعداد Firebase

#### أ. إنشاء مشروع Firebase
1. توجه إلى [Firebase Console](https://console.firebase.google.com)
2. انقر على "Create Project"
3. أدخل اسم المشروع (مثل: studiozahraa)
4. اتبع الخطوات حتى إنشاء المشروع

#### ب. تفعيل Firestore
1. في لوحة التحكم، اختر "Firestore Database"
2. انقر على "Create database"
3. اختر "Start in test mode"
4. اختر المنطقة الجغرافية

#### ج. تفعيل Authentication
1. اختر "Authentication" من القائمة الجانبية
2. انقر على "Get started"
3. فعّل طرق الدخول:
   - Email/Password
   - Google
   - Facebook

#### د. الحصول على بيانات الاتصال
1. اذهب إلى "Project Settings"
2. اختر "Your apps"
3. انقر على Web App
4. انسخ Firebase config

### 2. إعداد Cloudinary

#### أ. إنشاء حساب Cloudinary
1. توجه إلى [Cloudinary](https://cloudinary.com)
2. أنشئ حساباً مجانياً
3. تحقق من بريدك الإلكتروني

#### ب. الحصول على بيانات الاتصال
1. في Dashboard، انسخ:
   - Cloud Name
   - API Key
   - Upload Preset

#### ج. إنشاء Upload Preset
1. اذهب إلى "Settings" > "Upload"
2. انقر على "Add upload preset"
3. اسم الـ Preset: `zahraa_studio`
4. Mode: Unsigned
5. احفظ التغييرات

### 3. تحديث ملفات المشروع

#### أ. تحديث Firebase Config في index-enhanced.html
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

#### ب. تحديث Firebase Config في admin-final.html
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

#### ج. تحديث Cloudinary Config
```javascript
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'zahraa_studio';
```

### 4. إنشاء Collections في Firestore

#### أ. Collection: products
```
/products
├── id: string (auto-generated)
├── name: string
├── price: number
├── category: string
├── description: string
├── images: array
├── variants: array [{name, price}]
├── giftWrapPrice: number
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### ب. Collection: orders
```
/orders
├── id: string (auto-generated)
├── orderNumber: string
├── customerName: string
├── customerPhone: string
├── customerAddress: string
├── items: array [{name, price, qty}]
├── subtotal: number
├── discountAmount: number
├── giftWrap: boolean
├── giftPrice: number
├── totalPrice: number
├── status: string
├── createdAt: timestamp
└── imageGroups: array
```

#### ج. Collection: coupons
```
/coupons
├── id: string (auto-generated)
├── code: string
├── discount: number
├── type: string (percentage/fixed)
├── limit: number
├── usedCount: number
├── expiryDate: date
├── isActive: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### د. Collection: visitors
```
/visitors
├── id: string (visitor-id)
├── count: number
└── timestamp: timestamp
```

#### هـ. Collection: testimonials
```
/testimonials
├── id: string (auto-generated)
├── name: string
├── text: string
├── rating: number
├── avatarUrl: string
├── createdAt: timestamp
└── timestamp: timestamp
```

### 5. إعداد Firestore Rules

#### قواعد الأمان المقترحة
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح بقراءة المنتجات للجميع
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/admins/list).data.uids;
    }

    // السماح بقراءة الطلبات للعملاء
    match /orders/{document=**} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/admins/list).data.uids;
    }

    // السماح بقراءة الكوبونات للجميع
    match /coupons/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/admins/list).data.uids;
    }

    // السماح بقراءة الزوار للجميع
    match /visitors/{document=**} {
      allow read, write: if true;
    }

    // السماح بقراءة الآراء للجميع
    match /testimonials/{document=**} {
      allow read: if true;
      allow create: if true;
      allow delete: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/admins/list).data.uids;
    }
  }
}
```

### 6. إعداد المسؤولين

#### إنشاء مستخدم مسؤول
1. في Firebase Console، اذهب إلى Authentication
2. أضف مستخدماً جديداً:
   - البريد الإلكتروني: admin@studiozahraa.com
   - كلمة المرور: كلمة قوية

3. في Firestore، أنشئ Collection `admins` مع Document `list`:
```javascript
{
  uids: ["USER_UID_HERE"]
}
```

---

## 🚀 التشغيل

### الخيار 1: التشغيل المحلي
```bash
# استخدم أي web server محلي
python -m http.server 8000
# أو
npx http-server
```

ثم توجه إلى: `http://localhost:8000`

### الخيار 2: النشر على GitHub Pages
```bash
git add .
git commit -m "Deploy Zahraa Studio"
git push origin main
```

### الخيار 3: النشر على Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 📝 البيانات الأولية

### إضافة منتجات تجريبية
```javascript
// في console
db.collection('products').add({
  name: 'تابلو فني',
  price: 250,
  category: 'تابلوهات',
  description: 'تابلو فني عصري',
  images: ['https://example.com/image.jpg'],
  variants: [{name: 'صغير', price: 0}, {name: 'كبير', price: 100}],
  giftWrapPrice: 50,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### إضافة كوبون تجريبي
```javascript
db.collection('coupons').add({
  code: 'WELCOME20',
  discount: 20,
  type: 'percentage',
  limit: 100,
  usedCount: 0,
  expiryDate: new Date('2026-12-31'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## 🔐 الأمان

### نصائح أمان مهمة
1. **لا تشارك مفاتيح Firebase** في الكود العام
2. **استخدم متغيرات البيئة** للبيانات الحساسة
3. **فعّل HTTPS** عند النشر
4. **حدّث قواعس Firestore** بانتظام
5. **استخدم كلمات مرور قوية** للمسؤولين
6. **راجع سجلات الوصول** بانتظام

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر المنتجات
**الحل:**
1. تحقق من Firebase config
2. تأكد من وجود Collection products
3. افتح console وابحث عن الأخطاء
4. تحقق من قواعس Firestore

### المشكلة: لا يعمل الدفع
**الحل:**
1. تحقق من Cloudinary config
2. تأكد من Upload Preset
3. اختبر الرفع يدويًا

### المشكلة: لا يعمل تسجيل الدخول
**الحل:**
1. تحقق من تفعيل Authentication
2. تأكد من طرق الدخول المفعلة
3. افتح console وابحث عن الأخطاء

---

## 📞 الدعم

للمساعدة والدعم:
- 📧 البريد: info@studiozahraa.com
- 💬 الواتساب: 01204194540
- 📱 الفيسبوك: facebook.com/StudioZahraa

---

**آخر تحديث**: 2026-04-28
