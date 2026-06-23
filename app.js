document.addEventListener('DOMContentLoaded', loadProductsAndStars);

async function loadProductsAndStars() {
    // كود تأثير النجوم
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = '2px';
            star.style.height = '2px';
            star.style.background = '#fff';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.left = Math.random() * 100 + 'vw';
            starsContainer.appendChild(star);
        }
    }

    // جلب المنتجات وتوزيعها
    const novelsContainer = document.getElementById('novels-container');
    const storiesContainer = document.getElementById('stories-container');
    const kidsContainer = document.getElementById('kids-container');

    if (!novelsContainer || !storiesContainer || !kidsContainer) return;

    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();

        novelsContainer.innerHTML = '';
        storiesContainer.innerHTML = '';
        kidsContainer.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${product.image}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">${product.price} EGP</div>
                <button onclick="buyProduct('${product.name}', '${product.price}')">شراء الآن</button>
            `;

            if (product.category === 'novels') novelsContainer.appendChild(card);
            else if (product.category === 'stories') storiesContainer.appendChild(card);
            else if (product.category === 'kids') kidsContainer.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

// دالة الشراء الفوري المحولة لباي موب
async function buyProduct(name, price) {
    try {
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, price: price })
        });
        const data = await response.json();
        if (data.url) {
            // العميل هيروح لصفحة الدفع فوراً هنا 💸
            window.location.href = data.url; 
        } else {
            alert("حدث خطأ في السيرفر أثناء توليد رابط دفع باي موب.");
        }
    } catch (error) {
        alert("تأكد من تشغيل الشاشة السوداء أولاً بـ node server.js");
    }
}

// دالة حماية لوحة التحكم بالرمز
function openAdminPanel() {
    const password = prompt("برجاء إدخال رمز الدخول للوحة التحكم:");
    if (password === "mahmoud123") {
        window.location.href = "admin.html";
    } else {
        alert("الرمز غير صحيح!");
    }
}