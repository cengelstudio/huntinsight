# AvGörüş (HuntInsight)

AvGörüş, K.K.T.C.'deki avcıların görüşlerini toplamak için geliştirilmiş bir anket sistemidir. Kullanıcılar kimlik bilgileriyle giriş yaparak önceden hazırlanmış soruları yanıtlayabilir ve yönetici panel üzerinden anketler yönetilebilir.

## Özellikler

- Kullanıcı Kaydı:
  - İsim Soyisim
  - K.K.T.C. Kimlik Numarası
  - Av Ruhsat Seri Numarası

- Dinamik Anket Sistemi:
  - Önceki cevaplara göre değişen sorular
  - Çoktan seçmeli sorular
  - Esnek şık sayısı

- Yönetici Paneli:
  - Tek şifre ile giriş
  - Anket oluşturma ve düzenleme
  - Kullanıcı cevaplarını görüntüleme
  - Anket sonuçlarını inceleme

## Teknolojiler

- Next.js 14
- TypeScript
- Tailwind CSS
- JSON tabanlı veri depolama

## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/cengelstudio/huntinsight.git
   cd huntinsight
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   # veya
   yarn dev
   ```

4. Tarayıcınızda http://localhost:3000 adresini açın

## Veri Yapısı

Veriler JSON formatında `data` klasöründe saklanır:

- `users.json`: Kullanıcı kayıtları
- `surveys.json`: Anket tanımları ve soruları
- `responses.json`: Kullanıcı cevapları
- `admin.json`: Yönetici şifresi (varsayılan: "admin")

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.
