//Process add time modal form
$('#addTimeModal form').submit(function (event) {
    event.preventDefault();
    let data = { 
        noRedirect: true
    };
    $.ajax({
        type: 'POST',
        url: '/time',
        data: $(this).serialize() + "&noRedirect=1",
        success: res => {
            console.log("Added new time chunk. Msg: " + res.message);
            // close modal
            $('#addTimeModal').modal('toggle');
            // reload calendar view
            calendar.refetchEvents();
        }
    });
});

//Process edit time modal form
$('#editTimeModal form').submit(function (event) {
    event.preventDefault();
    let data = { 
        noRedirect: true
    };
    $.ajax({
        type: 'PUT',
        url: '/time/' + $('#editTimeModal input[name="timeid"]').val() + '?_method=PUT', 
        data: $(this).serialize() + "&noRedirect=1&process=all",
        success: res => {
            console.log("Edited time chunk. Msg: " + res.message);
            // close modal
            $('#editTimeModal').modal('toggle');
            // reload calendar view
            calendar.refetchEvents();
        }
    });
});