# Üniversite Platformu - Polyglot Backend Projesi
Öğrenci: çağrı ünlü
Okul No: 24080410029
Üniversite: Bitlis Eren Üniversitesi

---

## 🚀 Proje Hakkında Genel Bilgi

**Üniversite Etkinlik Yönetim Sistemi (CampusConnect)**, üniversitedeki öğrenci kulüplerinin ve topluluklarının etkinliklerini planlamaları, duyurmaları ve yönetmeleri amacıyla tasarlanmış kapsamlı bir RESTful ve GraphQL tabanlı backend platformudur. Birbiriyle haberleşen farklı mikroservisleri barındıran bu proje, gerçek zamanlı bildirimler ve detaylı analitik raporlamalar sunar.

## 🏗️ Projenin Mimari Yapısı

Proje temel olarak iki ana servisten ve ortak bir veritabanından oluşmaktadır:

- **Ana Servis (NestJS - Port 3000):** Kullanıcı işlemleri (Kayıt, Giriş, Yetkilendirme), etkinliklerin oluşturulup listelenmesi (REST + GraphQL) ve diğer servislere webhook gönderiminden sorumludur.
- **Analitik ve Webhook Servisi (Go - Port 8080):** NestJS tarafından gönderilen asenkron webhook'ları dinler, etkinliklerle ilgili yoğun istatistik ve analitik hesaplamaları yüksek performansla gerçekleştirir. Rate limiting ve API Key kontrollerini barındırır.
- **Veritabanı Katmanı (PostgreSQL):** Her iki servisin de bağlandığı ana veri deposudur.

### Kullanılan Teknolojiler
- **Programlama Dilleri:** TypeScript (Node.js), Go (Golang)
- **Framework'ler:** NestJS, Gin
- **Veritabanı & ORM:** PostgreSQL, Prisma ORM
- **Authentication:** JWT, bcrypt, API Anahtarı
- **Dokümantasyon:** Swagger (OpenAPI)
- **Dağıtım (Deployment):** Docker ve Docker Compose

## 🔐 Ortam Değişkenleri Konfigürasyonu

Projeyi ayağa kaldırmak için ana dizinde bulunan `.env.example` dosyasının adını `.env` olarak değiştirin ve içeriğini kendinize göre güncelleyin. Temel değişkenler şunlardır:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (Veritabanı bağlantı bilgileri)
- `JWT_SECRET`, `JWT_EXPIRES_IN` (Güvenlik ve oturum yönetimi)
- `WEBHOOK_SECRET`, `API_KEY` (Servisler arası haberleşme güvenliği)
- `RATE_LIMIT_RPM` (Performans ve güvenlik sınırlaması)

## 💻 Kurulum ve Çalıştırma

### Docker ile Hızlı Başlangıç
Sisteminizde Docker yüklüyse, aşağıdaki komutla tüm projeyi tek seferde ayağa kaldırabilirsiniz:
```bash
# Gerekli çevre değişkeni dosyasını oluşturun
cp .env.example .env

# Tüm container'ları derleyip başlatın
docker-compose up --build
```
Başarıyla çalıştığında erişim noktaları:
- NestJS API Dokümantasyonu: `http://localhost:3000/api-docs`
- Go Analitik Servisi: `http://localhost:8080/api/v1/analytics/popular`

### Lokal Ortamda Geliştirme İçin Çalıştırma

**NestJS (Ana Backend) için:**
```bash
cd nestjs-service
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Go (Analitik Servis) için:**
```bash
cd go-service
go mod download
go run main.go
```

## 🛠️ API Entegrasyon Noktaları (Endpoints)

### 1- Ana Servis (NestJS) Endpoints
*Kullanıcı ve Etkinlik Yönetimi:*
- `POST /api/v1/auth/register` - Sisteme yeni kullanıcı kaydı
- `POST /api/v1/auth/login` - Oturum açma (JWT temini)
- `GET /api/v1/events` - Etkinlik kataloğu
- `POST /api/v1/events` - Yeni etkinlik planlama (JWT Gerektirir)
- `PATCH / DELETE /api/v1/events/:id` - Etkinlik düzenleme ve silme işlemleri

*GraphQL İstekleri (`/graphql`):*
- `events`, `myEvents` (Sorgu / Query)
- `joinEvent`, `leaveEvent` (Değişiklik / Mutation)

### 2- Go Servisi Endpoints
*İstatistik ve Sistem Haberleşmesi:*
- `POST /api/v1/webhooks/events` - NestJS'den gelen webhook'ların işlenmesi
- `GET /api/v1/analytics/popular` - En çok ilgi gören etkinlikler (API Key gerektirir)
- `GET /api/v1/analytics/weekly` - Haftalık istatistik verileri

## 🛡️ Hata Yönetimi Standardı (RFC 7807)

API'ler genelinde standart bir hata dönüş yapısı (RFC 7807 Standardı) benimsenmiştir.
Örnek hata yanıtı:
```json
{
  "type": "https://api.campusconnect/errors/not-found",
  "title": "Kayıt Bulunamadı",
  "status": 404,
  "detail": "Belirtilen ID numarasına sahip etkinlik sistemde mevcut değil.",
  "instance": "/api/v1/events/99"
}
```

---
*Bu proje 2026 yılı bitirme / final etkinliği kapsamında geliştirilmiştir.*
