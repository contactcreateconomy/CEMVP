"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
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
  const ensureCategories = useMutation(api.forum.mutations.ensureForumCategories);
  const [taxonomyEnsureInFlight, setTaxonomyEnsureInFlight] = useState(false);
  const taxonomyEnsureStarted = useRef(false);

  const categoriesEmpty =
    rawCategories !== undefined && Array.isArray(rawCategories) && rawCategories.length === 0;

  useLayoutEffect(() => {
    if (rawCategories === undefined || !categoriesEmpty) {
      return;
    }
    if (taxonomyEnsureStarted.current) {
      return;
    }
    taxonomyEnsureStarted.current = true;
    setTaxonomyEnsureInFlight(true);
    void ensureCategories({}).finally(() => {
      setTaxonomyEnsureInFlight(false);
    });
  }, [rawCategories, categoriesEmpty, ensureCategories]);

  const categoriesLoading =
    rawCategories === undefined || (categoriesEmpty && taxonomyEnsureInFlight);

  const value: SharedData = {
    categories: (rawCategories as Category[] | undefined) ?? [],
    categoriesLoading,
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
