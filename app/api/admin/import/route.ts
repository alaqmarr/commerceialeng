import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Database from 'better-sqlite3'
import fs from 'fs'
import os from 'os'
import path from 'path'

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

    const buffer = Buffer.from(await file.arrayBuffer())
    const tmpFilePath = path.join(os.tmpdir(), `import-${Date.now()}.db`)
    
    fs.writeFileSync(tmpFilePath, buffer)

    let db;
    try {
      db = new Database(tmpFilePath, { readonly: true })
      
      // Read data from the uploaded DB
      const categories = db.prepare('SELECT * FROM categories').all() as any[]
      const useCases = db.prepare('SELECT * FROM use_cases').all() as any[]
      const products = db.prepare('SELECT * FROM products').all() as any[]
      const productUseCases = db.prepare('SELECT * FROM product_use_cases').all() as any[]

      // Perform a bulk upsert using a transaction
      await prisma.$transaction(async (tx) => {
        // Categories
        for (const cat of categories) {
          await tx.category.upsert({
            where: { id: cat.id },
            update: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              imageUrl: cat.imageUrl,
              createdAt: new Date(cat.createdAt),
              updatedAt: new Date(cat.updatedAt),
            },
            create: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              imageUrl: cat.imageUrl,
              createdAt: new Date(cat.createdAt),
              updatedAt: new Date(cat.updatedAt),
            }
          })
        }

        // Use Cases
        for (const uc of useCases) {
          await tx.useCase.upsert({
            where: { id: uc.id },
            update: {
              title: uc.title,
              slug: uc.slug,
              description: uc.description,
              imageUrl: uc.imageUrl,
              createdAt: new Date(uc.createdAt),
              updatedAt: new Date(uc.updatedAt),
            },
            create: {
              id: uc.id,
              title: uc.title,
              slug: uc.slug,
              description: uc.description,
              imageUrl: uc.imageUrl,
              createdAt: new Date(uc.createdAt),
              updatedAt: new Date(uc.updatedAt),
            }
          })
        }

        // Products
        for (const prod of products) {
          await tx.product.upsert({
            where: { id: prod.id },
            update: {
              name: prod.name,
              slug: prod.slug,
              description: prod.description,
              shortDesc: prod.shortDesc,
              specifications: prod.specifications,
              imageUrl: prod.imageUrl,
              galleryImages: prod.galleryImages,
              categoryId: prod.categoryId,
              createdAt: new Date(prod.createdAt),
              updatedAt: new Date(prod.updatedAt),
            },
            create: {
              id: prod.id,
              name: prod.name,
              slug: prod.slug,
              description: prod.description,
              shortDesc: prod.shortDesc,
              specifications: prod.specifications,
              imageUrl: prod.imageUrl,
              galleryImages: prod.galleryImages,
              categoryId: prod.categoryId,
              createdAt: new Date(prod.createdAt),
              updatedAt: new Date(prod.updatedAt),
            }
          })
        }

        // Product Use Cases
        // Easiest is to delete existing relations for these products and recreate, or upsert.
        // We'll upsert to be safe.
        for (const puc of productUseCases) {
          await tx.productUseCase.upsert({
            where: {
              productId_useCaseId: {
                productId: puc.productId,
                useCaseId: puc.useCaseId
              }
            },
            update: {},
            create: {
              productId: puc.productId,
              useCaseId: puc.useCaseId
            }
          })
        }
      })

    } catch (e: any) {
      console.error('Import Error:', e)
      return NextResponse.json({ error: 'Failed to process database file: ' + e.message }, { status: 500 })
    } finally {
      if (db) db.close()
      try {
        fs.unlinkSync(tmpFilePath)
      } catch (e) {}
    }

    return NextResponse.json({ success: true, message: 'Database catalog synced successfully.' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
