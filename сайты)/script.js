const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
const searchInput = document.getElementById("searchInput");
const productsList = document.getElementById("productsList");
const productCards = document.querySelectorAll(".product-card");
const emptyText = document.getElementById("emptyText");
const buyButtons = document.querySelectorAll(".buy-btn");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

burger.addEventListener("click", function () {
  menu.classList.toggle("show");
});

searchInput.addEventListener("input", function () {
  const value = searchInput.value.toLowerCase().trim();
  let visibleCount = 0;

  productCards.forEach(function (card) {
    const name = card.dataset.name.toLowerCase();

    if (name.includes(value)) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  if (visibleCount === 0) {
    emptyText.textContent = "Товары не найдены.";
  } else {
    emptyText.textContent = "";
  }
});

buyButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    alert("Товар добавлен в корзину.");
  });
});

contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name === "" || email === "" || message === "") {
    formMessage.textContent = "Заполните все поля.";
    return;
  }

  formMessage.textContent = "Сообщение успешно отправлено!";
  contactForm.reset();
});