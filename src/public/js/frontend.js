// flatpickr selector
flatpickr(".flatpickr-datetime", {
    enableTime: true,
    altInput: true,
    altFormat: "H:i - F j, Y",
    dateFormat: "Y-m-d H:i",
});

$(document).ready(function() {
    $('.select-basic-single').select2();
});