resource "aws_s3_bucket" "mwa_s3" {
  bucket = "Mwa-bucket"

  tags = {
    Name = "mwa_s3"
  }
}