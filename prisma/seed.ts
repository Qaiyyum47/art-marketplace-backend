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

  // Leonardo da Vinci - Renaissance Master
  const daVinci = await prisma.user.create({
    data: {
      email: 'davinci@art.com',
      password: hashedPassword,
      firstName: 'Leonardo',
      lastName: 'da Vinci',
      role: 'ARTIST',
      bio: 'Italian polymath of the Renaissance, painter, sculptor, architect, and inventor.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      country: 'Italy',
      birthYear: 1452,
      genre: 'Renaissance',
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.artwork.createMany({
    data: [
      {
        title: 'Mona Lisa',
        description: 'The most famous portrait in history, depicting a woman with an enigmatic smile.',
        price: 850000,
        imageUrl: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800',
        category: 'Renaissance',
        yearCreated: 1503,
        dimensions: '77 × 53 cm',
        medium: 'Oil on Poplar Panel',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: false,
        certificationIncluded: true,
        provenance: 'Louvre Museum, Paris',
        materials: 'Oil on poplar wood',
        isAvailable: true,
        isFeatured: true,
        views: 25000,
        artistId: daVinci.id,
      },
      {
        title: 'The Last Supper',
        description: 'Monumental mural depicting Jesus and his disciples at the moment of the final meal.',
        price: 900000,
        imageUrl: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=800',
        category: 'Renaissance',
        yearCreated: 1498,
        dimensions: '460 × 880 cm',
        medium: 'Tempera on Gesso',
        artworkType: 'Mural',
        condition: 'Good',
        signaturePresent: false,
        certificationIncluded: true,
        provenance: 'Santa Maria delle Grazie, Milan',
        materials: 'Tempera and oil on plaster',
        isAvailable: true,
        isFeatured: true,
        views: 20000,
        artistId: daVinci.id,
      },
      {
        title: 'Vitruvian Man',
        description: 'Iconic drawing of a male figure in two superimposed positions, exploring ideal human proportions.',
        price: 650000,
        imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800',
        category: 'Renaissance',
        yearCreated: 1490,
        dimensions: '34.6 × 25.5 cm',
        medium: 'Ink on Paper',
        artworkType: 'Drawing',
        condition: 'Excellent',
        signaturePresent: false,
        certificationIncluded: true,
        provenance: 'Gallerie dell\'Accademia, Venice',
        materials: 'Pen and ink on paper',
        isAvailable: true,
        isFeatured: true,
        views: 18000,
        artistId: daVinci.id,
      },
    ],
  });

  // Pablo Picasso - Cubism Pioneer
  const picasso = await prisma.user.create({
    data: {
      email: 'picasso@art.com',
      password: hashedPassword,
      firstName: 'Pablo',
      lastName: 'Picasso',
      role: 'ARTIST',
      bio: 'Spanish painter, sculptor, and co-founder of Cubism. One of the most influential artists of the 20th century.',
      profileImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
      country: 'Spain',
      birthYear: 1881,
      genre: 'Cubism',
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.artwork.createMany({
    data: [
      {
        title: 'Guernica',
        description: 'Powerful anti-war painting depicting the bombing of Guernica during the Spanish Civil War.',
        price: 780000,
        imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800',
        category: 'Cubism',
        yearCreated: 1937,
        dimensions: '349 × 776 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Museo Reina Sofía, Madrid',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 22000,
        artistId: picasso.id,
      },
      {
        title: 'Les Demoiselles d\'Avignon',
        description: 'Revolutionary painting that marked the beginning of Cubism and modern art.',
        price: 820000,
        imageUrl: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=800',
        category: 'Cubism',
        yearCreated: 1907,
        dimensions: '243.9 × 233.7 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Museum of Modern Art, New York',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 19000,
        artistId: picasso.id,
      },
      {
        title: 'The Weeping Woman',
        description: 'Emotionally charged portrait depicting a woman crying, with fragmented Cubist style.',
        price: 720000,
        imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800',
        category: 'Cubism',
        yearCreated: 1937,
        dimensions: '60 × 49 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Tate Modern, London',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 16000,
        artistId: picasso.id,
      },
    ],
  });

  // Claude Monet - Impressionism Founder
  const monet = await prisma.user.create({
    data: {
      email: 'monet@art.com',
      password: hashedPassword,
      firstName: 'Claude',
      lastName: 'Monet',
      role: 'ARTIST',
      bio: 'French painter and founder of Impressionism, famous for capturing light and atmosphere.',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      country: 'France',
      birthYear: 1840,
      genre: 'Impressionism',
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.artwork.createMany({
    data: [
      {
        title: 'Water Lilies',
        description: 'Serene pond with water lilies and reflections, capturing the essence of Impressionism.',
        price: 680000,
        imageUrl: 'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=800',
        category: 'Impressionism',
        yearCreated: 1916,
        dimensions: '200 × 200 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Musée de l\'Orangerie, Paris',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 23000,
        artistId: monet.id,
      },
      {
        title: 'Impression, Sunrise',
        description: 'The painting that gave Impressionism its name, depicting Le Havre harbor at sunrise.',
        price: 750000,
        imageUrl: 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=800',
        category: 'Impressionism',
        yearCreated: 1872,
        dimensions: '48 × 63 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'Musée Marmottan Monet, Paris',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 21000,
        artistId: monet.id,
      },
      {
        title: 'Woman with a Parasol',
        description: 'Monet\'s wife and son in a sun-drenched field, captured with loose brushwork.',
        price: 620000,
        imageUrl: 'https://images.unsplash.com/photo-1579541592287-d9f0f6ba0de0?w=800',
        category: 'Impressionism',
        yearCreated: 1875,
        dimensions: '100 × 81 cm',
        medium: 'Oil on Canvas',
        artworkType: 'Painting',
        condition: 'Excellent',
        signaturePresent: true,
        certificationIncluded: true,
        provenance: 'National Gallery of Art, Washington',
        materials: 'Oil on canvas',
        isAvailable: true,
        isFeatured: true,
        views: 17000,
        artistId: monet.id,
      },
    ],
  });

  console.log('✅ Database seeded!');
  console.log('Artists:');
  console.log('  - Van Gogh: test@art.com | Password: password123');
  console.log('  - Leonardo da Vinci: davinci@art.com | Password: password123');
  console.log('  - Pablo Picasso: picasso@art.com | Password: password123');
  console.log('  - Claude Monet: monet@art.com | Password: password123');
  console.log('Total: 4 artists with 12 artworks');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
