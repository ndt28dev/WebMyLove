import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";
import "@mantine/carousel/styles.css";

export const metadata = {
  title: "My Love",
  description: "I have followed setup instructions carefully",
};

const theme = createTheme({
  colors: {
    brand: [
      "#FFF0F7", // 0 - hồng rất nhạt
      "#FFDBEB", // 1
      "#FFB3D2", // 2
      "#FF8AB8", // 3
      "#FF61A0", // 4
      "#FF3A89", // 5 - màu chính (primary)
      "#D52D72", // 6
      "#AB225A", // 7
      "#801843", // 8
      "#560F2D", // 9 - đậm nhất
    ],
  },
  primaryColor: "brand",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider defaultColorScheme="light" theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
