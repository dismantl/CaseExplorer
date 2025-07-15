# Case Explorer

Case Explorer is a web interface and set of APIs for exploring data scraped from the [Maryland Judiciary Case Search](http://casesearch.courts.state.md.us/casesearch/inquiry-index.jsp) by [Case Harvester](https://github.com/dismantl/CaseHarvester). The aim is to make an intuitive, easy-to-use Excel-like interface for browsing and searching through MD case data. Case Explorer's frontend is built with React, while the backend API can be run locally with [Flask](https://flask.palletsprojects.com/) or deployed to [AWS Amplify](https://aws.amazon.com/amplify/). REST and GraphQL APIs are available.

![Screenshot](public/screenshot.png)

## Setup

### Dependencies

Case Explorer requires Node.js 16, Python3.9+, and GNU Make. A Docker compose file (`compose.yml`) is provided for the convenience of running the application for both development and production.

### Configuration

Create a `.env` file at the root of the repo with the information for connecting to the production and development case databases as well as the S3 bucket for case details. You can connect to Open Justice Baltimore's case databases using the following:

```
SQLALCHEMY_DATABASE_URI_PRODUCTION=postgresql://case_explorer:Wt1Wc3yny9XHhChCktVj@mjcs-prod2.c7q0zmxhx4uo.us-east-1.rds.amazonaws.com/mjcs
CASE_DETAILS_BUCKET=mjcs-case-details
```

To use the Search By BPD Officer feature, you'll also need to set `BPDWATCH_DATABASE_URI` to provide information for the BPD Watch database.

### Local Development

You can use the following commands to run a local version of Case Explorer for development or testing purposes:

1. `make generate_api_specs`
1. `make start_dev`

### Generate API specifications

API specs can be generated for both [GraphQL](https://graphql.org/) and [Swagger/OpenAPI](https://swagger.io/) using `make generate_api_specs`.

## Deployment

### AWS Amplify

```
$ npm install -g @aws-amplify/cli
$ amplify configure
$ amplify init
$ make deploy
```

### Local production server

```
make start_prod
```
