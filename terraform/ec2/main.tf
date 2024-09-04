resource "aws_instance" "mwa_ec2" {
    instance_type = "t2.micro"
    ami = ""
    subnet_id = var.subnet_id
    vpc_security_group_ids = var.security_group_id

    tags = {
        Name = "mwa_ec2"
    }
}