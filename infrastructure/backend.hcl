bucket         = "casevault-terraform-state"
key            = "infrastructure/terraform.tfstate"
region         = "ap-southeast-1"
encrypt        = true
dynamodb_table = "casevault-terraform-locks"
