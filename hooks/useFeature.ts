"use client";

import { useState, useEffect } from "react";
import { hasFeature } from "@/lib/features";

/**
 * React hook for checking feature access
 */
export function useFeature(featureId: string): { hasAccess: boolean; loading: boolean } {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hasFeature(featureId).then((access) => {
      setHasAccess(access);
      setLoading(false);
    });
  }, [featureId]);

  return { hasAccess, loading };
}

