import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    let data;
    try {
      data = JSON.parse(text)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON file format' }, { status: 400 })
    }

    const { categories = [], useCases = [], products = [], heroImages = [] } = data

    await prisma.$transaction(async (tx) => {
      // Create categories if they don't exist
      for (const cat of categories) {
        const exists = await tx.category.findUnique({ where: { id: cat.id } })
        if (!exists) {
          await tx.category.create({
            data: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              imageUrl: cat.imageUrl,
              createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
            }
          })
        }
      }

      // Create useCases
      for (const uc of useCases) {
        const exists = await tx.useCase.findUnique({ where: { id: uc.id } })
        if (!exists) {
          await tx.useCase.create({
            data: {
              id: uc.id,
              title: uc.title,
              slug: uc.slug,
              description: uc.description,
              imageUrl: uc.imageUrl,
              createdAt: uc.createdAt ? new Date(uc.createdAt) : undefined,
            }
          })
        }
      }

      // Create products
      for (const prod of products) {
        const exists = await tx.product.findUnique({ where: { id: prod.id } })
        if (!exists) {
          await tx.product.create({
            data: {
              id: prod.id,
              name: prod.name,
              slug: prod.slug,
              description: prod.description,
              shortDesc: prod.shortDesc,
              specifications: prod.specifications,
              imageUrl: prod.imageUrl,
              galleryImages: prod.galleryImages,
              categoryId: prod.categoryId,
              createdAt: prod.createdAt ? new Date(prod.createdAt) : undefined,
            }
          })
          
          if (prod.useCases && Array.isArray(prod.useCases)) {
            for (const puc of prod.useCases) {
              await tx.productUseCase.create({
                data: {
                  productId: prod.id,
                  useCaseId: puc.useCaseId
                }
              })
            }
          }
        }
      }

      // Create hero images
      for (const hero of heroImages) {
        const exists = await tx.heroImage.findUnique({ where: { id: hero.id } })
        if (!exists) {
          await tx.heroImage.create({
            data: {
              id: hero.id,
              title: hero.title,
              subtitle: hero.subtitle,
              imageUrl: hero.imageUrl,
              linkUrl: hero.linkUrl,
              order: hero.order,
              active: hero.active,
              createdAt: hero.createdAt ? new Date(hero.createdAt) : undefined,
            }
          })
        }
      }
    })

    return NextResponse.json({ success: true, message: 'JSON catalog imported successfully. No existing data was modified.' })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
