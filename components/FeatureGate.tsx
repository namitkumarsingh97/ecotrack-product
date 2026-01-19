"use client";

import { ReactNode, useEffect, useState } from "react";
import { hasFeature } from "@/lib/features";

interface FeatureGateProps {
  featureId: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Component to conditionally render content based on feature access
 */
export default function FeatureGate({
  featureId,
  children,
  fallback,
  showUpgrade = false,
}: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hasFeature(featureId).then((access) => {
      setHasAccess(access);
      setLoading(false);
    });
  }, [featureId]);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgrade) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          <p className="font-semibold mb-1">Feature Not Available</p>
          <p>This feature requires a higher plan. Please upgrade to access.</p>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

