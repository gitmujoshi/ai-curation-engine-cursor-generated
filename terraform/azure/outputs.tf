# ===============================================
# AI Curation Engine - Azure Outputs
# ===============================================

# Application URLs
output "application_url" {
  description = "URL to access the AI Curation Engine"
  value = var.domain_name != "" ? (
    var.enable_https ? "https://${var.domain_name}" : "http://${var.domain_name}"
  ) : (
    var.enable_https ? 
      "https://${azurerm_public_ip.main.fqdn}" :
      "http://${azurerm_public_ip.main.ip_address}"
  )
}

output "content_tester_url" {
  description = "URL to access the Content Tester interface"
  value = var.domain_name != "" ? (
    var.enable_https ? "https://${var.domain_name}/content-test" : "http://${var.domain_name}/content-test"
  ) : (
    var.enable_https ? 
      "https://${azurerm_public_ip.main.fqdn}/content-test" :
      "http://${azurerm_public_ip.main.ip_address}/content-test"
  )
}

output "health_check_url" {
  description = "URL for health check endpoint"
  value = var.domain_name != "" ? (
    var.enable_https ? "https://${var.domain_name}/health" : "http://${var.domain_name}/health"
  ) : (
    var.enable_https ? 
      "https://${azurerm_public_ip.main.fqdn}/health" :
      "http://${azurerm_public_ip.main.ip_address}/health"
  )
}

output "api_base_url" {
  description = "Base URL for API endpoints"
  value = var.domain_name != "" ? (
    var.enable_https ? "https://${var.domain_name}/api" : "http://${var.domain_name}/api"
  ) : (
    var.enable_https ? 
      "https://${azurerm_public_ip.main.fqdn}/api" :
      "http://${azurerm_public_ip.main.ip_address}/api"
  )
}

# Infrastructure Details
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "virtual_network_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.main.name
}

output "public_ip_address" {
  description = "Public IP address"
  value       = azurerm_public_ip.main.ip_address
}

output "public_ip_fqdn" {
  description = "FQDN of the public IP"
  value       = azurerm_public_ip.main.fqdn
}

# Database Information
output "database_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = azurerm_postgresql_flexible_server.main.fqdn
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "database_username" {
  description = "Database username"
  value       = azurerm_postgresql_flexible_server.main.administrator_login
  sensitive   = true
}

# Storage Information
output "storage_account_name" {
  description = "Storage account name for models"
  value       = azurerm_storage_account.models.name
}

output "storage_container_name" {
  description = "Storage container name for models"
  value       = azurerm_storage_container.models.name
}

# Virtual Machine Scale Set
output "vmss_name" {
  description = "Name of the Virtual Machine Scale Set"
  value       = azurerm_linux_virtual_machine_scale_set.main.name
}

output "load_balancer_ip" {
  description = "Load balancer public IP"
  value       = azurerm_public_ip.main.ip_address
}

# Testing Commands
output "test_commands" {
  description = "Commands to test the deployment"
  value = {
    health_check = "curl -s ${var.domain_name != "" ? (var.enable_https ? "https://${var.domain_name}" : "http://${var.domain_name}") : (var.enable_https ? "https://${azurerm_public_ip.main.fqdn}" : "http://${azurerm_public_ip.main.ip_address}")}/health | jq"
    
    classify_content = "curl -X POST ${var.domain_name != "" ? (var.enable_https ? "https://${var.domain_name}" : "http://${var.domain_name}") : (var.enable_https ? "https://${azurerm_public_ip.main.fqdn}" : "http://${azurerm_public_ip.main.ip_address}")}/api/classify -H 'Content-Type: application/json' -d '{\"content\": \"Test educational content\", \"childId\": \"child_1\"}' | jq"
    
    switch_strategy = "curl -X POST ${var.domain_name != "" ? (var.enable_https ? "https://${var.domain_name}" : "http://${var.domain_name}") : (var.enable_https ? "https://${azurerm_public_ip.main.fqdn}" : "http://${azurerm_public_ip.main.ip_address}")}/api/strategy -H 'Content-Type: application/json' -d '{\"strategy\": \"multi_layer\"}' | jq"
  }
}

# Environment Information
output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    environment = var.environment
    region      = var.azure_region
    vm_size     = var.vm_size
    database_sku = var.db_sku_name
    
    next_steps = [
      "1. Access the Content Tester: ${var.domain_name != "" ? (var.enable_https ? "https://${var.domain_name}" : "http://${var.domain_name}") : (var.enable_https ? "https://${azurerm_public_ip.main.fqdn}" : "http://${azurerm_public_ip.main.ip_address}")}/content-test",
      "2. Check health status: ${var.domain_name != "" ? (var.enable_https ? "https://${var.domain_name}" : "http://${var.domain_name}") : (var.enable_https ? "https://${azurerm_public_ip.main.fqdn}" : "http://${azurerm_public_ip.main.ip_address}")}/health",
      "3. View Azure Monitor logs: az monitor activity-log list --resource-group ${azurerm_resource_group.main.name}",
      "4. SSH to instances: az vmss list-instance-connection-info --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_linux_virtual_machine_scale_set.main.name}",
      "5. Scale VM instances: az vmss scale --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_linux_virtual_machine_scale_set.main.name} --new-capacity <count>"
    ]
  }
}
