# Case Explorer

Case Explorer is a web interface and set of APIs for exploring data scraped from the [Maryland Judiciary Case Search](http://casesearch.courts.state.md.us/casesearch/inquiry-index.jsp) by [Case Harvester](https://github.com/dismantl/CaseHarvester). The aim is to make an intuitive, easy-to-use Excel-like interface for browsing and searching through MD case data. Case Explorer's frontend is built with React, while the backend can be run locally with [Flask](https://flask.palletsprojects.com/) or deployed to [AWS Amplify](https://aws.amazon.com/amplify/). REST and GraphQL APIs are available.

![Screenshot](public/screenshot.png)

## Setup

### Dependencies

Case Explorer requires Node.js 10x, Python3.9+, and GNU Make. It is also recommend to use Virtualenv with Python to set up a local development environment.

If you are running Debian, you can install dependencies with the following:

```
$ sudo apt-get update && sudo apt-get install -y build-essential libpq-dev nodejs python3 python3-pip virtualenv python3-virtualenv
```

### Configuration

Create a file at `server/app/.env` with the information for connecting to the production and development case databases. You can connect to Open Justice Baltimore's case databases using the following:

```
SQLALCHEMY_DATABASE_URI_PRODUCTION=postgresql://case_explorer:Wt1Wc3yny9XHhChCktVj@db.openjusticebaltimore.org/mjcs
SQLALCHEMY_DATABASE_URI_DEVELOPMENT=postgresql://case_explorer:qntsu004A&DCxQyqrV5Q@dev.db.openjusticebaltimore.org/mjcs
CASE_DETAILS_BUCKET=mjcs-case-details
```

To use the Search By BPD Officer feature, you'll also need to set `BPDWATCH_DATABASE_URI` to provide information for the BPD Watch database.

### Local Development

You can use the following commands to run a local version of Case Explorer for development or testing purposes:

1. Create and/or activate your Python virtual environment
1. `make install_dependencies`
1. `make generate_api_specs`
1. `make start_backend`
1. (in another terminal) `make start_frontend`

### Generate API specifications

API specs can be generated for both [GraphQL](https://graphql.org/) and [Swagger/OpenAPI](https://swagger.io/) using `make generate_api_specs`.

## Deployment

TODO

```
$ npm install -g @aws-amplify/cli
$ amplify configure
$ amplify init
$ make deploy
```

