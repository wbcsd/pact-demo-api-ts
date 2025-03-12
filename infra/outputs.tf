output "api_gateway_url" {
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/prod/"
  description = "The URL of the API Gateway endpoint"
}
