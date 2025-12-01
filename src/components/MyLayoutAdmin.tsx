import { Divider, Stack, Title } from "@mantine/core";

type Props = {
  children: React.ReactNode;
  title: string;
};

export default function MyLayoutAdmin({ children, title }: Props) {
  return (
    <Stack
      gap={"sm"}
      p={"sm"}
      w={"100%"}
      style={{ borderLeft: "1px solid #ccc" }}
    >
      <Title order={2}>{title}</Title>
      <Divider />
      {children}
    </Stack>
  );
}
