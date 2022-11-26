function selectedsubcat(a) {
    var rem = document.querySelector('.selected').id;
    var remID = document.getElementById(rem);
    $(remID).removeClass("selected active");
    var tabID = document.getElementById(a.id);
    $(tabID).addClass('selected');
}

$(document).ready(function() {
    var navID = $('#firstnav').val()
    var tabID = $('#firsttab').val()
    $(navID).attr('aria-selected', true);
    $(navID).addClass("active");
    $(tabID).addClass("active show");
})

window.onload = navScroll

function navScroll() {
    var el = document.getElementById('nav-tab')
    if (el.scrollWidth > el.clientWidth) {
        $('#navLeft').css('display', 'block')
        $('#navRight').css('display', 'block')
    } else {
        $('#navLeft').css('display', 'none')
        $('#navRight').css('display', 'none')
    }
    $("#navLeft").on("click", function() {
        el.scrollLeft -= 50
    })

    $("#navRight").on("click", function() {
        el.scrollLeft += 50
    })
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

function copyFunction() {
    navigator.clipboard.writeText(window.location.href);
    swal({ title: 'Link Copied', icon: 'success' })
}

function shareonWhatsApp() {
    var link = window.location.href
    window.open('https://wa.me?' + link, '_blank')
}

function searchProd(el, tab) {
    const products = document.querySelectorAll(tab + ' .prodContainer');
    var value = el.value.trim().toLowerCase()
    if (value != '') {
        products.forEach((prod) => {
            if (prod.querySelector('.prodName').innerHTML.trim().toLowerCase().includes(value)) {
                prod.style.display = 'block'
            } else {
                prod.style.display = 'none'
            }
        })
    } else {
        products.forEach((prod) => {
            prod.style.display = 'block'
        })
    }
}

function sortProd(val, tab) {
    var products = Array.from(document.querySelectorAll(tab + ' .prodContainer'))
    switch (val) {
        case 'Price Low to High':
            prodSort('.prodPrice', 'ascend')
            break
        case 'Price High to Low':
            prodSort('.prodPrice', 'descend')
            break
        case 'Discounts':
            prodSort('.prodDiscount', 'descend')
            break
        default:
            products.forEach((prod) => {
                prod.style.order = ''
            })
            break
    }

    function prodSort(selector, type) {
        var productsWithout = []
        var productsWith = []
        if (selector == '.prodDiscount') {
            products.forEach((prod) => {
                if (prod.querySelector(selector) == null) {
                    productsWithout.push(prod)
                    prod.style.order = products.length
                } else
                    productsWith.push(prod)
            })
            products = productsWith
        }

        products.sort(function(a, b) {
            a = a.querySelector(selector).innerHTML
            b = b.querySelector(selector).innerHTML
            if (type == 'ascend')
                return a - b
            else
                return b - a
        })

        var i = 1
        products.forEach((prod) => {
            prod.style.order = i
            i++
        })
    }
}

function shareviaMail(sellerName) {
   window.location.href = 'mailto:?Subject=Check this Seller on DigMart&body=Hey!%0D%0DI found a seller ' + sellerName +' on DigMart.%0D%0DFollow this link: ' + window.location.href+'%0D'; 
}