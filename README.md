# CampusConnect — Polyglot API Platformu
Öğrenci: Muhammed Furkan Güngördü
Okul No: 24080410024
Üniversite: Bitlis Eren Üniversitesi

---

## 📋 Proje Açıklaması

**CampusConnect**, üniversite öğrenci toplulukları için geliştirilmiş bir etkinlik yönetim platformunun backend API'sidir. Platform, öğrencilerin etkinlik oluşturmasına, katılmasına ve yönetmesine olanak tanır. Gerçek zamanlı analitik verileri ve webhook entegrasyonları ile modern bir mikroservis mimarisine sahiptir.

## 🏗️ Mimari Yapı

```
┌─────────────────────────────────────────────────────────────┐
│                      CampusConnect                          │
├──────────────────────┬──────────────────────────────────────┤
│   NestJS Servisi     │         Go Servisi                   │
│   (Port 3000)        │         (Port 8080)                  │
│                      │                                      │
│  • User CRUD         │  • Webhook Receiver                  │
│  • Event CRUD        │  • Analytics API                     │
│  • Auth (JWT)        │  • API Key Auth                      │
│  • GraphQL API       │  • Rate Limiting                     │
│  • Webhook Sender    │  • Goroutine Async                   │
│  • Swagger UI        │                                      │
├──────────────────────┴──────────────────────────────────────┤
│                    PostgreSQL (Port 5432)                    │
│                    Ortak Veritabanı                          │
└─────────────────────────────────────────────────────────────┘
```

### Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Ana Servis | NestJS (TypeScript), Prisma ORM |
| Yardımcı Servis | Go 1.21+, Gin Framework |
| Veritabanı | PostgreSQL 15 |
| Kimlik Doğrulama | JWT (JSON Web Token), bcrypt |
| API Dökümantasyon | Swagger (OpenAPI 3.0) |
| Konteyner | Docker, Docker Compose |
| API Protokolleri | REST, GraphQL |

## 📁 Klasör Yapısı

```
campusconnect/
├── docker-compose.yml          # Tüm servislerin orkestrasyon dosyası
├── .env.example                # Çevre değişkenleri şablonu
├── .gitignore                  # Git ignore kuralları
├── README.md                   # Bu dosya
├── requests.http               # API test dosyası (VS Code REST Client)
├── db/
│   └── init.sql                # Veritabanı başlatma scripti
├── nestjs-service/             # Ana servis (NestJS)
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── common/             # Ortak modüller (filters, guards, pipes)
│       ├── auth/               # JWT kimlik doğrulama
│       ├── users/              # Kullanıcı CRUD
│       ├── events/             # Etkinlik CRUD + GraphQL
│       └── webhooks/           # Webhook sender
└── go-service/                 # Yardımcı servis (Go)
    ├── Dockerfile
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── internal/
    │   ├── config/             # Konfigürasyon
    │   ├── database/           # Veritabanı bağlantısı
    │   ├── middleware/         # API Key, Rate Limit
    │   ├── handlers/           # HTTP handler'ları
    │   ├── models/             # Veri modelleri
    │   └── services/           # İş mantığı
    └── pkg/
        └── rfc7807/            # Standart hata formatı
```

## 🔐 Çevre Değişkenleri (Environment Variables)

Projeyi çalıştırmadan önce `.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

| Değişken | Açıklama | Varsayılan Değer |
|----------|----------|------------------|
| `POSTGRES_USER` | PostgreSQL kullanıcı adı | `campusconnect` |
| `POSTGRES_PASSWORD` | PostgreSQL şifresi | `campusconnect_secret` |
| `POSTGRES_DB` | Veritabanı adı | `campusconnect` |
| `JWT_SECRET` | JWT imza anahtarı | — |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi | `1d` |
| `WEBHOOK_SECRET` | Webhook HMAC anahtarı | — |
| `API_KEY` | Go servis API anahtarı | — |
| `RATE_LIMIT_RPM` | Dakika başı istek limiti | `60` |

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Docker & Docker Compose
- (Opsiyonel) Node.js 18+, Go 1.21+

### Docker ile Çalıştırma

```bash
# 1. Repoyu klonlayın
git clone <repo-url>
cd campusconnect

# 2. Çevre değişkenlerini ayarlayın
cp .env.example .env

# 3. Servisleri başlatın
docker-compose up --build

# 4. Servislerin hazır olduğunu doğrulayın
# NestJS:  http://localhost:3000/api-docs
# Go:     http://localhost:8080/api/v1/analytics/popular
```

### Yerel Geliştirme

```bash
# NestJS servisi
cd nestjs-service
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Go servisi
cd go-service
go mod download
go run main.go
```

## 📡 API Endpoint Tablosu

### NestJS Servisi (Port 3000)

#### REST API

| Metod | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/api/v1/auth/register` | Kullanıcı kaydı | ❌ |
| POST | `/api/v1/auth/login` | Giriş yapma (JWT döner) | ❌ |
| POST | `/api/v1/users` | Kullanıcı oluştur | ❌ |
| GET | `/api/v1/users` | Tüm kullanıcıları listele | ❌ |
| GET | `/api/v1/users/:id` | Kullanıcı detayı | ❌ |
| PATCH | `/api/v1/users/:id` | Kullanıcı güncelle | ❌ |
| DELETE | `/api/v1/users/:id` | Kullanıcı sil | ❌ |
| POST | `/api/v1/events` | Etkinlik oluştur | ✅ JWT |
| GET | `/api/v1/events` | Etkinlikleri listele (Pagination, Filter, Sort) | ❌ |
| GET | `/api/v1/events/:id` | Etkinlik detayı | ❌ |
| PATCH | `/api/v1/events/:id` | Etkinlik güncelle | ✅ JWT |
| DELETE | `/api/v1/events/:id` | Etkinlik sil | ✅ JWT |

#### GraphQL (`/graphql`)

| Tür | İşlem | Açıklama |
|-----|-------|----------|
| Query | `events` | Tüm etkinlikleri listele |
| Query | `myEvents` | Kullanıcının katıldığı etkinlikler |
| Mutation | `joinEvent` | Etkinliğe katıl |
| Mutation | `leaveEvent` | Etkinlikten ayrıl |

### Go Servisi (Port 8080)

| Metod | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/api/v1/webhooks/events` | Webhook alıcı | Signature |
| GET | `/api/v1/analytics/popular` | Popüler etkinlikler | API Key |
| GET | `/api/v1/analytics/categories` | Kategori bazlı analitik | API Key |
| GET | `/api/v1/analytics/weekly` | Haftalık analitik | API Key |

## 🛡️ Güvenlik

- **JWT Authentication:** Event CRUD işlemleri JWT token ile korunur.
- **API Key:** Go servisi tüm endpoint'lerde `X-API-Key` header'ı arar.
- **Rate Limiting:** IP bazlı 60 istek/dakika limiti.
- **Webhook Signature:** `X-Webhook-Signature` ile HMAC-SHA256 doğrulama.
- **Password Hashing:** bcrypt ile şifre hashleme.
- **RFC 7807:** Standart hata formatı tüm servislerde uygulanır.

## 📝 Hata Formatı (RFC 7807)

Tüm hatalar aşağıdaki standart formatta döner:

```json
{
  "type": "https://campusconnect.api/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "ID 123 ile etkinlik bulunamadı.",
  "instance": "/api/v1/events/123"
}
```

## 📄 Lisans

Bu proje akademik amaçlı geliştirilmiştir — Bitlis Eren Üniversitesi, 2026.
