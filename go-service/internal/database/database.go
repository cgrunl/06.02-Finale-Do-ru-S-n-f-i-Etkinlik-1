package database

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

// Connect PostgreSQL veritabanına bağlanır.
func Connect(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, err
	}

	// Bağlantı havuzu ayarları
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	// Bağlantı testi
	if err := db.Ping(); err != nil {
		return nil, err
	}

	log.Println("✅ PostgreSQL bağlantısı başarılı")
	return db, nil
}
