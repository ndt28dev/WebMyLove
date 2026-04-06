"use client";

import { useState } from "react";
import {
  Card,
  Image,
  Text,
  Grid,
  Modal,
  Title,
  AspectRatio,
  SegmentedControl,
  Flex,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IPhotoAlbum } from "@/modules/interface/IPhotoAlbum";

// Hàm tính số lượng ảnh / video
function countImages(album?: IPhotoAlbum | null): number {
  if (!album?.photos) return 0;
  return album.photos.reduce((n, p) => n + (p.type === "image" ? 1 : 0), 0);
}

function countVideos(album?: IPhotoAlbum | null): number {
  if (!album?.photos) return 0;
  return album.photos.reduce((n, p) => n + (p.type === "video" ? 1 : 0), 0);
}

function hasVideo(album?: IPhotoAlbum | null): boolean {
  if (!album?.photos) return false;
  return album.photos.some((p) => p.type === "video");
}

// Component chính
export default function PhotosHome() {
  const [opened, setOpened] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<IPhotoAlbum | null>(null);
  const [value, setValue] = useState<"image" | "video">("image");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{ url: string } | null>(null);

  // Fetch albums + photos
  const {
    data: albums = [],
    isLoading,
    error,
  } = useQuery<IPhotoAlbum[]>({
    queryKey: ["albums"],
    queryFn: async () => {
      const res = await fetch(
        "https://mylove-backend-server-production.up.railway.app/api/photos"
      );
      if (!res.ok) throw new Error("Không lấy được dữ liệu photos");
      return res.json();
    },
  });

  const openAlbum = (album: IPhotoAlbum) => {
    setSelectedAlbum(album);
    setOpened(true);
    setValue("image"); // default view
  };

  if (isLoading) return <Text>Đang tải dữ liệu...</Text>;
  if (error) return <Text>Lỗi tải dữ liệu</Text>;

  const numImages = countImages(selectedAlbum);
  const numVideos = countVideos(selectedAlbum);

  console.log(albums);

  return (
    <>
      <Grid>
        {albums.map((album) => (
          <Grid.Col key={album.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              p="xs"
              shadow="sm"
              radius="sm"
              withBorder
              onClick={() => openAlbum(album)}
              style={{ cursor: "pointer", overflow: "hidden" }}
            >
              <Image
                src={`https://mylove-backend-server-production.up.railway.app/public${album.coverImage}`}
                alt={album.title}
                height={300}
                radius="sm"
              />
              <Text fw={600} mt="sm" size="lg">
                {album.title}
              </Text>
              <Text size="sm" c="dimmed">
                {album.description}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="100%"
        title={<Title order={3}>{selectedAlbum?.title}</Title>}
        zIndex={1000}
      >
        <Flex align="center" justify="space-between" mb="md">
          {value === "image" && (
            <Text c="#FF4D6D" mr="md">
              {numImages} ảnh
            </Text>
          )}
          {value === "video" && (
            <Text c="#FF4D6D" mr="md">
              {numVideos} video
            </Text>
          )}
          {hasVideo(selectedAlbum) && (
            <SegmentedControl
              value={value}
              onChange={(value: string) => setValue(value as "image" | "video")}
              data={[
                { label: "Ảnh", value: "image" },
                { label: "Video", value: "video" },
              ]}
            />
          )}
        </Flex>

        <Grid h="100%">
          {selectedAlbum?.photos.map((media) => {
            if (media.type === "image" && value === "image") {
              return (
                <Grid.Col key={media.id} span={{ base: 12, md: 4, lg: 3 }}>
                  <Card shadow="sm" padding={4} radius="md" withBorder>
                    <Card.Section>
                      <AspectRatio ratio={16 / 9}>
                        <Image
                          src={`https://mylove-backend-server-production.up.railway.app/public${media.url}`}
                          alt={media.caption || "Ảnh kỷ niệm"}
                          h={240}
                          fit="cover"
                          style={{ cursor: "zoom-in" }}
                          onClick={() => {
                            setPreview({
                              url: `https://mylove-backend-server-production.up.railway.app/public${media.url}`,
                            });
                            setPreviewOpen(true);
                          }}
                        />
                      </AspectRatio>
                    </Card.Section>
                  </Card>
                </Grid.Col>
              );
            }

            if (media.type === "video" && value === "video") {
              return (
                <Grid.Col key={media.id} span={{ base: 12, md: 6, lg: 6 }}>
                  <Card shadow="sm" padding={4} radius="md" withBorder>
                    <Card.Section>
                      <AspectRatio>
                        <video
                          src={`https://mylove-backend-server-production.up.railway.app/public${media.url}`}
                          controls
                          playsInline
                          preload="false"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </AspectRatio>
                    </Card.Section>
                  </Card>
                </Grid.Col>
              );
            }

            return null;
          })}
        </Grid>
      </Modal>

      <Modal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        centered
        size="auto"
        padding={0}
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.85, blur: 2 }}
        styles={{
          content: { background: "transparent", boxShadow: "none" },
          body: { padding: 0 },
        }}
        zIndex={5000}
      >
        {preview && (
          <Image
            src={preview.url}
            maw="95vw"
            mah="95vh"
            fit="contain"
            style={{ cursor: "zoom-out" }}
            onClick={() => setPreviewOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}
