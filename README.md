# 🏃‍♂️ Okul Adım Sayma Yarışması Uygulaması

Bu proje, okul içi öğrenciler arasında adım saymaya dayalı bir yarışma sistemidir. React Native (Expo) ile geliştirilmiş, Firebase backend'i ile entegre edilmiş ve Google Fit API kullanılarak adım verisi alınmaktadır.

---

## 🚀 Özellikler

### 👤 Kullanıcı Sistemi
- Firebase Authentication ile kayıt ve giriş
- Kullanıcıdan alınan bilgiler:
  - İsim
  - E-posta
  - Sınıf (örn: 9A, 10B)
  - Seviye (örn: 9. sınıf)
  - Yaş

### 🏁 Adım Takibi
- Google Fit API (Android) üzerinden adım verisi alınır
- Start butonuna basıldığında günlük adım sayımı başlar
- Toplam adım ve puan günlük olarak hesaplanır
- iOS desteği (Apple Health) gelecekte eklenecektir

### 🏆 Liderlik Tabloları (Leaderboard)
- **Bireysel:** Her öğrencinin toplam adımına göre sıralama
- **Sınıfsal:** Aynı sınıf (örn: 9A) içindeki ortalama adımlarla sıralama
- **Gradesel:** Tüm 9. sınıflar vs 10. sınıflar gibi seviye bazlı sıralama

### 🎯 Etkinlik Sistemi
- Admin tarafından tanımlanan özel yarışmalar
- Örnek: **"Haftasonu Canavarı"** – Belirli tarihler arasında %50 puan bonusu
- Etkinlikler kullanıcıya bildirim olarak iletilir

### 🥇 Rozet Sistemi
- Kullanıcılar adımlarına göre rozet kazanır
  - 1.000 adım: 🥉 Bronz Rozet
  - 5.000 adım: 🥈 Gümüş Rozet
  - 10.000 adım: 🥇 Altın Rozet
  - 20.000 adım: 🏅 Elmas Rozet

### 📊 Grafik Görselleştirmesi
- Günlük veya haftalık adım sayıları çizgi grafik olarak gösterilir
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) kütüphanesi kullanılır

### 🔔 Bildirim Sistemi
- Expo Notifications ile
  - Etkinlik başlangıçları
  - Günlük hatırlatmalar
  - Rozet kazanınca bildirim

### 🛠️ Admin Panel
- Admin kullanıcıları yarışma oluşturabilir
- Firebase Firestore üzerinden etkinlik kontrolü sağlar
- Özel roller ile sadece admin erişimi

---

## 🛠️ Teknolojiler

| Katman     | Teknoloji                            |
|------------|---------------------------------------|
| Frontend   | React Native (Expo)                  |
| Backend    | Firebase (Auth + Firestore + Storage)|
| Adım Takibi| Google Fit API (Android)             |
| Bildirim   | Expo Notifications                   |
| Grafikler  | react-native-chart-kit               |

---

## 🗂️ Firebase Yapısı (Firestore Koleksiyonlar)

```plaintext
users/                # Her kullanıcı için UID bazlı döküman
  - name
  - email
  - class: "9A"
  - grade: "9"
  - totalSteps
  - earnedBadges
  - stepsLog: { "2025-07-02": 4321, ... }

leaderboards/         # Otomatik güncellenen toplu veriler
  - individual
  - classBased
  - gradeBased

events/               # Admin tarafından eklenen etkinlikler
  - name
  - startDate
  - endDate
  - multiplier
  - description
