# 🏃‍♂️ StepZ - Okul Adım Yarışması Uygulaması

**by RUMET ASAN**

Bu proje, okul içi öğrenciler arasında adım saymaya dayalı bir yarışma sistemidir. React Native (Expo) ile geliştirilmiş, Firebase backend'i ile entegre edilmiş ve Google Fit API kullanılarak adım verisi alınmaktadır.

## 🚀 Özellikler

### ✨ Ana Özellikler
- **Firebase Authentication** ile güvenli kullanıcı sistemi
- **Gerçek zamanlı adım takibi** (Google Fit API simülasyonu)
- **Liderlik tabloları** (Bireysel, Sınıf, Seviye bazlı)
- **Rozet sistemi** ile motivasyon
- **Özel etkinlikler** ve bonus sistemleri
- **Modern animasyonlu UI** ile harika kullanıcı deneyimi
- **Bildirim sistemi** 

### 📱 Ekranlar
1. **Giriş/Kayıt Ekranları** - Animasyonlu ve güvenli
2. **Ana Ekran** - Günlük adımlar, rozetler ve istatistikler
3. **Adım Sayıcı** - Gerçek zamanlı adım takibi
4. **Liderlik Tablosu** - 3 farklı kategori
5. **Etkinlikler** - Özel yarışmalar ve bonuslar
6. **Profil** - Kullanıcı bilgileri ve ayarlar

## 🛠️ Kurulum

### Ön Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (Android geliştirme için)
- Firebase projesi

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd stepz
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Firebase Konfigürasyonu
1. [Firebase Console](https://console.firebase.google.com/) üzerinden yeni proje oluşturun
2. Authentication, Firestore Database ve Storage servislerini aktifleştirin
3. `firebaseConfig.js` dosyasındaki konfigürasyonu güncelleyin:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Firestore Veritabanı Yapısı
Aşağıdaki koleksiyonları oluşturun:

```
users/
  - name: string
  - email: string
  - class: string (örn: "9A")
  - grade: string (örn: "9")
  - age: number
  - totalSteps: number
  - earnedBadges: array
  - stepsLog: object
  - joinDate: timestamp

events/
  - title: string
  - description: string
  - startDate: timestamp
  - endDate: timestamp
  - isActive: boolean
  - participants: number
```

### 5. Uygulamayı Çalıştırın
```bash
# Geliştirme sunucusunu başlatın
npm start

# Android emülatörde çalıştırın
npm run android

# iOS simulatörde çalıştırın (macOS)
npm run ios
```

## 📱 Uygulama Kullanımı

### Kayıt Olma
1. "Kayıt Ol" butonuna tıklayın
2. Ad, e-posta, sınıf, seviye ve yaş bilgilerini girin
3. Güçlü bir şifre belirleyin
4. Hesabınız oluşturulacak ve ana ekrana yönlendirileceksiniz

### Adım Sayma
1. "Adım Say" sekmesine gidin
2. "Başla" butonuna tıklayın
3. Telefonu cebinizde taşıyın
4. Adımlarınız gerçek zamanlı olarak sayılacak
5. "Durdur" butonuyla oturumu sonlandırın

### Liderlik Tablosu
- **Bireysel**: Kişisel sıralamalarınızı görün
- **Sınıf**: Sınıf arkadaşlarınızla yarışın
- **Seviye**: Diğer seviyelere karşı mücadele edin

### Rozetler
- 🥉 **Bronz** (1.000 adım)
- 🥈 **Gümüş** (5.000 adım)
- 🥇 **Altın** (10.000 adım)
- 🏅 **Elmas** (20.000 adım)
- 👑 **Efsane** (50.000 adım)

## 🎯 Teknoloji Yığını

- **Frontend**: React Native 0.79.5
- **Framework**: Expo ~53.0.16
- **Navigation**: React Navigation 6
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Animations**: React Native Reanimated
- **UI**: Linear Gradients, Vector Icons
- **Charts**: React Native Chart Kit

## 🔧 Geliştirme

### Proje Yapısı
```
stepz/
├── src/
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   ├── screens/           # Uygulama ekranları
│   ├── context/           # React Context (State yönetimi)
│   ├── services/          # API servisleri
│   └── utils/             # Yardımcı fonksiyonlar
├── assets/                # Resimler ve diğer statik dosyalar
├── firebaseConfig.js      # Firebase konfigürasyonu
└── App.js                # Ana uygulama dosyası
```

### Yeni Özellik Ekleme
1. `src/screens/` klasörüne yeni ekran ekleyin
2. `App.js` dosyasında navigasyonu güncelleyin
3. Gerekirse context dosyalarını güncelleyin
4. Firebase'de yeni koleksiyonlar oluşturun

### Stil Rehberi
- **Ana Renkler**: 
  - Primary: #4F46E5 (Indigo)
  - Secondary: #7C3AED (Purple)
  - Accent: #EC4899 (Pink)
- **Typography**: Poppins font family kullanılır
- **Spacing**: 8px'in katları (8, 16, 24, 32...)

## 🚀 Prodüksiyon

### Android APK Oluşturma
```bash
# EAS Build kurulumu
npm install -g @expo/eas-cli
eas login

# Android build
eas build --platform android
```

### Firebase Güvenlik Kuralları
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 📊 Özellik Roadmap

### v1.1 (Gelecek)
- [ ] Apple Health entegrasyonu (iOS)
- [ ] Gerçek Google Fit API entegrasyonu
- [ ] Push notification sistemi
- [ ] Grafik ve istatistik detayları
- [ ] Sosyal paylaşım özellikleri

### v1.2 (Gelecek)
- [ ] Admin panel web uygulaması
- [ ] Özel etkinlik oluşturma
- [ ] Arkadaş sistemi
- [ ] Özel challenge'lar

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

**RUMET ASAN**
- GitHub: [@rumetasan](https://github.com/rumetasan)
- Email: rumet@example.com

## 🙏 Teşekkürler

- Firebase ekibine harika backend servisleri için
- Expo ekibine mükemmel geliştirme deneyimi için
- React Native topluluğuna sürekli destek için

---

**StepZ ile adım at, yarış kazân! 🏆**

*Made with ❤️ by RUMET ASAN*