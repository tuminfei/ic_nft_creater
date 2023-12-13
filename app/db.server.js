import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

// Set BigInt Serialize
BigInt.prototype.toJSON = function() {       
  return this.toString()
}

export default prisma;
