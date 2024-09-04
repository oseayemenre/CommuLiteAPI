resource "aws_vpc" "mwa_vpc" {
cidr_block = var.aws_vpc_cidr_block
enable_dns_hostnames = true
enable_dns_support = true

tags = {
  Name = "mwa_vpc"
}
}

resource "aws_subnet" "mwa_subnet" {
    vpc_id = aws_vpc.mwa_vpc.id
    cidr_block = var.aws_subnet_cidr_block
    availability_zone = var.aws_subnet_availabality_zone
    map_public_ip_on_launch = true

    tags = {
        Name = "mwa_subnet"
    }
}

resource "aws_internet_gateway" "mwa_igw" {
    vpc_id = aws_vpc.mwa_vpc.id

    tags = {
        Name = "mwa_igw"
    }
}

resource "aws_route_table" "mwa_rt" {
  vpc_id = aws_vpc.mwa_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.mwa_igw.id
  }

  tags = {
    Name = "mwa_rt"
  }
}

resource "aws_route_table_association" "mwa_rta" {
    subnet_id = aws_subnet.mwa_subnet.id
    route_table_id = aws_route_table.mwa_rt.id
}

resource "aws_security_group" "mwa_sg" {
    name = var.aws_security_group_name
    description = var.aws_security_group_description
    vpc_id = aws_vpc.mwa_vpc.id

    ingress {
        description = "HTTP"
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "HTTPS"
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "SSH"
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_eip" "mwa_eip" {
  domain = "vpc"

  tags = {
    Name = "mwa_eip"
  }
}

resource "aws_eip_association" "mwa_eipa" {
    allocation_id = aws_eip.mwa_eip.id
}