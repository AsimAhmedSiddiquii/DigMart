function check(abc) {
    btnval = abc.value;

    if (document.getElementById(btnval + "accept").classList.contains("active")) {
        document.getElementById(btnval + "accept").classList.remove("active");
    }
    if (document.getElementById(btnval + "reject").classList.contains("active")) {
        document.getElementById(btnval + "reject").classList.remove("active");
    }
    document.getElementById(abc.id).classList.add("active");
    if (document.getElementById(btnval + "accept").classList.contains("active")) {
        var status="Verified"
    }else{
        var status="Rejected"
    }
    $.ajax({
        url: "/admin/verification/verify-variant",
        type: "POST",
        data: {
            variantID: btnval,
            status: status,
        },
    })
}

function checkvariant(id,status) {
    $.ajax({
        url: "/admin/verification/check-variant",
        type: "POST",
        data: {
            productID: id,
            status: status,
        },
        dataType: 'json',
        success: function (result) {
            if (result.status){
                window.location.href='/admin/verification/accept-product/'+id
            }else{
                alert("Pending Variants are remaining")
            } 
        }
    })
}