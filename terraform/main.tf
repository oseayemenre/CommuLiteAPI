module "s3" {
    source = "./s3"
}

module vpc {
    source = "./vpc"
}

module ec2 {
    source = "./ec2"
    subnet_id = module.vpc.subnet
    security_group_id = module.vpc.security_group
}