FROM node:18-alpine3.18

RUN apk add ca-certificates fuse3 sqlite
EXPOSE 3000
WORKDIR /app
COPY . .

RUN npm install -g npm@10.5.0
RUN npm install
RUN npm run build

# You'll probably want to remove this in production, it's here to make it easier to test things!
# RUN rm -f prisma/dev.sqlite

CMD ["npm", "run", "docker-start"]
