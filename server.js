const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 بيانات حسابك محمود صبيح في Paymob المدمجة بالكامل
const PAYMOB_API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFNE5qSXpNQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5XS1h1cHpQOUN2enZsSEJPcFpnT1Y4ak9YRF84bXNVN1VSZFpuWWg2LXNlZWtGMEwwMVhSam9tZzNOTzg1WHBmMmhMN294UTl2aHU1RXVzT3hqbS1XUQ==";
const INTEGRATION_ID = 5741691; 
const IFRAME_ID = 1055011; 

// مصفوفة المنتجات الديناميكية المنشورة من لوحة التحكم
let dbProducts = [];

// أيباي جلب المنتجات لتعرض في الصفحة الرئيسية
app.get('/api/products', (req, res) => {
    res.json(dbProducts);
});

// أيباي استقبال ونشر كتاب جديد من لوحة التحكم
app.post('/api/products', (req, res) => {
    const { name, category, price, image, description } = req.body;
    dbProducts.push({ name, category, price, image, description });
    res.status(201).json({ success: true });
});

// 💳 الـ API العبقري لتوليد رابط الدفع الفوري لأي منتج (قديم أو منشور حديثاً)
app.post('/api/checkout', async (req, res) => {
    try {
        const { name, price } = req.body;
        const amountInCents = parseFloat(price) * 100; // تحويل السعر لقروش لباي موب

        // الخطوة 1: التسجيل وجلب الـ Auth Token
        const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: PAYMOB_API_KEY
        });
        const token = authResponse.data.token;

        // الخطوة 2: تسجيل أمر الشراء (Order) داخل نظام باي موب
        const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: amountInCents,
            currency: "EGP", 
            items: [{ name: name, amount_cents: amountInCents, quantity: 1 }]
        });
        const orderId = orderResponse.data.id;

        // الخطوة 3: توليد الـ Payment Key المربوط بالـ Integration ID بتاعك
        const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: amountInCents,
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                apartment: "NA", email: "customer@cora.com", floor: "NA",
                first_name: "Cora", street: "NA", building: "NA",
                phone_number: "+201000000000", shipping_method: "PKG",
                postal_code: "NA", city: "Cairo", country: "EG", last_name: "Store"
            },
            currency: "EGP",
            integration_id: INTEGRATION_ID
        });

        const paymentToken = paymentKeyResponse.data.token;
        
        // رابط الـ Iframe النهائي الموجه لصفحة الدفع بحسابك وبياناتك
        const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;

        // إرسال الرابط للمتصفح عشان يحول العميل فوراً
        res.json({ url: paymentUrl });

    } catch (error) {
        console.error("Paymob Error:", error.message);
        res.status(500).json({ error: 'فشل في الاتصال ببوابه دفع باي موب' });
    }
});

// تشغيل السيرفر على بورت 3000
app.listen(3000, () => console.log('سيرفر CORA جاهز ومربوط بباي موب على بورت 3000 🚀'));