# ===============================================
# AI Curation Engine - OCI Outputs
# ===============================================

# Application URLs
output "application_url" {
  description = "URL to access the AI Curation Engine"
  value = var.domain_name != "" ? (
    "http://${var.domain_name}"
  ) : (
    "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}"
  )
}

output "content_tester_url" {
  description = "URL to access the Content Tester interface"
  value = var.domain_name != "" ? (
    "http://${var.domain_name}/content-test"
  ) : (
    "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}/content-test"
  )
}

output "health_check_url" {
  description = "URL for health check endpoint"
  value = var.domain_name != "" ? (
    "http://${var.domain_name}/health"
  ) : (
    "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}/health"
  )
}

output "api_base_url" {
  description = "Base URL for API endpoints"
  value = var.domain_name != "" ? (
    "http://${var.domain_name}/api"
  ) : (
    "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}/api"
  )
}

# Infrastructure Details
output "vcn_id" {
  description = "OCID of the VCN"
  value       = oci_core_vcn.main.id
}

output "public_subnet_id" {
  description = "OCID of the public subnet"
  value       = oci_core_subnet.public.id
}

output "private_subnet_id" {
  description = "OCID of the private subnet"
  value       = oci_core_subnet.private.id
}

output "load_balancer_ip" {
  description = "IP address of the Load Balancer"
  value       = oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address
}

# Database Information
output "database_endpoint" {
  description = "MySQL database endpoint"
  value       = var.use_mysql ? oci_mysql_mysql_db_system.main[0].endpoints[0].hostname : "Local database (not using OCI MySQL)"
  sensitive   = true
}

output "database_port" {
  description = "MySQL database port"
  value       = var.use_mysql ? oci_mysql_mysql_db_system.main[0].endpoints[0].port : 3306
}

output "database_username" {
  description = "Database username"
  value       = var.use_mysql ? oci_mysql_mysql_db_system.main[0].admin_username : "curation_admin"
  sensitive   = true
}

# Storage Information
output "object_storage_bucket" {
  description = "Object Storage bucket name for models"
  value       = oci_objectstorage_bucket.models.name
}

output "object_storage_namespace" {
  description = "Object Storage namespace"
  value       = data.oci_objectstorage_namespace.ns.namespace
}

# Compute Information
output "instance_pool_id" {
  description = "OCID of the Instance Pool"
  value       = oci_core_instance_pool.main.id
}

output "instance_configuration_id" {
  description = "OCID of the Instance Configuration"
  value       = oci_core_instance_configuration.main.id
}

output "load_balancer_id" {
  description = "OCID of the Load Balancer"
  value       = oci_load_balancer_load_balancer.main.id
}

# Testing Commands
output "test_commands" {
  description = "Commands to test the deployment"
  value = {
    health_check = "curl -s ${var.domain_name != "" ? "http://${var.domain_name}" : "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}"}/health | jq"
    
    classify_content = "curl -X POST ${var.domain_name != "" ? "http://${var.domain_name}" : "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}"}/api/classify -H 'Content-Type: application/json' -d '{\"content\": \"Test educational content\", \"childId\": \"child_1\"}' | jq"
    
    switch_strategy = "curl -X POST ${var.domain_name != "" ? "http://${var.domain_name}" : "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}"}/api/strategy -H 'Content-Type: application/json' -d '{\"strategy\": \"multi_layer\"}' | jq"
  }
}

# Environment Information
output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    environment = var.environment
    region      = var.oci_region
    instance_shape = var.instance_shape
    database_shape = var.use_mysql ? var.mysql_shape : "Local database"
    
    next_steps = [
      "1. Access the Content Tester: ${var.domain_name != "" ? "http://${var.domain_name}" : "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}"}/content-test",
      "2. Check health status: ${var.domain_name != "" ? "http://${var.domain_name}" : "http://${oci_load_balancer_load_balancer.main.ip_address_details[0].ip_address}"}/health",
      "3. View OCI Console: https://cloud.oracle.com/compute/instances",
      "4. Check logs: oci logging log list --compartment-id ${var.compartment_id}",
      "5. Scale instances: oci compute-management instance-pool update --instance-pool-id ${oci_core_instance_pool.main.id} --size <new-size>"
    ]
  }
}
