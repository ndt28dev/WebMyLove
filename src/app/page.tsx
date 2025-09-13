"use client";
import { useEffect, useState } from "react";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MyButton from "@/components/MyButton";
import { IconHeart } from "@tabler/icons-react";

export default function WelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Container
        fluid
        style={{
          height: "100vh",
          backgroundImage: `url(https://cdn.vinaenter.edu.vn/wp-content/uploads/2024/06/hinh-nen-yeu-nhau-cute-1.jpg)`,
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="heart-loader" />
        <style jsx>{`
          .heart-loader {
            width: 80px;
            height: 80px;
            background: #ff4d6d;
            position: relative;
            transform: rotate(-45deg);
            animation: beat 1s infinite;
          }
          .heart-loader::before,
          .heart-loader::after {
            content: "";
            width: 80px;
            height: 80px;
            background: #ff4d6d;
            border-radius: 50%;
            position: absolute;
          }
          .heart-loader::before {
            top: -40px;
            left: 0;
          }
          .heart-loader::after {
            left: 40px;
            top: 0;
          }
          @keyframes beat {
            0% {
              transform: scale(1) rotate(-45deg);
            }
            25% {
              transform: scale(1.2) rotate(-45deg);
            }
            50% {
              transform: scale(1) rotate(-45deg);
            }
            75% {
              transform: scale(1.2) rotate(-45deg);
            }
            100% {
              transform: scale(1) rotate(-45deg);
            }
          }
        `}</style>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{ height: "100vh", width: "100%" }}
    >
      <Container
        style={{
          height: "100vh",
          width: "100%",
          backgroundImage: "url('/img/bgr1.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
        }}
      >
        <Stack
          align="center"
          style={{
            background: "rgba(0,0,0,0.09)",
            padding: "1rem 2rem",
            borderRadius: "20px",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          <Title
            order={1}
            size="2.8rem"
            c="#ff4d6d"
            ta="center"
            fw={900}
            style={{ lineHeight: 1.2 }}
          >
            Gửi đến người anh yêu nhất
          </Title>

          <Text
            size="lg"
            c="black"
            fw={400}
            style={{
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            “Mỗi nhịp tim anh đều thì thầm tên em... Xin mời em bước vào thế
            giới nhỏ bé đầy yêu thương này.”
          </Text>

          <MyButton
            icon={<IconHeart size={18} />}
            size="lg"
            onClick={() => router.push("/pass")}
          >
            Khám phá tình yêu
          </MyButton>
        </Stack>
      </Container>
    </motion.div>
  );
}
