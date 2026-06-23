const fallbackProductImages = [
  "image/Studio/studio_1.jpg",
  "image/Studio/studio_2.jpg",
  "image/Studio/studio_3.jpg",
  "image/Studio/studio_4.jpg",
  "image/stage/stage_1.jpg",
  "image/stage/stage_2.jpg",
  "image/stage/stage_3.jpg",
  "image/stands/stand_1.jpg",
  "image/stands/stand_2.webp",
  "image/cable/cable_1.jpg",
  "image/cable/cable_2.jpg",
  "image/minimalist/living_1.jpg"
];

async function loadProductImages() {
  let productImages = fallbackProductImages;

  try {
    const response = await fetch("./js/product-data.json/product-image-data.json/product-image-data.json");
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        productImages = data.map((item) => item.url).filter(Boolean);
      }
    }
  } catch (error) {
    productImages = fallbackProductImages;
  }

  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card, index) => {
    const imageBox = card.querySelector(".image-box");
    const imageUrl = index === 11
      ? "image/minimalist/living_1.jpg"
      : productImages[index] || fallbackProductImages[index % fallbackProductImages.length];

    if (!imageBox || !imageUrl) {
      return;
    }

    imageBox.innerHTML = "";

    const image = document.createElement("img");
    const titleText = card.querySelector(".brand")?.textContent?.trim() || card.children[2]?.textContent?.trim() || "상품 이미지";

    image.src = imageUrl;
    image.alt = titleText;
    image.loading = "lazy";
    image.decoding = "async";

    imageBox.appendChild(image);
  });
}

document.addEventListener("DOMContentLoaded", loadProductImages);