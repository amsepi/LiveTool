#!/bin/bash
yum update -y
yum install -y git docker

systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Switch to the ec2-user to run the build
su - ec2-user <<'EOF'

# Clone repo, build and run docker
git clone https://github.com/amsepi/LiveTool.git
cd LiveTool
docker build -t livetool .
docker run -d -p 8000:8000 livetool

EOF