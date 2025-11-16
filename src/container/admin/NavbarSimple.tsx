"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLogout, IconSwitchHorizontal } from "@tabler/icons-react";
import { Code, Group, Image } from "@mantine/core";
import classes from "../../styles/NavbarSimple.module.css";
import { navbarAdmin } from "@/modules/data/admin/data";

export function NavbarSimple() {
  const [active, setActive] = useState("Thống kê");
  const router = useRouter();

  const links = navbarAdmin.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link} // vẫn giữ href để support right-click / open in new tab
      key={item.label}
      onClick={(event) => {
        event.preventDefault(); // chặn reload mặc định
        setActive(item.label); // giữ highlight ngay khi click
        router.push(item.link); // điều hướng client-side (không reload)
      }}
      role="link"
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Image
            src="/img/logo.png"
            alt="logo"
            w="60px"
            h="60px"
            fit="contain"
          />
          <Code fw={700} fs={"italic"} c={"brand.5"} bg={"brand.1"}>
            v1.1.0
          </Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a
          href="#"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
