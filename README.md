# Introduction

This project is based on https://github.com/LuisPalacios/tvhstar.git (very good job) and it's simplified to deploy as a service in AWS Lambda to generated every day an EPG (XMLTV format) with information of the public and payment channels from Spain.

# Use

It's used [Serverless Framework](https://serverless.com) to generate, deploy and update function in AWS Lambda.

## Prerequisites

[Serverless Quick Start Pre-requisites](https://serverless.com/framework/docs/providers/aws/guide/quick-start)

```npm install -g serverless```

It's necessary to have previously a S3 bucket to save XMLTV file.

## Main commands

### Install service

```serverless deploy -v```

### Update generateEPG function

```serverless deploy function -f generateEPG```

### Invoke generateEPG function and view logs

```serverless invoke -f generateEPG -l```

### View logs

```serverless logs -f generateEPG    -t```

### Remove all resources create for the service in AWS

```serverless remove```

## Configure

Main configuration values tion (timeout, memory, schedule, etc.) can be adjusted in ```serverless.yml``` in the root of the project.

# Known bugs

It's necessary to add manually the policy to the function's created default role to access to S3 bucket.