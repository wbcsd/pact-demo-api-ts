resource "aws_ecs_task_definition" "api_task" {
  family                   = "pact-demo-endpoint-api-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "pact-demo-endpoint-api-container"
      image = "${aws_ecr_repository.my_api.repository_url}:latest"
      portMappings = [
        {
          containerPort = 3000,
          protocol      = "tcp"
        }
      ],
      environment = [
        {
          name  = "JWT_VERIFY_SECRET",
          value = var.jwt_verify_secret
        },
        {
          name  = "BASE_URL",
          value = "var.base_url"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log_group.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      },
      essential = true
    }
  ])
}
