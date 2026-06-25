const photoInput = document.querySelector("#photoInput");
const previewImage = document.querySelector("#previewImage");

photoInput.addEventListener("change", (event) => {

  const file = event.target.files[0];

  if (!file) return;

  previewImage.src = URL.createObjectURL(file);

});