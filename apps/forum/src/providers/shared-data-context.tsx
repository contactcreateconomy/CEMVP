"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import type { Category } from "@/types";

interface SharedData {
  categories: Category[];
  categoriesLoading: boolean;
  unreadNotificationCount: number;
}

const SharedDataContext = createContext<SharedData>({
  categories: [],
  categoriesLoading: true,
  unreadNotificationCount: 0,
});

export function useSharedData() {
  return useContext(SharedDataContext);
}

function SharedDataProviderInner({ children }: { children: ReactNode }) {
  const rawCategories = useQuery(api.forum.queries.listCategories, {});
  const unreadCount = useQuery(api.forum.queries.getUnreadNotificationCount, {});

  const value: SharedData = {
    categories: (rawCategories as Category[] | undefined) ?? [],
    categoriesLoading: rawCategories === undefined,
    unreadNotificationCount: unreadCount ?? 0,
  };

  return <SharedDataContext.Provider value={value}>{children}</SharedDataContext.Provider>;
}

export function SharedDataProvider({ children }: { children: ReactNode }) {
  if (!isConvexConfigured()) {
    return (
      <SharedDataContext.Provider
        value={{ categories: [], categoriesLoading: false, unreadNotificationCount: 0 }}
      >
        {children}
      </SharedDataContext.Provider>
    );
  }
  return <SharedDataProviderInner>{children}</SharedDataProviderInner>;
}
