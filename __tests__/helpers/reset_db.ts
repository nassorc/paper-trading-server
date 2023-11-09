import prisma from "../../src/libs/prisma";
import Redis from "../../src/libs/redis";

export default async function () {
  const redis = new Redis();
  await redis.flushall();
  await prisma.$transaction(async (prisma) => {
    await prisma.user.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.stockTransaction.deleteMany();
    await prisma.purchasedStock.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.walletHistory.deleteMany();
  });
}
