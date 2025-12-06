.PHONY: start stop rebuild logs help

# Start dev environment
start:
	docker compose up --build -d

# Stop services
stop:
	docker compose down

# Rebuild and restart
rebuild:
	docker compose down
	docker compose up --build -d

# View logs (optional: specify service name as argument)
logs:
	docker compose logs $(SERVICE) -f

# Show help
help:
	@echo "Available commands:"
	@echo "  make start     		– Start dev environment (Caddy + backend + DB)"
	@echo "  make stop      		– Stop all services"
	@echo "  make rebuild   		– Rebuild and restart"
	@echo "  make logs      		– Stream logs"
	@echo "  make logs SERVICE=x	– Stream logs for service 'x'"
	@echo "  make help      		– Show this help"