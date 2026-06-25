const sliderTrack = document.querySelector(".slider-track");

const sliderProducts = [
  {
    title: "Anua Toner",
    image: "./images/products/anua.jpg"
  },

  {
    title: "Skin1004",
    image: "./images/products/skin1004.jpg"
  },

  {
    title: "COSRX",
    image: "./images/products/cosrx.jpg"
  }
];

sliderProducts.forEach((item) => {

  sliderTrack.innerHTML += `
  
    <div class="slide">

      <img src="${item.image}" alt="">

      <h3>${item.title}</h3>

    </div>
  
  `;
});