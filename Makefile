BACKEND_DIR=server
FRONTEND_DIR=src
LAMBDA_TARGET=amplify/backend/function/caseexplorerlambda/src
GRAPHQL_TARGET=amplify/backend/api/caseexplorergraphql
BACKEND_API_DEPS=$(addprefix $(BACKEND_DIR)/app/api/,__init__.py api_factory.py interface.py schema_factory.py)
BACKEND_MODEL_DEPS=$(addprefix $(BACKEND_DIR)/app/models/,__init__.py case.py CC.py common.py DSCIVIL.py DSCR.py DSK8.py DSCP.py DSTRAF.py ODYCRIM.py ODYTRAF.py ODYCVCIT.py ODYCIVIL.py DV.py K.py MCCI.py PG.py MCCR.py PGV.py)
BACKEND_APP_DEPS=$(addprefix $(BACKEND_DIR)/app/,__init__.py commands.py config.py graphql.py officer.py service.py utils.py)
BACKEND_DEPS=$(addprefix $(BACKEND_DIR)/,requirements.txt lambda.py) $(BACKEND_API_DEPS) $(BACKEND_MODEL_DEPS) $(BACKEND_APP_DEPS)
STACK_PREFIX=caseexplorer
AWS_REGION=us-east-1
SECRETS_FILE=secrets.json
CASEHARVESTER_STATIC_STACK=caseharvester-stack-static-prod
DOCKER_REPO_NAME=caseexplorer

.create-stack-bucket:
	aws s3api create-bucket --bucket $(STACK_PREFIX)-stack --region $(AWS_REGION)
	touch $@

.deploy-stack: .create-stack-bucket cloudformation.yml $(SECRETS_FILE)
	aws cloudformation package --template-file cloudformation.yml \
		--output-template-file cloudformation-output.yml \
		--s3-bucket $(STACK_PREFIX)-stack
	aws cloudformation deploy --template-file cloudformation-output.yml \
		--stack-name $(STACK_PREFIX)-stack \
		--capabilities CAPABILITY_IAM \
		--capabilities CAPABILITY_NAMED_IAM \
		--parameter-overrides \
			StaticStackName=$(CASEHARVESTER_STATIC_STACK) \
			DockerRepoName=$(DOCKER_REPO_NAME) \
			AWSRegion=$(AWS_REGION) \
			$(shell jq -r '. as $$x|keys[]|. + "=" + $$x[.]' $(SECRETS_FILE))
	touch $@

.push-docker-image: .deploy-stack Dockerfile $(BACKEND_DEPS)
	$(shell aws ecr get-login --region $(AWS_REGION) --no-include-email)
	$(eval AWS_ACCOUNT_ID = $(shell aws sts get-caller-identity | grep Account | cut -d'"' -f4))
	find $(BACKEND_DIR) -name *.pyc -delete
	find $(BACKEND_DIR) -name __pycache__ -delete
	docker build -t $(DOCKER_REPO_NAME) .
	$(eval REPO_URL = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(DOCKER_REPO_NAME))
	docker tag $(DOCKER_REPO_NAME):latest $(REPO_URL):latest
	docker push $(REPO_URL)
	touch $@

.PHONY: docker_image
docker_image: .push-docker-image

.PHONY: deploy_stack
deploy_stack: .deploy-stack

.PHONY: install_dependencies
install_dependencies: $(BACKEND_DIR)/requirements.txt
	pip install -r $(BACKEND_DIR)/requirements.txt
	pip install psycopg2
	npm install

.PHONY: copy_backend
copy_backend: $(BACKEND_DEPS)
	rm -r $(LAMBDA_TARGET) || true
	mkdir -p $(LAMBDA_TARGET)
	pip install --target $(LAMBDA_TARGET) -r $(BACKEND_DIR)/requirements.txt
	cp -r $(BACKEND_DIR)/app $(LAMBDA_TARGET)/
	cp $(BACKEND_DIR)/app/.env $(LAMBDA_TARGET)/app/env
	cp $(BACKEND_DIR)/lambda.py $(LAMBDA_TARGET)/
	cp -r $(BACKEND_DIR)/psycopg2-3.7 $(LAMBDA_TARGET)/psycopg2
	find $(LAMBDA_TARGET) -name *.pyc -delete
	find $(LAMBDA_TARGET) -name __pycache__ -delete

.PHONY: start_backend
start_backend:
	FLASK_ENV=development FLASK_APP=$(BACKEND_DIR)/app flask run

.PHONY: start_prod_backend
start_prod_backend:
	FLASK_ENV=production FLASK_APP=$(BACKEND_DIR)/app flask run

.PHONY: start_frontend
start_frontend:
	@echo "export default 'development';" > $(FRONTEND_DIR)/config.js
	npm run start

.PHONY: deploy_backend
deploy_backend: copy_backend .push-docker-image
	amplify push -y

.PHONY: deploy_frontend
deploy_frontend:
	@echo "export default 'production';" > $(FRONTEND_DIR)/config.js
	npm run build
	amplify publish -y

.PHONY: deploy
deploy: deploy_backend deploy_frontend

.PHONY: generate_api_specs
generate_api_specs: $(BACKEND_DEPS)
	FLASK_APP=$(BACKEND_DIR)/app flask print-graphql-schema $(BACKEND_DIR)/schema.graphql
	sed -E -e 's/(DateTime|Date|Time)$$/AWS\1/g; /^scalar AWS(DateTime|Date|Time)$$/d' $(BACKEND_DIR)/schema.graphql > $(GRAPHQL_TARGET)/schema.graphql
	FLASK_APP=$(BACKEND_DIR)/app flask print-swagger-spec $(BACKEND_DIR)/swagger.json

.PHONY: sync_models
sync_models:
	cp ../CaseHarvester/src/mjcs/models/*.py server/app/models/