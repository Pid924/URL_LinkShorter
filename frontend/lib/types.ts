export interface ShortLink {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  iosUrl: string | null;
  androidUrl: string | null;
  createdDate: string;
  modifiedDate: string;
  lastUsedDate: string | null;
  totalUsed: number;
  isEnabled: boolean;
}

export interface CreateLinkInput {
  originalUrl: string;
  iosUrl?: string;
  androidUrl?: string;
  customCode?: string;
}

export interface UpdateLinkInput {
  originalUrl?: string;
  iosUrl?: string;
  androidUrl?: string;
  clearIosUrl?: boolean;
  clearAndroidUrl?: boolean;
  isEnabled?: boolean;
}
