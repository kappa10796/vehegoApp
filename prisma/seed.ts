import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting DB seed...')

  // 1. Create Demo Users (Admin, Customer, Driver)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@himalayanride.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@himalayanride.com',
      password: 'adminpassword', // In production, these should be hashed
      role: 'ADMIN',
      phone: '9876543210'
    }
  })

  const customer = await prisma.user.upsert({
    where: { email: 'demo@himalayanride.com' },
    update: {},
    create: {
      name: 'Demo Tourist',
      email: 'demo@himalayanride.com',
      password: 'demopassword',
      role: 'USER',
      phone: '9876543211'
    }
  })

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@himalayanride.com' },
    update: {},
    create: {
      name: 'Raju Driver',
      email: 'driver@himalayanride.com',
      password: 'driverpassword',
      role: 'DRIVER',
      phone: '9876543212'
    }
  })

  // 2. Create Driver Profile
  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: 'WB-74-2015-1234567',
      experience: 5,
      status: 'APPROVED',
      availability: 'AVAILABLE'
    }
  })

  // 3. Create Vehicles
  const suv = await prisma.vehicle.upsert({
    where: { registration: 'WB 74 A 1234' },
    update: {},
    create: {
      driverId: driver.id,
      model: 'Innova Crysta',
      brand: 'Toyota',
      category: 'SUV',
      seatingCapacity: 6,
      acStatus: true,
      registration: 'WB 74 A 1234',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'
    }
  })

  const sedan = await prisma.vehicle.upsert({
    where: { registration: 'WB 74 B 5678' },
    update: {},
    create: {
      driverId: driver.id,
      model: 'Dzire',
      brand: 'Maruti Suzuki',
      category: 'SEDAN',
      seatingCapacity: 4,
      acStatus: true,
      registration: 'WB 74 B 5678',
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f200c8538741?auto=format&fit=crop&q=80&w=600'
    }
  })

  // 4. Create Routes
  const routes = [
    { origin: 'Siliguri', destination: 'Darjeeling', distance: 65, duration: 150, basePrice: 2500 },
    { origin: 'Bagdogra Airport', destination: 'Darjeeling', distance: 70, duration: 160, basePrice: 2700 },
    { origin: 'NJP Railway Station', destination: 'Darjeeling', distance: 72, duration: 165, basePrice: 2800 },
    { origin: 'Siliguri', destination: 'Kalimpong', distance: 68, duration: 150, basePrice: 2400 },
    { origin: 'Siliguri', destination: 'Gangtok', distance: 114, duration: 240, basePrice: 3500 },
    { origin: 'Darjeeling', destination: 'Gangtok', distance: 98, duration: 210, basePrice: 3200 },
    { origin: 'Siliguri', destination: 'Mirik', distance: 46, duration: 90, basePrice: 1800 },
    { origin: 'Siliguri', destination: 'Kurseong', distance: 48, duration: 90, basePrice: 1500 }
  ]

  for (const r of routes) {
    await prisma.route.upsert({
      where: { origin_destination: { origin: r.origin, destination: r.destination } },
      update: {},
      create: r
    })
  }

  // 5. Create Sightseeing Packages
  const packages = [
    {
      title: 'Darjeeling 7-Points Sightseeing',
      description: 'Cover major attractions in and around Darjeeling.',
      duration: 'Full Day',
      itinerary: 'Tiger Hill, Batasia Loop, Ghoom Monastery, HMI, Zoo, Ropeway, Peace Pagoda',
      price: 2500
    },
    {
      title: 'Mirik Lake & Pashupati Market Day Tour',
      description: 'Visit the serene Mirik Lake and shop at the Nepal border market.',
      duration: 'Full Day',
      itinerary: 'Mirik Lake, Bokar Monastery, Tea Gardens, Pashupati Market (Nepal Border)',
      price: 3000
    }
  ]

  for (const pkg of packages) {
    const existing = await prisma.sightseeingPackage.findFirst({ where: { title: pkg.title } })
    if (!existing) {
      await prisma.sightseeingPackage.create({ data: pkg })
    }
  }

  // 6. Create Pricing Rules
  const pricingRules = [
    { category: 'HATCHBACK', baseFare: 1200, perKmRate: 15, driverAllowance: 300, tollEstimate: 100, nightCharge: 200, platformFeePct: 5 },
    { category: 'SEDAN', baseFare: 1500, perKmRate: 18, driverAllowance: 400, tollEstimate: 150, nightCharge: 250, platformFeePct: 5 },
    { category: 'SUV', baseFare: 2200, perKmRate: 25, driverAllowance: 500, tollEstimate: 200, nightCharge: 300, platformFeePct: 5 },
    { category: 'PREMIUM_SUV', baseFare: 3000, perKmRate: 35, driverAllowance: 600, tollEstimate: 250, nightCharge: 400, platformFeePct: 5 },
    { category: 'TEMPO_TRAVELLER', baseFare: 4500, perKmRate: 50, driverAllowance: 800, tollEstimate: 400, nightCharge: 500, platformFeePct: 5 },
  ]

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: { category: rule.category },
      update: {},
      create: rule
    })
  }

  console.log('DB seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
