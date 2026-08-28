FROM node:20-bookworm-slim

# The backend invokes these engines directly.  Installing them in the image
# makes Docker deployments compile documents instead of silently depending on
# a developer workstation's MiKTeX installation.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    texlive-latex-base texlive-latex-recommended texlive-latex-extra \
    texlive-fonts-recommended texlive-xetex texlive-luatex \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push && npm start"]
