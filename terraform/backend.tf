terraform {
  backend "s3" {
       bucket = "mwa bucket"
       key = "/mwa-bucket"
       dynamodb_table = ""
  }
}