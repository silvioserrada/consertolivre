export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export interface Post {
  id: string;
  technicianId: string;
  categoryId: string;
  title: string;
  mediaType: "video" | "photo";
  mediaUrl: string;
  thumbnailUrl: string;
  description: string;
  rating: RatingSummary;
}

export interface Technician {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  categoryIds: string[];
  plan: "free" | "premium";
  rating: RatingSummary;
  postsCount: number;
}

export interface ClassifiedListing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  condition: "novo" | "usado";
  categoryId: string;
  city: string;
  state: string;
  imageUrl: string;
  rating: RatingSummary;
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  stars: number;
  createdAt: string;
}
