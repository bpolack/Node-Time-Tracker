// Flatpickr selector
flatpickr(".flatpickr-datetime", {
    enableTime: true,
    altInput: true,
    static: true,
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
let calendar;
if (calendarEl) {
    const addStart = document.querySelector("#addTimeStart")._flatpickr;
    const addEnd = document.querySelector("#addTimeEnd")._flatpickr;
    const editStart = document.querySelector("#editTimeStart")._flatpickr;
    const editEnd = document.querySelector("#editTimeEnd")._flatpickr;

    calendar = new FullCalendar.Calendar(calendarEl, {
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
        },
        dateClick: clicked => {
            console.log('Calendar clicked on: ' + clicked.dateStr);
            // Preload add modal dates
            addStart.setDate(clicked.date);
            addEnd.setDate(clicked.date.setHours(clicked.date.getHours() + 1));

            // Trigger open modal
            $('#addTimeModal').modal('toggle');
        },
        eventClick: clicked => {
            console.log('Event clicked: ' + clicked.event.title);
            // Clear all form fields
            $('#editTimeModal form')[0].reset();
            $("#editTimeSelect2").val(0).trigger('change');
            // Preload edit modal fields
            $('#editTimeModal input[name="timeid"]').val(clicked.event.id);
            $('#editTimeModal input[name="title"]').val(clicked.event.title);
            editStart.setDate(clicked.event.start);
            editEnd.setDate(clicked.event.end);
            if (clicked.event.extendedProps.project) {
                $("#editTimeSelect2").val(clicked.event.extendedProps.project._id).trigger('change');
            }
            $('#editTimeModal textarea[name="content"]').val(clicked.event.extendedProps.content);
            $('#editTimeModal input[name="refLink"]').val(clicked.event.extendedProps.refLink);

            // Trigger open modal
            $('#editTimeModal').modal('toggle');
        }
    });
    calendar.render();
}