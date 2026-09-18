// Change website message

const changeBtn = document.getElementById("changeBtn");
const message = document.getElementById("message");

changeBtn.addEventListener("click", function () {

    message.innerText =
        "🎉 Great! You changed the website using JavaScript.";

    changeBtn.innerText = "Message Changed";

});


// Button counter

const countBtn = document.getElementById("countBtn");
const countText = document.getElementById("count");

let count = 0;

countBtn.addEventListener("click", function () {

    count++;

    countText.innerText = count;

});


// Dark / Light theme

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {

        themeBtn.innerText = "☀️";

    } else {

        themeBtn.innerText = "🌙";

    }

});