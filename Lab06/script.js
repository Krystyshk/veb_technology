const pricePerNight = 1500;

const busyDates = [
  "2026-06-10",
  "2026-06-14",
  "2026-06-18",
  "2026-06-22",
  "2026-06-27",
  "2026-07-02"
];

let checkinDate = null;
let checkoutDate = null;

const result = document.getElementById("result");

function updateResult() {
  if (!checkinDate || !checkoutDate) {
    result.textContent = "Тривалість: 0 ночей, ціна: 0 грн";
    return;
  }

  const differenceMs = checkoutDate - checkinDate;
  const nights = differenceMs / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    result.textContent = "Дата виїзду має бути пізніше дати заїзду";
    return;
  }

  const totalPrice = nights * pricePerNight;

  result.textContent = `Тривалість: ${nights} ночей, ціна: ${totalPrice} грн`;

  console.log("Заїзд:", checkinDate);
  console.log("Виїзд:", checkoutDate);
  console.log("Ночей:", nights);
  console.log("Ціна:", totalPrice);
}

const checkinPicker = flatpickr("#checkin", {
  locale: "uk",
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: busyDates,

  onChange: function(selectedDates) {
    checkinDate = selectedDates[0];

    if (checkinDate) {
      checkoutPicker.set("minDate", checkinDate);
    }

    updateResult();
  }
});

const checkoutPicker = flatpickr("#checkout", {
  locale: "uk",
 dateFormat: "Y-m-d",
  minDate: "today",
  disable: busyDates,

  onChange: function(selectedDates) {
    checkoutDate = selectedDates[0];
    updateResult();
  }
});