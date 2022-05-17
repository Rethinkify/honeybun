FROM gitpod/workspace-base:latest

# Install Dependencies
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
RUN sudo apt-get update && \
    sudo apt-get install -y \
    nodejs npm luajit && \
    sudo rm -rf /var/lib/apt/lists/*