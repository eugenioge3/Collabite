resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project_name}-aurora-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-aurora-subnet-group-${var.environment}"
  }
}

resource "aws_rds_cluster" "main" {
  cluster_identifier = "${var.project_name}-${var.environment}"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = "16.4"
  database_name      = "collabite"
  master_username    = var.master_username

  manage_master_user_password = true # AWS manages the password in Secrets Manager

  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [var.security_group_id]

  serverlessv2_scaling_configuration {
    min_capacity = var.min_acu
    max_capacity = var.max_acu
  }

  storage_encrypted       = true
  backup_retention_period = 7
  skip_final_snapshot     = var.environment == "dev" ? true : false
  deletion_protection     = var.environment == "dev" ? false : true

  tags = {
    Name = "${var.project_name}-aurora-${var.environment}"
  }
}

resource "aws_rds_cluster_instance" "main" {
  identifier         = "${var.project_name}-${var.environment}-1"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  tags = {
    Name = "${var.project_name}-aurora-instance-${var.environment}"
  }
}
