// Testimonials Management System

let testimonialsList = [];

function toggleTestimonialForm() {
  const modal = document.getElementById('testimonial-modal');
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

function closeTestimonialModal() {
  const modal = document.getElementById('testimonial-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

async function submitTestimonial() {
  const name = document.getElementById('testimonial-name').value.trim();
  const text = document.getElementById('testimonial-text').value.trim();
  const rating = parseInt(document.getElementById('testimonial-rating').value);

  if (!name || !text || rating < 1) {
    alert('الرجاء ملء جميع الحقول');
    return;
  }

  try {
    const newTestimonial = {
      name: name,
      text: text,
      rating: rating,
      image: `https://via.placeholder.com/80?text=${encodeURIComponent(name)}`,
      timestamp: new Date().toISOString()
    };

    // Save to Firebase
    await db.collection("testimonials").add(newTestimonial);

    // Clear form
    document.getElementById('testimonial-name').value = '';
    document.getElementById('testimonial-text').value = '';
    document.getElementById('testimonial-rating').value = '5';

    alert('شكراً لرأيك! تم حفظ تقييمك بنجاح.');
    closeTestimonialModal();
    loadTestimonials();
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    alert('حدث خطأ أثناء حفظ الرأي. حاول مرة أخرى.');
  }
}

async function loadTestimonials() {
  try {
    const snap = await db.collection("testimonials").orderBy("timestamp", "desc").get();
    testimonialsList = [];
    snap.forEach(doc => {
      testimonialsList.push({ id: doc.id, ...doc.data() });
    });
    renderTestimonials();
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (testimonialsList.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-zinc-400">لا توجد آراء حتى الآن. كن أول من يترك رأيه!</p>';
    return;
  }

  testimonialsList.forEach(item => {
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
