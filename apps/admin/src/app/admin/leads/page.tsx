"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeadsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/products");
  }, [router]);
  return null;
}
