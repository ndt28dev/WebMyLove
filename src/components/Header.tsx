import { IconChevronDown } from "@tabler/icons-react";
import {
  Box,
  Burger,
  Center,
  Container,
  Group,
  Image,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "@/styles/HeaderMenu.module.css";
import Link from "next/link";
import { menuHeader } from "@/modules/data/MenuHeader";

export default function Header() {
  const [opened, { toggle }] = useDisclosure(false);

  const items = menuHeader.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link} component={Link} href={item.link}>
        {item.label}
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <a href={link.link} className={classes.link}>
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={14} stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Link key={link.label} href={link.link || "#"} className={classes.link}>
        {link.label}
      </Link>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="lg">
        <div className={classes.inner}>
          <Link href="/home">
            <Image
              src="/img/logo.png"
              alt="logo"
              w="80px"
              h="80px"
              fit="contain"
            />
          </Link>
          <Group gap={5} visibleFrom="sm">
            {items}
          </Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </div>
      </Container>
    </header>
  );
}
