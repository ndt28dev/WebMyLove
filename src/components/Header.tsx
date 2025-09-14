"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Burger,
  Center,
  Container,
  Drawer,
  Group,
  Image,
  Menu,
  NavLink,
  ScrollArea,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "@/styles/HeaderMenu.module.css";
import { menuHeader } from "@/modules/data/MenuHeader";

export default function Header() {
  const [opened, { toggle, close, open }] = useDisclosure(false);
  const pathname = usePathname();

  const isSelfActive = (href?: string, exact?: boolean) => {
    if (!href) return false;
    return exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
  };

  const desktopItems = menuHeader.map((link) => {
    const children = link.links ?? [];
    const childActive = children.some(
      (c) => pathname === c.link || pathname.startsWith(c.link + "/")
    );
    const selfActive = isSelfActive(link.link, link.exact);
    const isActive = childActive || selfActive;

    if (children.length) {
      const menuItems = children.map((item) => (
        <Menu.Item
          key={item.link}
          component={Link}
          href={item.link}
          className={
            isSelfActive(item.link) ? classes.menuItemActive : undefined
          }
        >
          {item.label}
        </Menu.Item>
      ));

      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <UnstyledButton
              className={`${classes.link} ${
                isActive ? classes.linkActive : ""
              }`}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={14} stroke={1.5} />
              </Center>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Link
        key={link.label}
        href={link.link || "#"}
        className={`${classes.link} ${isActive ? classes.linkActive : ""}`}
      >
        {link.label}
      </Link>
    );
  });

  const mobileItems = menuHeader.map((link) => {
    const children = link.links ?? [];
    const childActive = children.some(
      (c) => pathname === c.link || pathname.startsWith(c.link + "/")
    );

    if (children.length) {
      return (
        <NavLink
          key={link.label}
          label={link.label}
          defaultOpened={childActive}
          active={childActive}
          leftSection={<IconChevronDown size={14} />}
        >
          {children.map((c) => (
            <NavLink
              key={c.link}
              label={c.label}
              component={Link}
              href={c.link}
              active={pathname === c.link || pathname.startsWith(c.link + "/")}
              onClick={close}
            />
          ))}
        </NavLink>
      );
    }

    return (
      <NavLink
        key={link.label}
        label={link.label}
        component={Link}
        href={link.link ?? "#"}
        active={isSelfActive(link.link, link.exact)}
        onClick={close}
      />
    );
  });

  return (
    <header className={classes.header}>
      <Container size="lg">
        <div className={classes.inner}>
          <Link href="/home" onClick={close}>
            <Image
              src="/img/logo.png"
              alt="logo"
              w="80px"
              h="80px"
              fit="contain"
            />
          </Link>

          <Group gap={5} visibleFrom="sm">
            {desktopItems}
          </Group>

          <Burger
            opened={opened}
            onClick={opened ? close : open}
            size="sm"
            hiddenFrom="sm"
            aria-label="Mở menu"
          />
        </div>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title={
          <Link href="/home" onClick={close}>
            <Image src="/img/logo.png" alt="logo" w={48} h={48} fit="contain" />
          </Link>
        }
        hiddenFrom="sm"
      >
        <ScrollArea h="calc(100vh - 120px)">{mobileItems}</ScrollArea>
      </Drawer>
    </header>
  );
}
