# Configure the AWS provider
provider "aws" {
  region = var.aws_region
}

# Create a VPC (Virtual Private Cloud)
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "livetool-vpc"
  }
}

# Create a public subnet
resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags = {
    Name = "livetool-subnet"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "livetool-igw"
  }
}

# Create a route table
resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "livetool-rt"
  }
}

# Associate the route table with the subnet
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

# Create a security group to allow HTTP and SSH traffic
resource "aws_security_group" "web" {
  name        = "livetool-sg"
  description = "Allow HTTP and SSH inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "livetool-sg"
  }
}

# Find the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Create the EC2 instance
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.micro"
  key_name      = var.key_name
  subnet_id     = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = file("${path.module}/setup.sh")

  tags = {
    Name = "livetool-instance"
  }
}
