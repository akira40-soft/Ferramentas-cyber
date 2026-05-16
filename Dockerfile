FROM node:18-bullseye

# Instala ferramentas de sistema e cibersegurança
RUN apt-get update && apt-get install -y \
    nmap \
    whois \
    dnsutils \
    curl \
    git \
    python3 \
    python3-pip \
    golang \
    iputils-ping \
    nikto \
    && rm -rf /var/lib/apt/lists/*

# Instala ferramentas via Python
RUN pip3 install sqlmap sherlock holehe shodan theHarvester

# Instala Nuclei via Go
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
ENV PATH=$PATH:/root/go/bin

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Porta padrão (ajustável no Railway)
EXPOSE 3000

CMD ["npm", "start"]
