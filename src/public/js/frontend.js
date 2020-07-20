// Flatpickr selector
flatpickr(".flatpickr-datetime", {
    enableTime: true,
    altInput: true,
    altFormat: "H:i - F j, Y",
    dateFormat: "Y-m-d H:i",
});

// Select2 (with search) initialization
$(document).ready(function() {
    $('.select-basic-single').select2();
});

// Grab calendar view url parameters if present
const urlParams = new URLSearchParams(window.location.search);
let calView = urlParams.get('view');
if (!calView) {
    calView = 'timeGridDay'; // default
}

// FullCalendar initialization
const calendarEl = document.getElementById('calendar');
if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: { center: 'dayGridMonth,timeGridWeek,timeGridDay' },
        initialView: calView,
        allDaySlot: false,
        events: {
            url: '/time/data/',
            method: 'POST',
            extraParams: {
                auth: 'something'
            },
            failure: function() {
              alert('Error while fetching time.');
            }
        },
        editable: true,
        eventChange: update => {
            console.log(update.event.title + " - event resized or moved.");
            let data = { 
                process: 'dates', // all or dates
                noRedirect: true,
                startDate: update.event.start,
                endDate: update.event.end
            };
            $.ajax({
                type: 'PUT',
                url: '/time/' + update.event.id + '?_method=PUT',
                dataType: 'json',
                data: data,
                success: res => {
                    console.log("Updated chunk time to backend. Msg: " + res.message);
                }
            });
        }
    });
    calendar.render();
}
