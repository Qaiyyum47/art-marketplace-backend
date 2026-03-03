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

  // Famous Artists
  const banksy = await prisma.user.create({
    data: {
      email: 'banksy@art.com',
      password: hashedPassword,
      firstName: 'Banksy',
      lastName: 'Street Artist',
      role: 'ARTIST',
      bio: 'British street artist known for satirical and subversive street art with dark humor',
      profileImage: 'https://images.unsplash.com/photo-1578309867814-cd4628902d4a?w=400',
      country: 'United Kingdom',
      birthYear: 1974,
      genre: 'Street Art',
      isVerified: true,
      isActive: true,
    },
  });

  const fridaKahlo = await prisma.user.create({
    data: {
      email: 'frida@art.com',
      password: hashedPassword,
      firstName: 'Frida',
      lastName: 'Kahlo',
      role: 'ARTIST',
      bio: 'Mexican artist known for self-portraits and magical realism, exploring identity and pain',
      profileImage: 'https://images.unsplash.com/photo-1547984609-4ee1c9a34a55?w=400',
      country: 'Mexico',
      birthYear: 1907,
      genre: 'Painting',
      isVerified: true,
      isActive: true,
    },
  });

  const basquiat = await prisma.user.create({
    data: {
      email: 'basquiat@art.com',
      password: hashedPassword,
      firstName: 'Jean-Michel',
      lastName: 'Basquiat',
      role: 'ARTIST',
      bio: 'American neo-expressionist artist, influential in contemporary and street art',
      profileImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      country: 'United States',
      birthYear: 1960,
      genre: 'Neo-Expressionism',
      isVerified: true,
      isActive: true,
    },
  });

  const annaArtist = await prisma.user.create({
    data: {
      email: 'anna@art.com',
      password: hashedPassword,
      firstName: 'Anna',
      lastName: 'Sculpture',
      role: 'ARTIST',
      bio: 'Contemporary digital artist and 3D sculptor exploring virtual spaces',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      country: 'Germany',
      birthYear: 1985,
      genre: 'Digital Art',
      isVerified: true,
      isActive: true,
    },
  });

  // Buyers
  const collector = await prisma.user.create({
    data: {
      email: 'collector@art.com',
      password: hashedPassword,
      firstName: 'Art',
      lastName: 'Collector',
      role: 'BUYER',
      bio: 'Passionate art collector and museum enthusiast',
      profileImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
      isVerified: true,
      isActive: true,
    },
  });

  const museumDirector = await prisma.user.create({
    data: {
      email: 'museum@art.com',
      password: hashedPassword,
      firstName: 'Museum',
      lastName: 'Director',
      role: 'BUYER',
      bio: 'Director of contemporary art museum, curator and collector',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      isVerified: true,
      isActive: true,
    },
  });

  // Artworks by Banksy
  await prisma.artwork.createMany({
    data: [
      {
        title: 'Girl with Balloon',
        description: 'Iconic street art depicting a young girl letting go of a heart-shaped red balloon. This piece has become one of Banksy\'s most recognizable and beloved works.',
        price: 150000,
        imageUrl: 'https://images.unsplash.com/photo-1579783902614-e3fb446b9a5f?w=800',
        category: 'Street Art',
        dimensions: '200x200cm',
        medium: 'Spray Paint on Concrete',
        yearCreated: 2002,
        isAvailable: true,
        isFeatured: true,
        views: 5000,
        artistId: banksy.id,
      },
      {
        title: 'Flower Thrower',
        description: 'A masked activist throwing a bouquet of flowers instead of a weapon. This powerful image of non-violence has been featured in protests worldwide.',
        price: 120000,
        imageUrl: 'https://images.unsplash.com/photo-1578309775174-23a2319ca461?w=800',
        category: 'Street Art',
        dimensions: '150x150cm',
        medium: 'Stencil Art',
        yearCreated: 2003,
        isAvailable: true,
        isFeatured: true,
        views: 4200,
        artistId: banksy.id,
      },
    ],
  });

  // Artworks by Frida Kahlo
  await prisma.artwork.createMany({
    data: [
      {
        title: 'The Two Fridas',
        description: 'A self-portrait of the artist as two versions of herself, holding hands. One wears a white wedding dress, the other a Victorian gown, connected by a vein and a surgical scissors.',
        price: 200000,
        imageUrl: 'https://images.unsplash.com/photo-1549887534-f3d3d3d3d3d3?w=800',
        category: 'Painting',
        dimensions: '173x173cm',
        medium: 'Oil on Canvas',
        yearCreated: 1944,
        isAvailable: true,
        isFeatured: true,
        views: 6500,
        artistId: fridaKahlo.id,
      },
      {
        title: 'The Wounded Deer',
        description: 'Self-portrait where the artist imagines herself as a deer pierced with arrows, alone in a dark forest. A powerful metaphor for emotional pain and suffering.',
        price: 180000,
        imageUrl: 'https://images.unsplash.com/photo-1578926078331-123456?w=800',
        category: 'Painting',
        dimensions: '90x60cm',
        medium: 'Oil on Masonite',
        yearCreated: 1946,
        isAvailable: true,
        isFeatured: false,
        views: 3800,
        artistId: fridaKahlo.id,
      },
    ],
  });

  // Artworks by Basquiat
  await prisma.artwork.createMany({
    data: [
      {
        title: 'Untitled (Skull)',
        description: 'Neo-expressionist painting featuring abstract skull imagery and cryptic text. Part of Basquiat\'s exploration of mortality and human consciousness.',
        price: 250000,
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        category: 'Neo-Expressionism',
        dimensions: '210x180cm',
        medium: 'Acrylic and Oil on Canvas',
        yearCreated: 1982,
        isAvailable: true,
        isFeatured: true,
        views: 7200,
        artistId: basquiat.id,
      },
      {
        title: 'Hollywood Africans',
        description: 'Mixed media artwork exploring race and culture in American society. Features bold colors, text, and imagery reflecting on Black identity in Hollywood.',
        price: 220000,
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        category: 'Neo-Expressionism',
        dimensions: '200x200cm',
        medium: 'Acrylic and Mixed Media',
        yearCreated: 1983,
        isAvailable: false,
        isFeatured: false,
        views: 4900,
        artistId: basquiat.id,
      },
    ],
  });

  // Artworks by Anna
  await prisma.artwork.createMany({
    data: [
      {
        title: 'Digital Landscape 001',
        description: 'Contemporary digital art exploring virtual landscapes, light, and dimensionality. A meditation on the intersection of nature and technology.',
        price: 85000,
        imageUrl: 'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=800',
        category: 'Digital Art',
        dimensions: 'Digital',
        medium: 'Digital Painting',
        yearCreated: 2023,
        isAvailable: true,
        isFeatured: false,
        views: 2100,
        artistId: annaArtist.id,
      },
      {
        title: '3D Sculpture Study',
        description: 'Abstract 3D sculpture rendered and 3D-printed in high-quality resin. Explores organic forms and negative space in the digital realm.',
        price: 95000,
        imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=800',
        category: 'Digital Art',
        dimensions: '40x40x40cm',
        medium: '3D Print & Resin',
        yearCreated: 2024,
        isAvailable: true,
        isFeatured: false,
        views: 1850,
        artistId: annaArtist.id,
      },
    ],
  });

  // Create followers
  await prisma.userFollow.createMany({
    data: [
      { followerId: collector.id, followingId: banksy.id },
      { followerId: collector.id, followingId: fridaKahlo.id },
      { followerId: collector.id, followingId: basquiat.id },
      { followerId: museumDirector.id, followingId: basquiat.id },
      { followerId: museumDirector.id, followingId: annaArtist.id },
      { followerId: museumDirector.id, followingId: fridaKahlo.id },
    ],
  });

  // Get all artworks and create favorites
  const allArtworks = await prisma.artwork.findMany();
  await prisma.favorite.createMany({
    data: [
      { userId: collector.id, artworkId: allArtworks[0].id },
      { userId: collector.id, artworkId: allArtworks[2].id },
      { userId: collector.id, artworkId: allArtworks[4].id },
      { userId: museumDirector.id, artworkId: allArtworks[1].id },
      { userId: museumDirector.id, artworkId: allArtworks[3].id },
      { userId: museumDirector.id, artworkId: allArtworks[5].id },
    ],
  });

  console.log('✅ Database seeded with famous artists!');
  console.log('\n📊 Created:');
  console.log('  - 4 Famous Artists (Banksy, Frida Kahlo, Basquiat, Anna)');
  console.log('  - 8 Iconic Artworks');
  console.log('  - 2 Buyer Accounts');
  console.log('  - 6 Following Relationships');
  console.log('  - 6 Favorite Artworks');
  console.log('\n🔑 Test Credentials:');
  console.log('  Artist (Banksy): banksy@art.com / password123');
  console.log('  Artist (Frida): frida@art.com / password123');
  console.log('  Artist (Basquiat): basquiat@art.com / password123');
  console.log('  Buyer: collector@art.com / password123');
  console.log('  Museum Director: museum@art.com / password123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
