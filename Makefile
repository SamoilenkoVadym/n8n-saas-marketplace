.PHONY: up down logs clean restart backend-shell db-migrate help

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

clean: ## Stop services and remove volumes
	docker-compose down -v

restart: ## Restart all services
	docker-compose restart

backend-shell: ## Open shell in backend container (requires backend to be running)
	cd backend && npm run dev

db-migrate: ## Run database migrations
	cd backend && npm run db:migrate