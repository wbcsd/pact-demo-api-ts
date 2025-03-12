terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }

  backend "s3" {
    bucket         = "pact-demo-endpoint-terraform-state-bucket"
    key            = "envs/dev/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "pact-demo-endpoint-terraform-lock-table"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}
