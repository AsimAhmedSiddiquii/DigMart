function subscribe(sellerID) {
    $.ajax({
        url: "/subscription/add-subscription/" + sellerID,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
            if (res.login) {
                swal('Subscribed', 'You will now receive updates from the Seller', 'success')
                    .then((result) => {
                        window.location.reload()
                    })
            } else {
                $('#loginpopup').modal('show');
            }
        }
    })
}

function unsubscribe(sellerID) {
    $.ajax({
        url: "/subscription/remove-subscription/" + sellerID,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
            if (res.login) {
                swal('Unsubscribed', 'Seller Removed from your subscription list', 'success')
                    .then((result) => {
                        window.location.reload()
                    })
            } else {
                $('#loginpopup').modal('show');
            }
        }
    })
}