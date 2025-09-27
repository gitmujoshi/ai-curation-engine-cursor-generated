# ===============================================
# Compute Module Outputs
# ===============================================

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "auto_scaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.main.name
}

output "launch_template_id" {
  description = "ID of the Launch Template"
  value       = aws_launch_template.main.id
}

output "target_group_frontend_arn" {
  description = "ARN of the frontend target group"
  value       = aws_lb_target_group.frontend.arn
}

output "target_group_ollama_arn" {
  description = "ARN of the Ollama target group"
  value       = aws_lb_target_group.ollama.arn
}
