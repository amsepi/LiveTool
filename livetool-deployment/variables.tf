variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "ap-south-1"
}

variable "key_name" {
  description = "The name of the EC2 key pair to use for SSH access."
  type        = string
  default     = "livetool-key"
}

variable "repo_url" {
  description = "The URL of the Git repository to be deployed."
  type        = string
  default     = "https://github.com/amsepi/LiveTool.git"
}
