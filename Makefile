BACKEND_DIR=server
FRONTEND_DIR=src
LAMBDA_TARGET=amplify/backend/function/caseexplorerlambda/src
GRAPHQL_TARGET=amplify/backend/api/caseexplorergraphql
BACKEND_API_DEPS=$(addprefix $(BACKEND_DIR)/app/api/,__init__.py api_factory.py interface.py)
BACKEND_MODEL_DEPS=$(addprefix $(BACKEND_DIR)/models/,__init__.py case.py CC.py common.py DSCIVIL.py DSCR.py DSK8.py DSCP.py DSTRAF.py ODYCRIM.py ODYTRAF.py ODYCVCIT.py ODYCIVIL.py DV.py K.py MCCI.py PG.py MCCR.py PGV.py)
BACKEND_APP_DEPS=$(addprefix $(BACKEND_DIR)/app/,__init__.py commands.py graphql.py) $(BACKEND_API_DEPS)
BACKEND_DEPS=$(addprefix $(BACKEND_DIR)/,requirements/development.txt requirements/lambda.txt lambda.py schema_factory.py config.py officer.py service.py utils.py) $(BACKEND_MODEL_DEPS) $(BACKEND_APP_DEPS)

.PHONY: install_dependencies
install_dependencies: $(BACKEND_DIR)/requirements/development.txt
	pip install -r $(BACKEND_DIR)/requirements/development.txt
	pip install psycopg2
	npm install

.PHONY: copy_backend
copy_backend: $(BACKEND_APP_DEPS)
	rm -r $(LAMBDA_TARGET) || true
	mkdir -p $(LAMBDA_TARGET)/server
	pip install --target $(LAMBDA_TARGET) -r $(BACKEND_DIR)/requirements/lambda.txt
	cp -r $(BACKEND_DIR)/* $(LAMBDA_TARGET)/server/
	cp $(BACKEND_DIR)/.env $(LAMBDA_TARGET)/server/env
	cp -r $(BACKEND_DIR)/requirements/psycopg2-3.7 $(LAMBDA_TARGET)/psycopg2
	rm -r $(LAMBDA_TARGET)/server/app
	rm -r $(LAMBDA_TARGET)/server/requirements
	rm $(LAMBDA_TARGET)/server/schema.graphql
	rm $(LAMBDA_TARGET)/server/swagger.json
	find $(LAMBDA_TARGET) -name *.pyc -delete
	find $(LAMBDA_TARGET) -name __pycache__ -delete

.PHONY: start_backend
start_backend:
	FLASK_ENV=development FLASK_APP=$(BACKEND_DIR)/app flask run

.PHONY: start_frontend
start_frontend:
	@echo "export default 'development';" > $(FRONTEND_DIR)/config.js
	npm run start

.PHONY: deploy_backend
deploy_backend: copy_backend
	amplify push -y

.PHONY: deploy_frontend
deploy_frontend:
	@echo "export default 'production';" > $(FRONTEND_DIR)/config.js
	npm run build
	amplify publish -y

.PHONY: deploy
deploy: deploy_backend deploy_frontend

.PHONY: generate_api_specs
generate_api_specs: $(BACKEND_MODEL_DEPS)
	FLASK_APP=$(BACKEND_DIR)/app flask print-graphql-schema $(BACKEND_DIR)/schema.graphql
	sed -E -e 's/(DateTime|Date|Time)$$/AWS\1/g; /^scalar AWS(DateTime|Date|Time)$$/d' $(BACKEND_DIR)/schema.graphql > $(GRAPHQL_TARGET)/schema.graphql
	FLASK_APP=$(BACKEND_DIR)/app flask print-swagger-spec $(BACKEND_DIR)/swagger.json

.PHONY: sync_models
sync_models:
	cp ../CaseHarvester/src/mjcs/models/*.py server/models/