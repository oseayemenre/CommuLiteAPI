variable "subnet_id" {
    type = string
    description = "Subnet id"
}

variable "security_group_id" {
    type = list(string)
    description = "Security group id"
}