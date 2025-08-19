variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "jwt_verify_secret" {
  description = "Secret used by the Node.js API for JWT verification"
  type        = string
  sensitive   = true
}

variable "base_url" {
  description = "Public base URL on which the service is running"
  type        = string
  sensitive   = true
}
