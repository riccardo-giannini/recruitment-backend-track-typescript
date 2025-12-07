.PHONY: start stop rebuild logs sh help migrate

SERVICE ?= backend

# Start dev environment
start:
	docker compose up --build -d

# Stop services
stop:
	docker compose down

# Restart
rebuild:
	docker compose down
	docker compose up --build -d

# Run Prisma migrations (safe for team/Docker use)
migrate:
	docker compose run --rm backend npx prisma migrate deploy

# View logs (optional: specify service name as argument)
logs:
	docker compose logs $(SERVICE) -f

# Open shell in service container
sh:
	docker compose exec $(SERVICE) bash

# Show help
help:
	@echo "Available commands:"
	@echo "  make start     		– Start dev environment (Caddy + backend + DB)"
	@echo "  make stop      		– Stop all services"
	@echo "  make rebuild   		– Rebuild and restart"
	@echo "  make migrate   		– Apply pending Prisma migrations to the database"
	@echo "  make logs      		– Stream logs"
	@echo "  make logs SERVICE=x	– Stream logs for service 'x'"
	@echo "  make sh        		– Open shell in backend container (or 'make sh SERVICE=...')"
	@echo "  make help      		– Show this help"