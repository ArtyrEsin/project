const burger = document.getElementById("burger");
const menu = document.querySelector(".menu");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

burger.addEventListener("click", function () {
  menu.classList.toggle("show");
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