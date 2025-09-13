"use client";
import { Button } from "@mantine/core";
import { ReactNode } from "react";

interface MyButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: number | "xs" | "sm" | "md" | "lg" | "xl";
}

export default function MyButton({
  children,
  icon,
  onClick,
  color = "#ff4d6d",
  size = "md",
  radius = "xl",
}: MyButtonProps) {
  return (
    <Button
      onClick={onClick}
      size={size}
      radius={radius}
      leftSection={icon}
      style={{
        backgroundColor: color,
      }}
    >
      {children}
    </Button>
  );
}
