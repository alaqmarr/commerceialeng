import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed for Commercial Engineering Associates...')

  // Enforce WAL mode before inserting seed data
  await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;')
  await prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;')
  await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;')

  // -------------------------------------------------------------
  // 1. Seed Dynamic Settings (Contact, Social, SMTP)
  // -------------------------------------------------------------
  console.log('⚙️  Seeding System Settings...')
  const settingsData = [
    {
      key: 'COMPANY_NAME',
      value: 'Commercial Engineering Associates',
      description: 'Official registered trading name',
    },
    {
      key: 'COMPANY_TAGLINE',
      value: 'Engineered Precision in Industrial Tapes, Sealants & Adhesives',
      description: 'Company slogan used across headers and hero sections',
    },
    {
      key: 'COMPANY_PHONE',
      value: '+91 98765 43210',
      description: 'Primary customer service and inquiry telephone',
    },
    {
      key: 'WHATSAPP_NUMBER',
      value: '+919876543210',
      description: 'WhatsApp business number for quick RFQ routing (digits with country code)',
    },
    {
      key: 'SALES_EMAIL',
      value: 'sales@commercialeng.com',
      description: 'Primary sales inbox where customer enquiries are delivered',
    },
    {
      key: 'COMPANY_ADDRESS',
      value: 'Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020',
      description: 'Physical registered office and warehouse dispatch address',
    },
    {
      key: 'SMTP_HOST',
      value: 'smtp.gmail.com',
      description: 'Nodemailer outgoing SMTP host',
    },
    {
      key: 'SMTP_PORT',
      value: '587',
      description: 'Nodemailer SMTP port (usually 587 for TLS or 465 for SSL)',
    },
    {
      key: 'SMTP_USER',
      value: 'sales@commercialeng.com',
      description: 'SMTP authentication username',
    },
    {
      key: 'SMTP_PASS',
      value: 'app_password_placeholder',
      description: 'SMTP authentication app password',
    },
    {
      key: 'SMTP_FROM',
      value: 'Commercial Engineering Associates <sales@commercialeng.com>',
      description: 'Default sender address for automated dispatch notifications',
    },
  ]

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: s,
    })
  }

  // -------------------------------------------------------------
  // 2. Seed Hero Carousel Slides
  // -------------------------------------------------------------
  console.log('🖼️  Seeding Homepage Hero Slides...')
  const heroSlides = [
    {
      title: 'High-Performance Industrial Tapes & Bonding Films',
      subtitle: 'Engineered VHB acrylic foams, thermal dissipation tapes, and precision masking solutions for demanding industrial manufacturing.',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80',
      linkUrl: '/products',
      order: 1,
      active: true,
    },
    {
      title: 'Advanced Sealants & High-Temperature Silicones',
      subtitle: 'Neutral-cure RTV sealants, polyurethane facade solutions, and EV battery module encapsulation systems built for extreme durability.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80',
      linkUrl: '/categories',
      order: 2,
      active: true,
    },
    {
      title: 'Structural Adhesives & Fastener Replacement',
      subtitle: 'Two-part toughened epoxies, anaerobic threadlockers, and cyanoacrylates providing superior shear and peel resistance.',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1920&q=80',
      linkUrl: '/use-cases',
      order: 3,
      active: true,
    },
  ]

  // Clear existing hero slides to ensure clean ordering on re-seed
  await prisma.heroImage.deleteMany()
  for (const slide of heroSlides) {
    await prisma.heroImage.create({ data: slide })
  }

  // -------------------------------------------------------------
  // 3. Seed Product Categories
  // -------------------------------------------------------------
  console.log('📁 Seeding Product Categories...')
  const categoriesData = [
    {
      name: 'Industrial Adhesive Tapes',
      slug: 'adhesive-tapes',
      description: 'High-tack acrylic foam tapes, heavy-duty double-sided bonding films, and technical masking tapes designed for structural and electronic manufacturing.',
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Engineered Sealants & Silicones',
      slug: 'sealants-silicones',
      description: 'RTV neutral-cure silicones, high-temperature gasket sealants, and weather-resistant elastomeric joint sealants for industrial assemblies.',
      imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Structural Adhesives & Epoxies',
      slug: 'structural-adhesives',
      description: 'Two-component epoxy adhesives, anaerobic threadlockers, and fast-curing cyanoacrylates providing superior shear and peel resistance.',
      imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Thermal Management & Insulation',
      slug: 'thermal-insulation',
      description: 'Thermally conductive interface tapes, polyimide Kapton films, and electrical potting compounds engineered for high-voltage and EV battery packs.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
  ]

  const categoriesMap = new Map<string, string>()
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    })
    categoriesMap.set(cat.slug, record.id)
  }

  // -------------------------------------------------------------
  // 4. Seed Industrial Use Cases
  // -------------------------------------------------------------
  console.log('🏭 Seeding Industrial Use Cases...')
  const useCasesData = [
    {
      title: 'Automotive & EV Battery Systems',
      slug: 'automotive-ev',
      description: 'Critical thermal gap pad bonding, cell-to-pack adhesive sealing, and vibration damping under extreme engine and battery enclosure conditions.',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Architectural Facades & Glazing',
      slug: 'facades-glazing',
      description: 'Structural silicone glazing, curtain wall sealing, and heavy-duty weatherproofing tapes meeting rigorous international building codes.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Electronics & PCB Manufacturing',
      slug: 'electronics-pcb',
      description: 'Precision die-cut insulating tapes, component staking epoxies, and conformal potting sealants safeguarding microelectronics against moisture and heat.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Heavy Industrial MRO & Plant Maintenance',
      slug: 'industrial-mro',
      description: 'High-strength threadlocking, flange gasketing, pipe thread sealing, and rapid emergency bonding for manufacturing plants and mechanical equipment.',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    },
  ]

  const useCasesMap = new Map<string, string>()
  for (const uc of useCasesData) {
    const record = await prisma.useCase.upsert({
      where: { slug: uc.slug },
      create: uc,
      update: uc,
    })
    useCasesMap.set(uc.slug, record.id)
  }

  // -------------------------------------------------------------
  // 5. Seed Flagship Products
  // -------------------------------------------------------------
  console.log('📦 Seeding Products & Specifications...')
  const productsData = [
    {
      name: 'CEA VHB-5000 Structural Acrylic Foam Tape',
      slug: 'cea-vhb-5000-acrylic-foam-tape',
      categorySlug: 'adhesive-tapes',
      useCaseSlugs: ['automotive-ev', 'facades-glazing'],
      shortDesc: 'Ultra-high bond acrylic foam tape replacing rivets, screws, and welds in structural metal-to-metal and composite assemblies.',
      description: 'CEA VHB-5000 is an engineered double-sided acrylic foam tape designed for structural bonding across dissimilar substrates including metals, powder-coated finishes, and glass. Features viscoelastic properties that absorb dynamic impact, dampen vibration, and provide permanent environmental sealing against moisture and UV degradation.',
      specifications: JSON.stringify({
        'Backing Material': 'Closed-cell Acrylic Foam',
        'Tape Thickness': '1.1 mm (45 mil)',
        'Peel Adhesion (Stainless Steel)': '35 N/25mm',
        'Dynamic Tensile Strength': '620 kPa',
        'Continuous Temperature Limit': '120°C (248°F)',
        'Intermittent Temperature Peak': '180°C (356°F)',
        'Color': 'Industrial Dark Gray',
        'Standard Roll Length': '33 meters (36 yards)',
      }),
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'CEA SIL-850 High-Temp RTV Silicone Gasket Sealant',
      slug: 'cea-sil-850-rtv-silicone-sealant',
      categorySlug: 'sealants-silicones',
      useCaseSlugs: ['automotive-ev', 'industrial-mro'],
      shortDesc: 'Industrial grade neutral-cure silicone delivering oil-resistant, flexible gasketing up to 315°C.',
      description: 'CEA SIL-850 is a single-component, non-slump neutral oxime cure silicone paste. Engineered specifically for high-stress flange sealing, gearbox covers, engine oil pans, and industrial pump housing. Non-corrosive to copper and sensitive electronics.',
      specifications: JSON.stringify({
        'Chemical Base': 'Neutral Oxime Silicone',
        'Consistency': 'Non-sag Thixotropic Paste',
        'Skin-Over Time': '10 - 15 minutes at 25°C',
        'Cure Rate': '3 mm per 24 hours',
        'Operating Temperature': '-60°C to +315°C',
        'Elongation at Break': '450%',
        'Shore A Hardness': '34',
        'Dielectric Strength': '20 kV/mm',
      }),
      imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'CEA EPOX-200 Toughened Structural Epoxy',
      slug: 'cea-epox-200-toughened-epoxy',
      categorySlug: 'structural-adhesives',
      useCaseSlugs: ['automotive-ev', 'electronics-pcb'],
      shortDesc: 'High-shear two-part epoxy adhesive with outstanding impact resistance for metals, ceramics, and engineering plastics.',
      description: 'CEA EPOX-200 is a two-component rubber-toughened epoxy adhesive supplying extraordinary shear and peel strengths under severe thermal shock and cyclic loading. Ideal for composite structural joints, busbar brackets, and aerospace subassemblies.',
      specifications: JSON.stringify({
        'Mix Ratio (Volume)': '1 : 1',
        'Pot Life (100g mass)': '25 minutes at 23°C',
        'Time to Handling Strength': '2 hours',
        'Full Cure Duration': '24 hours at room temperature',
        'Lap Shear Strength (Steel)': '28.5 MPa (4,130 psi)',
        'T-Peel Strength': '6.8 N/mm',
        'Glass Transition (Tg)': '82°C',
        'Color (Cured)': 'Amber / Off-white',
      }),
      imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
      galleryImages: JSON.stringify([]),
    },
    {
      name: 'CEA THERM-900 Thermally Conductive Interface Tape',
      slug: 'cea-therm-900-thermal-tape',
      categorySlug: 'thermal-insulation',
      useCaseSlugs: ['automotive-ev', 'electronics-pcb'],
      shortDesc: 'Ceramic-filled acrylic bonding tape providing 1.6 W/m-K thermal dissipation with reliable electrical isolation.',
      description: 'CEA THERM-900 is engineered to bridge thermal pathways between power semiconductors, LED light engines, EV battery cooling plates, and heat sinks. Eliminates messy thermal greases while supplying mechanical adhesion.',
      specifications: JSON.stringify({
        'Thermal Conductivity': '1.6 W/m-K',
        'Dielectric Breakdown Voltage': '4.5 kV AC',
        'Thermal Impedance': '0.42 °C-in²/W at 50 psi',
        'Total Thickness': '0.25 mm (10 mil)',
        'Carrier Type': 'Fiberglass Reinforced Ceramic Composite',
        'Flame Retardancy': 'UL94 V-0 Certified',
      }),
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      galleryImages: JSON.stringify([]),
    },
    {
      name: 'CEA THREAD-243 Medium Strength Oil-Tolerant Threadlocker',
      slug: 'cea-thread-243-threadlocker',
      categorySlug: 'structural-adhesives',
      useCaseSlugs: ['industrial-mro', 'automotive-ev'],
      shortDesc: 'Anaerobic locking adhesive preventing loosening from vibration on fasteners up to M36, even on oily surfaces.',
      description: 'CEA THREAD-243 is a general purpose anaerobic threadlocker that cures in the absence of air between close-fitting metal surfaces. Tolerates minor surface contaminations of industrial cutting oils and anti-corrosion fluids.',
      specifications: JSON.stringify({
        'Chemical Type': 'Dimethacrylate Ester',
        'Viscosity': 'Thixotropic Liquid (1,500 - 3,000 mPa.s)',
        'Breakaway Torque (M10 Steel)': '26 Nm',
        'Prevailing Torque (M10 Steel)': '5 Nm',
        'Fixture Time': '10 - 15 minutes',
        'Full Strength Cure': '24 hours',
        'Temperature Range': '-55°C to +180°C',
        'Color': 'Fluorescent Industrial Blue',
      }),
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      galleryImages: JSON.stringify([]),
    },
    {
      name: 'CEA PU-600 Elastomeric Polyurethane Facade Sealant',
      slug: 'cea-pu-600-polyurethane-sealant',
      categorySlug: 'sealants-silicones',
      useCaseSlugs: ['facades-glazing', 'industrial-mro'],
      shortDesc: 'Fast-curing, UV-stable polyurethane joint sealant engineered for expansion joints and architectural panel perimeters.',
      description: 'CEA PU-600 provides permanent elasticity for structural building joints, precast concrete seams, and aluminum panel perimeters. Over-paintable with excellent resistance to weathering, moisture, and saltwater spray.',
      specifications: JSON.stringify({
        'Base': 'Polyurethane Elastomer',
        'Joint Movement Capability': '±25%',
        'Tack-Free Skin Time': '60 minutes at 23°C / 50% RH',
        'Cure Speed': '3 mm / 24 hours',
        '100% Modulus': '0.40 MPa',
        'Shore A Hardness': '25',
        'Service Temperature': '-40°C to +90°C',
        'Color': 'Concrete Gray',
      }),
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      galleryImages: JSON.stringify([]),
    },
  ]

  for (const p of productsData) {
    const categoryId = categoriesMap.get(p.categorySlug)
    if (!categoryId) {
      throw new Error(`Category ${p.categorySlug} not found during product seeding!`)
    }

    const productRecord = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        description: p.description,
        specifications: p.specifications,
        imageUrl: p.imageUrl,
        galleryImages: p.galleryImages,
        categoryId: categoryId,
      },
      update: {
        name: p.name,
        shortDesc: p.shortDesc,
        description: p.description,
        specifications: p.specifications,
        imageUrl: p.imageUrl,
        galleryImages: p.galleryImages,
        categoryId: categoryId,
      },
    })

    // Seed ProductUseCase junction entries
    for (const ucSlug of p.useCaseSlugs) {
      const useCaseId = useCasesMap.get(ucSlug)
      if (useCaseId) {
        await prisma.productUseCase.upsert({
          where: {
            productId_useCaseId: {
              productId: productRecord.id,
              useCaseId: useCaseId,
            },
          },
          create: {
            productId: productRecord.id,
            useCaseId: useCaseId,
          },
          update: {},
        })
      }
    }
  }

  console.log('✅ Seeding completed successfully!')
  console.log('ℹ️  Note: AdminUser table left empty to enable the one-time /setup route.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
