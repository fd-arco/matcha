DOCKER_COMPOSE_FILE = docker-compose.yml

clean-containers:
	docker rm -f $$(docker ps -aq) || true

clean-images:
	docker rmi -f $$(docker images -q) || true

clean-volumes:
	docker volume prune -f
	docker compose down --volumes
	docker volume rm $$(docker volume ls -q) || true

clean-all: clean-containers clean-images clean-volumes

re:
	@$(MAKE) clean-all
	docker compose -f $(DOCKER_COMPOSE_FILE) --profile production up --build

restart:
	docker compose -f $(DOCKER_COMPOSE_FILE) down
	docker compose -f $(DOCKER_COMPOSE_FILE) up --build

frontend-dev:
	docker compose -f $(DOCKER_COMPOSE_FILE) --profile development up

re-frontend-dev:
	@$(MAKE) clean-all
	docker compose -f $(DOCKER_COMPOSE_FILE) --profile development up --build

clean-frontend-dev:
	docker compose -f $(DOCKER_COMPOSE_FILE) down --remove-orphans frontend-dev

up:
	docker compose -f $(DOCKER_COMPOSE_FILE) --profile development up --build

down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

clean-project-volumes:
	docker compose -f $(DOCKER_COMPOSE_FILE) down --volumes

help:
	@echo "Commandes disponibles :"
	@echo "  make clean-containers      - Supprime tous les conteneurs Docker."
	@echo "  make clean-images          - Supprime toutes les images Docker."
	@echo "  make clean-volumes         - Supprime tous les volumes Docker non utilisés."
	@echo "  make clean-all             - Supprime conteneurs, images et volumes."
	@echo "  make re                    - Nettoie tout et relance le projet."
	@echo "  make restart               - Relance le projet sans nettoyer les images."
	@echo "  make frontend-dev          - Démarre uniquement le service frontend-dev (Hot Reload)."
	@echo "  make re-frontend-dev       - Reconstruit et relance uniquement frontend-dev."
	@echo "  make clean-frontend-dev    - Supprime uniquement le conteneur frontend-dev."
	@echo "  make up                    - Démarre le projet."
	@echo "  make down                  - Arrête le projet."
	@echo "  make clean-project-volumes - Supprime les volumes liés au projet uniquement."

