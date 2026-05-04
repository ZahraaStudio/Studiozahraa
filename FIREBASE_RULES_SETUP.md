# كيفية تطبيق Firestore Rules

## الخطوات (5 دقائق فقط)

1. افتح **Firebase Console**: https://console.firebase.google.com
2. اختر مشروعك: **zahraa-store-f4c90**
3. من القائمة الجانبية: **Firestore Database**
4. اضغط تبويب: **Rules**
5. احذف كل النص الموجود والصق محتوى ملف `public/firestore.rules`
6. اضغط **Publish**

## ✅ ما تم إصلاحه في هذه القواعد

- `ads` — الكل يقرأ الإعلانات | الأدمن فقط يكتب ✅
- `push_tokens` — أي جهاز يسجّل نفسه | الأدمن فقط يقرأ ✅
- `community_posts` — أي عميل يخفي منشوره بدون auth ✅
- `reports` — أي زائر يُبلّغ ✅
- `users` — الأدمن يعدّل أي مستخدم (للحظر وغيره) ✅
- أي مجموعة غير معرّفة = **محظور تلقائياً** (أمان كامل) ✅
