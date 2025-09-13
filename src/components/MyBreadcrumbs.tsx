"use client";

import Link from "next/link";
import { Breadcrumbs, Anchor, Text } from "@mantine/core";

interface ItemBreadcrumbs {
  title: string;
  href: string;
}
interface MyBreadcrumbsProps {
  data: ItemBreadcrumbs[];
}

export default function MyBreadcrumbs({ data }: MyBreadcrumbsProps) {
  return (
    <Breadcrumbs>
      {data.map((item, idx) => {
        const isLast = idx === data.length - 1;

        if (isLast) {
          return <Text key={item.href}>{item.title}</Text>;
        }

        return (
          <Anchor
            key={item.href}
            component={Link}
            href={item.href}
            c={"#FF4D6D"}
          >
            {item.title}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
