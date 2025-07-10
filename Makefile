DOCKER_COMPOSE_FILE = docker-compose.yml

up:
	@echo "🚀 Lancement sans profils factices..."
	SEED_FAKE_PROFILES=false docker compose -f $(DOCKER_COMPOSE_FILE) --profile development up --build

up-fake: generate-fakephotos
	@echo "🤖 Lancement avec profils factices..."
	SEED_FAKE_PROFILES=true docker compose -f $(DOCKER_COMPOSE_FILE) --profile development up --build

down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

re:
	@$(MAKE) clean
	@$(MAKE) up

re-fake:
	@$(MAKE) clean
	@$(MAKE) up-fake

clean:
	docker compose -f $(DOCKER_COMPOSE_FILE) down --remove-orphans --volumes
	docker rm -f $$(docker ps -aq) 2>/dev/null || true
	docker rmi -f $$(docker images -q) 2>/dev/null || true
	docker volume prune -f
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

generate-fakephotos:
	@if [ -z "$$(ls -A ./backend/fakeprofilephotos 2>/dev/null)" ]; then \
		echo "📸 Téléchargement des photos factices..."; \
		chmod +x ./backend/seed/generatefakephotos.sh; \
		./backend/seed/generatefakephotos.sh; \
	else \
		echo "✅ Photos déjà présentes, pas de téléchargement."; \
	fi

# ------------------------------------
# AIDE
# ------------------------------------

help:
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  make up            - Lancer sans profils factices"
	@echo "  make up-fake       - Lancer avec profils factices"
	@echo "  make down          - Stopper le projet"
	@echo "  make re            - Clean + relancer sans fake"
	@echo "  make re-fake       - Clean + relancer avec fake"
	@echo "  make clean         - Supprime conteneurs, images, volumes"
	@echo ""
