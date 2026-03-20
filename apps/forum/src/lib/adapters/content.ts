import {
  campaigns,
  categories,
  comments,
  defaultSettings,
  getTopPostHeroSlides as getTopPostHeroSlidesFromMock,
  leaderboard,
  notifications,
  posts,
  primaryNav,
  users,
  vibingItems,
} from "@/lib/mock-data";

export type { TopPostHeroSlide } from "@/lib/mock-data";

export interface ContentDataSource {
  getPrimaryNav: () => typeof primaryNav;
  getCategories: () => typeof categories;
  getFeedData: () => {
    posts: typeof posts;
    comments: typeof comments;
    users: typeof users;
  };
  getVibingItems: (limit?: number) => typeof vibingItems;
  getCampaigns: () => typeof campaigns;
  getNotificationsForUser: (userId: string) => typeof notifications;
  getDefaultSettings: () => typeof defaultSettings;
  getTopPostHeroSlides: () => ReturnType<typeof getTopPostHeroSlidesFromMock>;
  getPostBySlug: (slug: string) => (typeof posts)[number] | null;
  getUserById: (userId: string) => (typeof users)[number] | null;
  getUserByHandle: (handle: string) => (typeof users)[number] | null;
  getPostsByCategorySlug: (slug: string) => typeof posts;
  getPostsByAuthor: (authorId: string) => typeof posts;
  getCommentsByPostId: (postId: string) => typeof comments;
  getCategoryBySlug: (slug: string) => (typeof categories)[number] | null;
  getUnreadNotifications: (userId: string) => typeof notifications;
  getLeaderboardWithUsers: () => Array<
    (typeof leaderboard)[number] & {
      user: (typeof users)[number] | null;
    }
  >;
}

const mockContentDataSource: ContentDataSource = {
  getPrimaryNav: () => primaryNav,
  getCategories: () => categories,
  getFeedData: () => ({
    posts,
    comments,
    users,
  }),
  getVibingItems: (limit = 10) => vibingItems.slice(0, limit),
  getCampaigns: () => campaigns,
  getNotificationsForUser: (userId: string) => notifications.filter((notification) => notification.userId === userId),
  getDefaultSettings: () => defaultSettings,
  getTopPostHeroSlides: () => getTopPostHeroSlidesFromMock(posts),
  getPostBySlug: (slug: string) => posts.find((post) => post.slug === slug) ?? null,
  getUserById: (userId: string) => users.find((user) => user.id === userId) ?? null,
  getUserByHandle: (handle: string) => users.find((user) => user.handle === handle) ?? null,
  getPostsByCategorySlug: (slug: string) => posts.filter((post) => post.category === slug),
  getPostsByAuthor: (authorId: string) => posts.filter((post) => post.authorId === authorId),
  getCommentsByPostId: (postId: string) => comments.filter((comment) => comment.postId === postId),
  getCategoryBySlug: (slug: string) => categories.find((category) => category.key === slug) ?? null,
  getUnreadNotifications: (userId: string) =>
    notifications.filter((notification) => notification.userId === userId && !notification.read),
  getLeaderboardWithUsers: () =>
    leaderboard.map((entry) => ({
      ...entry,
      user: users.find((user) => user.id === entry.userId) ?? null,
    })),
};

let activeContentDataSource: ContentDataSource = mockContentDataSource;

export function setContentDataSource(dataSource: ContentDataSource) {
  activeContentDataSource = dataSource;
}

export function resetContentDataSource() {
  activeContentDataSource = mockContentDataSource;
}

export function getPrimaryNav() {
  return activeContentDataSource.getPrimaryNav();
}

export function getCategories() {
  return activeContentDataSource.getCategories();
}

export function getFeedData() {
  return activeContentDataSource.getFeedData();
}

export function getVibingItems(limit = 10) {
  return activeContentDataSource.getVibingItems(limit);
}

export function getCampaigns() {
  return activeContentDataSource.getCampaigns();
}

export function getNotificationsForUser(userId: string) {
  return activeContentDataSource.getNotificationsForUser(userId);
}

export function getDefaultSettings() {
  return activeContentDataSource.getDefaultSettings();
}

export function getTopPostHeroSlides() {
  return activeContentDataSource.getTopPostHeroSlides();
}

export function getPostBySlug(slug: string) {
  return activeContentDataSource.getPostBySlug(slug);
}

export function getUserById(userId: string) {
  return activeContentDataSource.getUserById(userId);
}

export function getUserByHandle(handle: string) {
  return activeContentDataSource.getUserByHandle(handle);
}

export function getPostsByCategorySlug(slug: string) {
  return activeContentDataSource.getPostsByCategorySlug(slug);
}

export function getPostsByAuthor(authorId: string) {
  return activeContentDataSource.getPostsByAuthor(authorId);
}

export function getCommentsByPostId(postId: string) {
  return activeContentDataSource.getCommentsByPostId(postId);
}

export function getCategoryBySlug(slug: string) {
  return activeContentDataSource.getCategoryBySlug(slug);
}

export function getUnreadNotifications(userId: string) {
  return activeContentDataSource.getUnreadNotifications(userId);
}

export function getLeaderboardWithUsers() {
  return activeContentDataSource.getLeaderboardWithUsers();
}
