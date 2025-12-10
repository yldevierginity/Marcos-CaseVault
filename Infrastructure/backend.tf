terraform {
  backend "s3" {
    bucket         = "casevault-terraform-state"
    key            = "casevault/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "casevault-terraform-locks"
  }
}
