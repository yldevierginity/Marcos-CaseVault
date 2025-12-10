variable "project_name" {
  default = "amixtra-workshop"
}

variable "region" {
  default = "ap-southeast-1"
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = var.project_name
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
  alias  = "ap-southeast-1"
}


data "http" "myip" {
  url = "https://myip.wtf/text"
}

data "aws_caller_identity" "caller" {}