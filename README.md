# Case Explorer

> **Case Harvester has relaunched at [caseharvester.org](https://caseharvester.org). The public site this software powered, [mdcaseexplorer.com](https://mdcaseexplorer.com), is retired and now redirects there. Access to the relaunched database can be requested at [caseharvester.org/request-access](https://caseharvester.org/request-access). This repository stays available as a reference.**

Case Explorer is a web interface and set of APIs for exploring data scraped from the [Maryland Judiciary Case Search](http://casesearch.courts.state.md.us/casesearch/inquiry-index.jsp) by [Case Harvester](https://github.com/dismantl/CaseHarvester). The aim is to make an intuitive, easy-to-use Excel-like interface for browsing and searching through MD case data. Case Explorer's frontend is built with React, while the backend API can be run locally with [Flask](https://flask.palletsprojects.com/) or deployed to [AWS Amplify](https://aws.amazon.com/amplify/). REST and GraphQL APIs are available.

![Screenshot](public/screenshot.png)

## Setup

### Dependencies

Case Explorer requires Node.js 16, Python3.9+, and GNU Make. A Docker compose file (`compose.yml`) is provided for the convenience of running the application for both development and production.

### Configuration

Create a `.env` file at the root of the repo with the information for connecting to the production and development case databases as well as the S3 bucket for case details. For example:

```
SQLALCHEMY_DATABASE_URI_PRODUCTION=postgresql://username:password@your-database-host/mjcs
CASE_DETAILS_BUCKET=your-case-details-bucket
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
