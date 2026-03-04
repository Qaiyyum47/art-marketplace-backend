import prisma from '../config/database';

/**
 * Validate that all artworks have valid Cloudinary images
 * Returns list of artworks with missing images
 */
export const findArtworksWithMissingImages = async (): Promise<{
  id: string;
  title: string;
  imagePublicId: string | null;
}[]> => {
  // Find artworks where imagePublicId is null (potential data integrity issue)
  const artworksWithoutCloudinaryId = await prisma.artwork.findMany({
    where: {
      OR: [
        { imagePublicId: null },
        { imagePublicId: '' },
      ],
    },
    select: {
      id: true,
      title: true,
      imagePublicId: true,
    },
  });

  return artworksWithoutCloudinaryId;
};
