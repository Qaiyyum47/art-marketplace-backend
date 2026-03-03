import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.artwork.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const buyer1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'BUYER',
      bio: 'Art lover and collector',
      profileImage: 'https://i.pravatar.cc/150?img=1',
      isVerified: true,
      isActive: true,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'BUYER',
      bio: 'Contemporary art enthusiast',
      profileImage: 'https://i.pravatar.cc/150?img=2',
      isVerified: true,
      isActive: true,
    },
  });

  const artist1 = await prisma.user.create({
    data: {
      email: 'alice@artistry.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'ARTIST',
      bio: 'Digital artist | Illustrator | Animation lover',
      profileImage: 'https://i.pravatar.cc/150?img=3',
      isVerified: true,
      isActive: true,
    },
  });

  const artist2 = await prisma.user.create({
    data: {
      email: 'bob@artistry.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'ARTIST',
      bio: 'Oil painter | Landscape specialist',
      profileImage: 'https://i.pravatar.cc/150?img=4',
      isVerified: true,
      isActive: true,
    },
  });

  const artist3 = await prisma.user.create({
    data: {
      email: 'emma@artistry.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Davis',
      role: 'ARTIST',
      bio: 'Sculptor | Installation artist',
      profileImage: 'https://i.pravatar.cc/150?img=5',
      isVerified: true,
      isActive: true,
    },
  });

  const artwork1 = await prisma.artwork.create({
    data: {
      title: 'Sunset Over Mountains',
      description: 'A breathtaking landscape painting capturing the golden hour',
      price: 2500.0,
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-e3fb446b9a5f?w=800',
      category: 'Landscape',
      medium: 'Oil on Canvas',
      yearCreated: 2023,
      artistId: artist1.id,
      isAvailable: true,
      isFeatured: true,
      views: 1250,
    },
  });

  const artwork2 = await prisma.artwork.create({
    data: {
      title: 'Abstract Dream',
      description: 'Vibrant abstract composition exploring color and form',
      price: 1800.0,
      imageUrl: 'https://images.unsplash.com/photo-1549887534-f3d3d3d3d3d3?w=800',
      category: 'Abstract',
      medium: 'Acrylic on Canvas',
      yearCreated: 2024,
      artistId: artist2.id,
      isAvailable: true,
      isFeatured: true,
      views: 2100,
    },
  });

  const artwork3 = await prisma.artwork.create({
    data: {
      title: 'Urban Reflections',
      description: 'Modern city street scene with reflection in wet pavement',
      price: 1500.0,
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      category: 'Photography',
      medium: 'Digital Print',
      yearCreated: 2023,
      artistId: artist1.id,
      isAvailable: true,
      isFeatured: false,
      views: 890,
    },
  });

  const artwork4 = await prisma.artwork.create({
    data: {
      title: 'Marble Sculpture',
      description: 'Elegant white marble bust of classical proportions',
      price: 5000.0,
      imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=800',
      category: 'Sculpture',
      medium: 'Marble',
      yearCreated: 2022,
      artistId: artist3.id,
      isAvailable: true,
      isFeatured: true,
      views: 3450,
    },
  });

  const artwork5 = await prisma.artwork.create({
    data: {
      title: 'Digital Still Life',
      description: 'Contemporary digital rendering of traditional still life elements',
      price: 900.0,
      imageUrl: 'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=800',
      category: 'Digital Art',
      medium: 'Digital',
      yearCreated: 2024,
      artistId: artist1.id,
      isAvailable: true,
      isFeatured: false,
      views: 560,
    },
  });

  const artwork6 = await prisma.artwork.create({
    data: {
      title: 'Ocean Waves',
      description: 'Seascape capturing the power and beauty of ocean waves',
      price: 2200.0,
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      category: 'Landscape',
      medium: 'Oil on Canvas',
      yearCreated: 2023,
      artistId: artist2.id,
      isAvailable: true,
      isFeatured: true,
      views: 1890,
    },
  });

  const artwork7 = await prisma.artwork.create({
    data: {
      title: 'Portrait in Color',
      description: 'Expressive portrait using bold colors and brushstrokes',
      price: 1600.0,
      imageUrl: 'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=800',
      category: 'Portrait',
      medium: 'Acrylic on Canvas',
      yearCreated: 2024,
      artistId: artist1.id,
      isAvailable: false,
      isFeatured: false,
      views: 450,
    },
  });

  const artwork8 = await prisma.artwork.create({
    data: {
      title: 'Modern Installation',
      description: 'Interactive art installation combining light and sound',
      price: 8000.0,
      imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=800',
      category: 'Installation',
      medium: 'Mixed Media',
      yearCreated: 2023,
      artistId: artist3.id,
      isAvailable: true,
      isFeatured: true,
      views: 2340,
    },
  });

  await prisma.cartItem.create({
    data: {
      userId: buyer1.id,
      artworkId: artwork1.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      userId: buyer1.id,
      artworkId: artwork3.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      userId: buyer2.id,
      artworkId: artwork5.id,
      quantity: 2,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer1.id,
      artworkId: artwork2.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer1.id,
      artworkId: artwork4.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer2.id,
      artworkId: artwork1.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer2.id,
      artworkId: artwork6.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer1.id,
      artworkId: artwork7.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer2.id,
      artworkId: artwork8.id,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-001`,
      totalAmount: artwork1.price + artwork3.price,
      status: 'COMPLETED',
      userId: buyer1.id,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      artworkId: artwork1.id,
      price: artwork1.price,
      quantity: 1,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      artworkId: artwork3.id,
      price: artwork3.price,
      quantity: 1,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-002`,
      totalAmount: artwork2.price,
      status: 'COMPLETED',
      userId: buyer2.id,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
      },
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      artworkId: artwork2.id,
      price: artwork2.price,
      quantity: 1,
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-003`,
      totalAmount: artwork4.price,
      status: 'PENDING',
      userId: buyer1.id,
      shippingAddress: {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      artworkId: artwork4.id,
      price: artwork4.price,
      quantity: 1,
    },
  });

  console.log('✅ Database seed completed!');
  console.log('\n📊 Data Summary:');
  console.log('- Users: 5 (2 buyers, 3 artists)');
  console.log('- Artworks: 8');
  console.log('- Cart Items: 3');
  console.log('- Favorites: 4');
  console.log('- Orders: 3');

  console.log('\n🔑 Test Credentials:');
  console.log('─────────────────────────────');
  console.log('Buyer 1:');
  console.log(`  Email: ${buyer1.email}`);
  console.log(`  Password: password123`);
  console.log('\nBuyer 2:');
  console.log(`  Email: ${buyer2.email}`);
  console.log(`  Password: password123`);
  console.log('\nArtist 1:');
  console.log(`  Email: ${artist1.email}`);
  console.log(`  Password: password123`);
  console.log('\nArtist 2:');
  console.log(`  Email: ${artist2.email}`);
  console.log(`  Password: password123`);
  console.log('\nArtist 3:');
  console.log(`  Email: ${artist3.email}`);
  console.log(`  Password: password123`);
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
