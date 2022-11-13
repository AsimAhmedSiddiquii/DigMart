$('#nav0').removeClass("collapsed");
$('#nav0').find(".toggleicon").toggleClass("caretup");
$('#nav0').addClass("down");
$('#nav-0').addClass("show");
$('#nav-0').addClass("show");
$('#nav-0-0').addClass("active selected");
$('#tab-0-0').addClass("active show");

function selectedsubcat(a) {
    var rem = document.querySelector('.selected').id;
    var remID = document.getElementById(rem);
    $(remID).removeClass("selected active");
    var tabID = document.getElementById(a.id);
    $(tabID).addClass('selected');
}

function wishlist(element, sellerID, productID, variantID, size) {
    if ($("#hidLogin").val()) {
        if (!element.classList.contains('i-red'))
            $.ajax({
                url: "/wishlist/add-product",
                type: "POST",
                data: {
                    sellerID: sellerID,
                    productID: productID,
                    variantID: variantID,
                    size: size,
                },
                dataType: 'json',
                success: function(result) {
                    if (result.status)
                        element.classList.add('i-red')
                }
            })
        else
            $.ajax({
                url: "/wishlist/remove-product",
                type: "POST",
                data: {
                    sellerID: sellerID,
                    productID: productID,
                    variantID: variantID,
                    size: size,
                },
                dataType: 'json',
                success: function(result) {
                    if (result.status)
                        element.classList.remove('i-red');
                }
            })
    } else {
        $('#loginpopup').modal('show');
    }
}

function openProduct(productID, variantID) {
    if (variantID) {
        location.href = '/product/variant/' + variantID
    } else {
        location.href = '/product/view-product/' + productID
    }
}

function showmodal(imgsrc) {
    $('#singleimg').attr('src', imgsrc)
    $('#imageModal').modal('show');
}


function showgallery() {
    $('#product-tab-pane').removeClass("active");
    $('#gallery-tab').addClass("active");
    $('#product-tab-pane').removeClass("active show");
    $('#gallery-tab-pane').addClass("active show");
    document.getElementById("gallery-tab-pane").scrollIntoView(true);
}

$(function() {
    $(".maindropdown").on("click", function() {
        $(this).find(".toggleicon").toggleClass("caretup");
        $(this).addClass("down");
        var rem = document.querySelector('.down').id;
        var navID = document.getElementById(rem);
        if (this != navID) {
            $(navID).removeClass("down");
            $(navID).addClass("collapsed");
            $(navID).find(".toggleicon").toggleClass("caretup");
            var sidebargrpID = document.getElementsByClassName('sidebargrp show');
            $(sidebargrpID).removeClass("show");
        }
    });
});