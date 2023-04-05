export type AmplifyDependentResourcesAttributes = {
  "api": {
    "caseexplorerapi": {
      "ApiName": "string",
      "RootUrl": "string"
    },
    "caseexplorergraphql": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "function": {
    "caseexplorerlambda": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "hosting": {
    "S3AndCloudFront": {
      "HostingBucketName": "string",
      "Region": "string",
      "S3BucketSecureURL": "string",
      "WebsiteURL": "string"
    }
  }
}