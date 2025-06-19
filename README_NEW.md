# RelaxTeror Desktop 🎵

Modern, interaktif masaüstü arayüzü Spotify entegrasyonu ile.

## Özellikler ✨

- 🎵 **Canlı Spotify Entegrasyonu** - Şu anda dinlediğiniz şarkıyı gerçek zamanlı gösterir
- 🎮 **Aktivite Durumu** - Discord benzeri aktivite göstergesi
- 🌃 **Modern Tasarım** - Karanlık tema ve şehir manzarası arka planı
- 📱 **Responsive** - Mobil ve desktop uyumlu
- 🔗 **Sosyal Medya Bağlantıları** - Tüm sosyal platformlarınız bir arada
- ⏰ **Canlı Saat** - Gerçek zamanlı saat ve konum

## Kurulum 🚀

1. **Projeyi klonlayın:**
   ```bash
   git clone <repo-url>
   cd relax
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Spotify API Kurulumu:**
   
   a. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)'a gidin
   
   b. Yeni bir uygulama oluşturun
   
   c. `.env` dosyası oluşturun (`.env.example`'dan kopyalayarak):
   ```bash
   cp .env.example .env
   ```
   
   d. `.env` dosyasını doldurun:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```
   
   e. Spotify uygulamanızın Redirect URI'sini `http://localhost:5173/callback` olarak ayarlayın

4. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

## Kullanım 📖

### Spotify Bağlantısı

1. Sağ üstteki Spotify player'ında 🔌 butonuna tıklayın
2. Spotify hesabınızla giriş yapın
3. İzinleri onaylayın
4. Artık gerçek zamanlı müzik durumunuzu görebilirsiniz!

### Özelleştirme

- **Profil bilgileri:** `src/App.tsx` dosyasında kullanıcı bilgilerini değiştirin
- **Sosyal medya bağlantıları:** Sosyal medya ikonlarının href değerlerini güncelleyin
- **Arka plan:** `src/App.css` dosyasında `.background` sınıfını değiştirin
- **Konum:** Time location bölümünde şehir bilginizi güncelleyin

## Teknolojiler 🛠️

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Spotify Web API** - Müzik entegrasyonu
- **CSS3** - Modern styling with backdrop-filter

## API Endpoints 📡

Uygulama aşağıdaki Spotify API endpoint'lerini kullanır:

- `GET /me/player/currently-playing` - Şu anda çalınan şarkı
- `PUT /me/player/play` - Müziği oynat
- `PUT /me/player/pause` - Müziği duraklat

## Sorun Giderme 🔧

### Spotify bağlanamıyor

1. CLIENT_ID ve CLIENT_SECRET'ın doğru olduğundan emin olun
2. Redirect URI'nin tam olarak eşleştiğinden emin olun
3. Spotify uygulamanızın "Development Mode"'da olduğundan emin olun

### Şarkı bilgileri güncellenmiyor

1. Spotify Premium hesabınızın olduğundan emin olun
2. Bir cihazda müzik çaldığınızdan emin olun
3. Tarayıcı konsolunu kontrol edin

## Katkıda Bulunma 🤝

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans 📄

MIT License - Detaylar için `LICENSE` dosyasına bakın.

---

**RelaxTeror** ile müzik dinleme deneyiminizi kişiselleştirin! 🎵✨
