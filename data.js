// بيانات افتراضية للموقع - يمكنك تعديلها من لوحة التحكم

const testimonials = [
  {
    id: 1,
    name: "فاطمة محمد",
    image: "https://via.placeholder.com/80?text=فاطمة",
    text: "تابلوهات رائعة جداً وجودة عالية جداً، الشحن كان سريع والتغليف احترافي. شكراً لاستوديو الزهراء!",
    rating: 5
  },
  {
    id: 2,
    name: "أحمد علي",
    image: "https://via.placeholder.com/80?text=أحمد",
    text: "طلبت مجات مخصصة وكانت النتيجة أكثر من رائعة. الفريق احترافي جداً والتعامل ممتاز.",
    rating: 5
  },
  {
    id: 3,
    name: "سارة حسن",
    image: "https://via.placeholder.com/80?text=سارة",
    text: "هدايا عيد الميلاد كانت مثالية! الجودة والتصميم أكثر من ما توقعت. أنصح الجميع بالتعامل معهم.",
    rating: 5
  }
];

const portfolio = [
  {
    id: 1,
    title: "جلسة تصوير عائلية",
    category: "عائلي",
    image: "https://via.placeholder.com/300x200?text=عائلي",
    description: "جلسة تصوير عائلية دافئة وجميلة"
  },
  {
    id: 2,
    title: "تصوير أطفال",
    category: "أطفال",
    image: "https://via.placeholder.com/300x200?text=أطفال",
    description: "لحظات براءة وفرح الأطفال"
  },
  {
    id: 3,
    title: "بورتريه احترافي",
    category: "بورتريه",
    image: "https://via.placeholder.com/300x200?text=بورتريه",
    description: "صور بورتريه احترافية وعالية الجودة"
  },
  {
    id: 4,
    title: "جلسة أفراح",
    category: "أفراح",
    image: "https://via.placeholder.com/300x200?text=أفراح",
    description: "تصوير احترافي لأجمل اللحظات"
  }
];

const coupons = [
  {
    code: "FIRST10",
    discount: 10,
    type: "percentage",
    description: "خصم 10% لأول طلب",
    active: true
  },
  {
    code: "SUMMER20",
    discount: 20,
    type: "percentage",
    description: "خصم 20% على جميع المنتجات",
    active: true
  },
  {
    code: "GIFT50",
    discount: 50,
    type: "fixed",
    description: "خصم 50 جنيه على الطلبات فوق 200 جنيه",
    active: true
  }
];
