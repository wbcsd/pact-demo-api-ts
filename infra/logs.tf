resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name              = "/ecs/pact-demo-endpoint-api"
  retention_in_days = 7

  tags = {
    Name = "pact-demo-endpoint-api-log-group"
  }
}
