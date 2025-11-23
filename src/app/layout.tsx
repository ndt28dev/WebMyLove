import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";

export const metadata = {
  title: "My Love",
  description: "I have followed setup instructions carefully",
};

// import component client riêng
import ClientProvider from "./ClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
