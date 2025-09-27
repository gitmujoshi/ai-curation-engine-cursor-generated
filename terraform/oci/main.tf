# ===============================================
# AI Curation Engine - OCI Terraform Configuration
# ===============================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure OCI Provider
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.oci_region
}

# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Get availability domains
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

# Get the latest Oracle Linux image
data "oci_core_images" "ol_images" {
  compartment_id   = var.compartment_id
  operating_system = "Oracle Linux"
  sort_by          = "TIMECREATED"
  sort_order       = "DESC"
  
  filter {
    name   = "display_name"
    values = ["Oracle-Linux-8.*-aarch64-.*"]
    regex  = true
  }
}

# VCN (Virtual Cloud Network)
resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_id
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "${var.project_name}-${var.environment}-vcn"
  dns_label      = replace("${var.project_name}${var.environment}", "-", "")

  freeform_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = var.owner
  }
}

# Internet Gateway
resource "oci_core_internet_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-igw"
  enabled        = true

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# NAT Gateway
resource "oci_core_nat_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-nat"

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Service Gateway
resource "oci_core_service_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-sgw"

  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

# Route Tables
resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.main.id
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

resource "oci_core_route_table" "private" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-private-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.main.id
  }

  route_rules {
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.main.id
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Security Lists
resource "oci_core_security_list" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-public-sl"

  # Ingress rules
  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = var.vcn_cidr
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Egress rules
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

resource "oci_core_security_list" "private" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-private-sl"

  # Ingress rules
  ingress_security_rules {
    protocol = "6" # TCP
    source   = var.vcn_cidr
    tcp_options {
      min = 5001
      max = 5001
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = var.vcn_cidr
    tcp_options {
      min = 11434
      max = 11434
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = var.vcn_cidr
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Egress rules
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Public Subnet
resource "oci_core_subnet" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  cidr_block     = cidrsubnet(var.vcn_cidr, 8, 1)
  display_name   = "${var.project_name}-${var.environment}-public-subnet"
  dns_label      = "public"

  availability_domain        = data.oci_identity_availability_domains.ads.availability_domains[0].name
  prohibit_public_ip_on_vnic = false
  route_table_id             = oci_core_route_table.public.id
  security_list_ids          = [oci_core_security_list.public.id]

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Private Subnet
resource "oci_core_subnet" "private" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  cidr_block     = cidrsubnet(var.vcn_cidr, 8, 2)
  display_name   = "${var.project_name}-${var.environment}-private-subnet"
  dns_label      = "private"

  availability_domain        = data.oci_identity_availability_domains.ads.availability_domains[0].name
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private.id
  security_list_ids          = [oci_core_security_list.private.id]

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Object Storage Bucket for models
resource "oci_objectstorage_bucket" "models" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}-${var.environment}-models"
  namespace      = data.oci_objectstorage_namespace.ns.namespace

  freeform_tags = oci_core_vcn.main.freeform_tags
}

data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.compartment_id
}

# MySQL Database System
resource "oci_mysql_mysql_db_system" "main" {
  count               = var.use_mysql ? 1 : 0
  compartment_id      = var.compartment_id
  shape_name          = var.mysql_shape
  subnet_id           = oci_core_subnet.private.id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  
  display_name        = "${var.project_name}-${var.environment}-mysql"
  description         = "MySQL database for AI Curation Engine"
  
  admin_username      = "curation_admin"
  admin_password      = random_password.db_password.result
  
  data_storage_size_in_gb = var.mysql_storage_gb
  
  backup_policy {
    is_enabled        = var.environment == "production"
    retention_in_days = var.backup_retention_days
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Load Balancer
resource "oci_load_balancer_load_balancer" "main" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-lb"
  shape          = var.load_balancer_shape
  subnet_ids     = [oci_core_subnet.public.id]

  dynamic "shape_details" {
    for_each = var.load_balancer_shape == "flexible" ? [1] : []
    content {
      minimum_bandwidth_in_mbps = var.load_balancer_min_bandwidth
      maximum_bandwidth_in_mbps = var.load_balancer_max_bandwidth
    }
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Load Balancer Backend Set
resource "oci_load_balancer_backend_set" "main" {
  load_balancer_id = oci_load_balancer_load_balancer.main.id
  name             = "backend-set"
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol            = "HTTP"
    port                = 5001
    url_path            = "/health"
    return_code         = 200
    interval_ms         = 30000
    timeout_in_millis   = 5000
    retries             = 3
  }
}

# Load Balancer Listener
resource "oci_load_balancer_listener" "main" {
  load_balancer_id         = oci_load_balancer_load_balancer.main.id
  name                     = "http-listener"
  default_backend_set_name = oci_load_balancer_backend_set.main.name
  port                     = 80
  protocol                 = "HTTP"
}

# Instance Configuration for Instance Pool
resource "oci_core_instance_configuration" "main" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-instance-config"

  instance_details {
    instance_type = "compute"

    launch_details {
      compartment_id = var.compartment_id
      shape          = var.instance_shape

      dynamic "shape_config" {
        for_each = length(regexall("Flex", var.instance_shape)) > 0 ? [1] : []
        content {
          memory_in_gbs = var.instance_memory_gb
          ocpus         = var.instance_ocpus
        }
      }

      source_details {
        source_type = "image"
        image_id    = data.oci_core_images.ol_images.images[0].id
      }

      create_vnic_details {
        subnet_id        = oci_core_subnet.private.id
        assign_public_ip = false
      }

      metadata = {
        ssh_authorized_keys = var.ssh_public_key
        user_data = base64encode(templatefile("${path.module}/user_data.sh", {
          project_name    = var.project_name
          environment     = var.environment
          db_endpoint     = var.use_mysql ? oci_mysql_mysql_db_system.main[0].endpoints[0].hostname : "localhost"
          db_name         = "curation_engine"
          db_username     = var.use_mysql ? oci_mysql_mysql_db_system.main[0].admin_username : "curation_admin"
          db_password     = random_password.db_password.result
          bucket_name     = oci_objectstorage_bucket.models.name
          bucket_namespace = data.oci_objectstorage_namespace.ns.namespace
        }))
      }
    }
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}

# Instance Pool
resource "oci_core_instance_pool" "main" {
  compartment_id            = var.compartment_id
  instance_configuration_id = oci_core_instance_configuration.main.id
  display_name              = "${var.project_name}-${var.environment}-instance-pool"
  size                      = var.instance_pool_size

  placement_configurations {
    availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
    primary_subnet_id   = oci_core_subnet.private.id
  }

  load_balancers {
    load_balancer_id = oci_load_balancer_load_balancer.main.id
    backend_set_name = oci_load_balancer_backend_set.main.name
    port             = 5001
    vnic_selection   = "PrimaryVnic"
  }

  freeform_tags = oci_core_vcn.main.freeform_tags
}
