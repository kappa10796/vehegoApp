import { PrismaClient } from '@prisma/client'

const getDbUrl = () => {
  let url = process.env.DATABASE_URL || ''
  if (!url) {
    return 'mysql://root:password@127.0.0.1:3306/vehego_db'
  }
  // Automatically fix missing mysql:// prefix if user entered raw credentials in Hostinger UI
  if (!url.startsWith('mysql://') && !url.startsWith('postgresql://') && !url.startsWith('file:') && !url.startsWith('sqlite:')) {
    url = `mysql://${url}`
  }
  return url
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
