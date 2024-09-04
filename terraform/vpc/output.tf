output "security_group" {
    value = aws_security_group.mwa_sg.id
}

output "subnet" {
    value = aws_subnet.mwa_subnet.id
}