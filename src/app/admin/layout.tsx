"use client";

import { Container, Flex } from "@mantine/core";
import HeaderAdmin from "@/components/HeaderAdmin";
import { NavbarSimple } from "@/container/admin/NavbarSimple";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderAdmin />
      <Flex>
        <NavbarSimple />
        {children}
      </Flex>
    </>
  );
}
