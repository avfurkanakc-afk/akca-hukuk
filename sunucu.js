const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Buraya MongoDB'den aldığın, şifreli o uzun adresi yapıştır
const dbURI = 'mongodb+srv://avfurkanakc_db_user:zphoN4L9aMtpiEBF@cluster0.mqtcwgo.mongodb.net/?appName=Cluster0'; 

mongoose.connect(dbURI)
  .then(() => console.log('Akça Hukuk Bulut Veritabanı Bağlantısı Başarılı!'))
  .catch((err) => console.log('Bağlantı Hatası: ', err));

const Talep = mongoose.model('Talep', {
    adSoyad: String,
    telefon: String,
    mesaj: String,
    tarih: { type: Date, default: Date.now }
});

app.get('/', (req, res) => {
    res.send(`
        <body style="font-family: 'Times New Roman', serif; background-color: #f0f2f5; padding: 50px;">
            <div style="background: white; max-width: 600px; margin: auto; padding: 40px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-top: 5px solid #1a2a6c;">
                <h1 style="color: #1a2a6c; text-align: center; letter-spacing: 2px;">AKÇA HUKUK & DANIŞMANLIK</h1>
                <p style="text-align: center; color: #666; font-style: italic;">Aile Şirketleri ve Varlık Yönetimi Danışmanlık Hattı</p>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
                <form action="/talep-gonder" method="POST" style="display: flex; flex-direction: column; gap: 20px;">
                    <input type="text" name="adSoyad" placeholder="Adınız Soyadınız" required style="padding: 12px; border: 1px solid #ddd; border-radius: 5px;">
                    <input type="text" name="telefon" placeholder="Telefon Numaranız" required style="padding: 12px; border: 1px solid #ddd; border-radius: 5px;">
                    <textarea name="mesaj" placeholder="Danışmanlık İstediğiniz Konu (Örn: Varlık Devri, Şirket Anayasası)" rows="5" style="padding: 12px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
                    <button type="submit" style="background: #1a2a6c; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px;">Talebi Gizli Olarak İlet</button>
                </form>
            </div>
        </body>
    `);
});

app.post('/talep-gonder', async (req, res) => {
    try {
        const yeniTalep = new Talep({
            adSoyad: req.body.adSoyad,
            telefon: req.body.telefon,
            mesaj: req.body.mesaj
        });
        await yeniTalep.save();
        res.send("<h2 style='text-align:center; color:#27ae60; font-family:sans-serif; margin-top:100px;'>Talebiniz Kaydedildi. <br> Gizlilik prensiplerimiz çerçevesinde incelenip tarafınıza dönüş sağlanacaktır.</h2><p style='text-align:center;'><a href='/'>Geri Dön</a></p>");
    } catch (err) {
        res.send("Sistem hatası: " + err);
    }
});

// GÜVENLİ YÖNETİCİ PANELİ
app.get('/admin-panel-akca', async (req, res) => {
    // BURAYA SENİN ÖZEL ŞİFREN (Örn: 'Akca2026!')
    const yoneticiSifresi = req.query.sifre;

    if (yoneticiSifresi !== 'Zaza2121') {
        return res.status(401).send("<h2>Yetkisiz Erişim!</h2><p>Bu alan sadece Av. Furkan Akça'ya özeldir.</p>");
    }

    try {
        const tumTalepler = await Talep.find().sort({ tarih: -1 });
        let tabloSatirlari = tumTalepler.map(t => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${t.tarih.toLocaleString('tr-TR')}</td>
                <td style="border: 1px solid #ddd; padding: 10px;"><b>${t.adSoyad}</b></td>
                <td style="border: 1px solid #ddd; padding: 10px;">${t.telefon}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${t.mesaj}</td>
            </tr>
        `).join('');

        res.send(`
            <body style="font-family: sans-serif; padding: 40px; background: #f8f9fa;">
                <h2 style="color: #1a2a6c; text-align: center;">Akça Hukuk - Güvenli Yönetici Paneli</h2>
                <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <thead style="background: #1a2a6c; color: white;">
                        <tr>
                            <th style="padding: 15px; text-align: left;">Tarih</th>
                            <th style="padding: 15px; text-align: left;">Müvekkil Adayı</th>
                            <th style="padding: 15px; text-align: left;">İletişim</th>
                            <th style="padding: 15px; text-align: left;">Konu/Mesaj</th>
                        </tr>
                    </thead>
                    <tbody>${tabloSatirlari}</tbody>
                </table>
                <p style="text-align: center; margin-top: 20px;"><a href="/">Ana Sayfaya Dön</a></p>
            </body>
        `);
    } catch (err) {
        res.send("Panel yüklenirken hata oluştu.");
    }
});// Eski satırı sil, bunu yapıştır:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Akça Hukuk Portalı ${PORT} portunda aktif.`));