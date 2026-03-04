import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllArtists = asyncHandler(async (_req: Request, res: Response) => {
  const artists = await prisma.user.findMany({
    where: { role: 'ARTIST' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      profileImage: true,
      country: true,
      birthYear: true,
      genre: true,
      createdAt: true,
      _count: {
        select: {
          artworks: true,
        },
      },
    },
  });

  const artistIds = artists.map(a => a.id);
  const followers = await prisma.userFollow.groupBy({
    by: ['followingId'],
    where: { followingId: { in: artistIds } },
    _count: true,
  });

  const followerMap = Object.fromEntries(followers.map(f => [f.followingId, f._count]));

  const formattedArtists = artists.map((artist: any) => ({
    id: artist.id,
    firstName: artist.firstName,
    lastName: artist.lastName,
    bio: artist.bio,
    profileImage: artist.profileImage,
    country: artist.country,
    birthYear: artist.birthYear,
    genre: artist.genre,
    createdAt: artist.createdAt,
    workCount: artist._count.artworks,
    followerCount: followerMap[artist.id] || 0,
  }));

  return res.json(formattedArtists);
});

export const getArtistById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const artist = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      profileImage: true,
      country: true,
      birthYear: true,
      genre: true,
      createdAt: true,
      artworks: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true,
          category: true,
          isAvailable: true,
          isFeatured: true,
          views: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          artworks: true,
        },
      },
    },
  });

  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }

  // Count followers
  const followerCount = await prisma.userFollow.count({
    where: { followingId: id },
  });

  return res.json({
    id: artist.id,
    firstName: artist.firstName,
    lastName: artist.lastName,
    bio: artist.bio,
    profileImage: artist.profileImage,
    country: artist.country,
    birthYear: artist.birthYear,
    genre: artist.genre,
    createdAt: artist.createdAt,
    artworks: artist.artworks,
    workCount: artist._count.artworks,
    followerCount: followerCount,
  });
});

export const toggleFollowArtist = asyncHandler(async (req: Request, res: Response) => {
  const { id: artistId } = req.params as { id: string };
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (userId === artistId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  // Check if artist exists
  const artist = await prisma.user.findUnique({ where: { id: artistId } });
  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }

  if (artist.role !== 'ARTIST') {
    return res.status(400).json({ message: 'You can only follow artist accounts' });
  }

  // Check if already following
  const existingFollow = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: artistId,
      },
    },
  });

  if (existingFollow) {
    await prisma.userFollow.delete({
      where: {
        id: existingFollow.id,
      },
    });
    return res.json({ message: 'Unfollowed artist', isFollowing: false });
  } else {
    await prisma.userFollow.create({
      data: {
        followerId: userId,
        followingId: artistId,
      },
    });
    return res.json({ message: 'Followed artist', isFollowing: true });
  }
});

export const getArtistFollowers = asyncHandler(async (req: Request, res: Response) => {
  const { id: artistId } = req.params as { id: string };

  const followers = await prisma.userFollow.findMany({
    where: { followingId: artistId },
    select: {
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });

  return res.json(followers.map((f) => f.follower));
});

