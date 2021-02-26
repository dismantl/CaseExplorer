BACKEND_DIR=server
FRONTEND_DIR=src
LAMBDA_TARGET=amplify/backend/function/caseexplorerlambda/src
GRAPHQL_TARGET=amplify/backend/api/caseexplorergraphql
BACKEND_API_DEPS=$(addprefix $(BACKEND_DIR)/app/api/,__init__.py cases.py cc.py dscivil.py dscr.py dsk8.py interface.py odycrim.py odytraf.py schema_factory.py)
BACKEND_MODEL_DEPS=$(addprefix $(BACKEND_DIR)/app/base_models/,__init__.py case.py CC.py common.py DSCIVIL.py DSCR.py DSK8.py ODYCRIM.py ODYTRAF.py)
BACKEND_APP_DEPS=$(addprefix $(BACKEND_DIR)/app/,__init__.py commands.py config.py graphql.py models.py service.py utils.py)
BACKEND_DEPS=$(addprefix $(BACKEND_DIR)/,requirements.txt lambda.py) $(BACKEND_API_DEPS) $(BACKEND_MODEL_DEPS) $(BACKEND_APP_DEPS)

install_dependencies: $(BACKEND_DIR)/requirements.txt
	pip3 install -r $(BACKEND_DIR)/requirements.txt
	pip3 install psycopg2

copy_backend: $(BACKEND_DEPS)
	rm -r $(LAMBDA_TARGET) || true
	mkdir -p $(LAMBDA_TARGET)
	pip3 install --target $(LAMBDA_TARGET)/.requirements -r $(BACKEND_DIR)/requirements.txt
	cp -r $(BACKEND_DIR)/{app,lambda.py} $(LAMBDA_TARGET)/
	cp -r $(BACKEND_DIR)/psycopg2-3.7 $(LAMBDA_TARGET)/psycopg2
	find $(LAMBDA_TARGET) -name *.pyc -delete
	find $(LAMBDA_TARGET) -name __pycache__ -delete

print_schema: $(BACKEND_DEPS)
	FLASK_APP=$(BACKEND_DIR)/app flask print-schema
	cp $(BACKEND_DIR)/schema.graphql $(GRAPHQL_TARGET)/
	sed -i '' -E -e 's/(DateTime|Date|Time)$$/AWS\1/g; /^scalar AWS(DateTime|Date|Time)$$/d' $(GRAPHQL_TARGET)/schema.graphql

build_backend: copy_backend print_schema

build_frontend:
	@echo "export default 'production';" > $(FRONTEND_DIR)/config.js
	npm run build

build: build_backend build_frontend

start_backend:
	FLASK_ENV=development FLASK_APP=$(BACKEND_DIR)/app flask run

start_prod_backend:
	FLASK_ENV=production FLASK_APP=$(BACKEND_DIR)/app flask run

start_frontend:
	@echo "export default 'development';" > $(FRONTEND_DIR)/config.js
	npm run start

deploy_backend: build_backend
	amplify push -y

deploy_frontend:
	@echo "export default 'production';" > $(FRONTEND_DIR)/config.js
	amplify publish -y

deploy: deploy_backend deploy_frontend

generate_api_docs:
	FLASK_APP=$(BACKEND_DIR)/app flask print-swagger-spec