import prisma from "../../src/libs/prisma";

export default async function () {
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
