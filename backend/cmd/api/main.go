package main

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"apple-store-backend/internal/config"
	"apple-store-backend/internal/router"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	cfg := config.Load()

	db, err := sql.Open("mysql", cfg.DSN())
	if err != nil {
		log.Fatalf("failed to open database connection: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to connect to database: %v (did you run the migrations? see README)", err)
	}
	log.Println("connected to MySQL database:", cfg.DBName)

	r := router.New(db, cfg)

	addr := ":" + cfg.ServerPort
	log.Printf("Apple Store API listening on %s (env=%s)\n", addr, cfg.Env)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
