variable "aws_vpc_cidr_block" {
  type = string
  default = "10.0.0.0/16"
  description = "Vpc cidr block"
}

variable "aws_subnet_cidr_block" {
    type = string
    default = "10.0.0.0/24"
    description = "Subnet cidr block"
}

variable "aws_subnet_availabality_zone" {
    type = string
    default = "us-east-1"
    description = "Subnet availability zone"
}

variable "aws_security_group_name" {
    type = string
    default = "MWA SG"
    description = "Security group name"
}

variable "aws_security_group_description" {
  type = string
  default = "mwa security group"
  description = "Security group description"
}