import { images } from "@/modules/data/home/HomeData";
import { Box, Group, Image } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Slideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box style={{ position: "relative", width: "100%" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <Image
            src={images[index]}
            alt={`Ảnh ${index + 1}`}
            radius="md"
            fit="cover"
            w="100%"
            h="500px"
          />
        </motion.div>
      </AnimatePresence>
      <Group
        gap="xs"
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {images.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: 22,
              height: 5,
              borderRadius: 5,
              cursor: "pointer",
              backgroundColor:
                i === index ? "rgba(255,105,180,1)" : "rgba(255,255,255,0.5)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Group>
    </Box>
  );
}
