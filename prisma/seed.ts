import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.userFollow.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.artwork.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const vanGogh = await prisma.user.create({
    data: {
      email: 'test@art.com',
      password: hashedPassword,
      firstName: 'Vincent',
      lastName: 'van Gogh',
      role: 'ARTIST',
      bio: 'Dutch post-impressionist painter, master of color and emotion.',
      profileImage: 'https://images.unsplash.com/photo-1578309867814-cd4628902d4a?w=400',
      country: 'Netherlands',
      birthYear: 1853,
      genre: 'Post-Impressionism',
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.artwork.createMany({
    data: [
      {
        title: 'Starry Night',
        description: 'A swirling night sky over a French village with vibrant colors and thick brushstrokes.',
        price: 500000,
        imageUrl: 'https://images.unsplash.com/photo-1579783902614-e3fb446b9a5f?w=800',
        category: 'Post-Impressionism',
        yearCreated: 1889,
        dimensions: '73.7 × 92.1 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Van Gogh Museum, Amsterdam',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 15000,
        artistId: vanGogh.id,
      },
      {
        title: 'Sunflowers',
        description: 'Stunning arrangement of sunflowers in a vase with bold yellows and oranges.',
        price: 450000,
        imageUrl: 'https://images.unsplash.com/photo-1578309775174-23a2319ca461?w=800',
        category: 'Post-Impressionism',
        yearCreated: 1889,
        dimensions: '95 × 73 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'National Gallery London',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 12000,
        artistId: vanGogh.id,
      },
      {
        title: 'The Bedroom',
        description: 'Van Gogh\'s own bedroom in Arles, depicted in calming blues and warm tones.',
        price: 480000,
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        category: 'Post-Impressionism',
        yearCreated: 1888,
        dimensions: '72.5 × 91.5 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Van Gogh Museum, Amsterdam',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 8500,
        artistId: vanGogh.id,
      },
    ],
  });

  console.log('✅ Database seeded!');
  console.log('Email: test@art.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
