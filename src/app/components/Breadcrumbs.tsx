import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemType {
  text: string;
  link?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemType[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <BreadcrumbItem key={index}>
              {item.link ? (
                <BreadcrumbLink asChild>
                  <Link href={item.link}>{item.text}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.text}</BreadcrumbPage>
              )}
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
