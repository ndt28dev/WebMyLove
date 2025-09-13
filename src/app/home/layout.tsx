// app/layout.tsx (bọc toàn site)
"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@mantine/core";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      123
      {/* <Header />
      <Container fluid>{children}</Container>
      <Footer /> */}
    </>
  );
}
