const shareBtn = document.querySelector('.share-btn');
const shareOptions = document.querySelector('.share-options');
const sharelink = document.querySelector('.link-text');
sharelink.innerHTML = window.location.href
shareBtn.addEventListener('click', () => {
    shareOptions.classList.toggle('active');
})

function copyFunction() {
    navigator.clipboard.writeText(sharelink.innerHTML);
    var copybtn = document.querySelector('.copy-btn');
    copybtn.innerHTML = "Copied"
}

function addwishlist(element, sellerID, productID, variantID) {
    if (document.getElementById("0size")) {
        var size = document.getElementById(count + 'size').innerText;
    } else {
        size = null;
    }

    $.ajax({
        url: "/wishlist/add-to-wishlist",
        type: "POST",
        data: {
            sellerID: sellerID,
            productID: productID,
            variantID: variantID,
            size: size,
        },
        dataType: 'json',
        success: function(result) {
            if (result.login) {
                if (result.already) {
                    element.classList.add('i-red');
                    swal({
                        title: 'Wishlisted',
                        text: 'Product already in your Wishlist',
                        icon: 'info',
                        buttons: ['Close', 'Go to Wishlist']
                    }).then((value) => {
                        if (value) {
                            window.location = '/wishlist'
                        }
                    })
                } else {
                    element.classList.add('i-red');
                    swal({
                        title: 'Wishlisted',
                        text: 'Product added to Wishlist',
                        icon: 'success',
                        buttons: ['Close', 'Go to Wishlist']
                    }).then((value) => {
                        if (value) {
                            window.location = '/wishlist'
                        }
                    })
                }
            } else {
                $('#loginpopup').modal('show');
            }
        }
    })
}

function addcart(sellerID, productID, variantID, colour) {
    if (document.getElementById("0size")) {
        size = document.getElementById(count + 'size').innerText;
    } else {
        size = null;
    }

    $.ajax({
        url: "/cart/add-to-cart",
        type: "POST",
        data: {
            sellerID: sellerID,
            productID: productID,
            variantID: variantID,
            size: size,
            colour: colour,
        },
        dataType: 'json',
        success: function(result) {
            if (result.login) {
                if (result.status) {
                    swal({
                        title: 'Success',
                        text: 'Product added to your shopping cart',
                        icon: 'success',
                        buttons: ['Close', 'Go to cart']
                    }).then((value) => {
                        if (value) {
                            window.location = '/cart'
                        }
                    })
                } else {
                    swal({
                        title: 'Success',
                        text: 'Product already in your cart',
                        icon: 'success',
                        buttons: ['Close', 'Go to cart']
                    }).then((value) => {
                        if (value) {
                            window.location = '/cart'
                        }
                    })
                }
            } else {
                $('#loginpopup').modal('show');
            }

        }
    })
}

var swiper = new Swiper(".swiper", {
    slidesPerView: 5,
    spaceBetween: 20,
    slidesPerGroup: 1,
    fade: 'true',
    keyboard: {
        enabled: true,
    },
    navigation: {
        nextEl: "#nextProductBtn",
        prevEl: "#prevProductBtn",
    },
});

function check(productID) {
    $.ajax({
        url: "/review/checkprof",
        type: "POST",
        data: {
            productID: productID,
        },
        dataType: 'json',
        success: function(result) {
            if (result.status) {
                if (result.status == 'login') {
                    $('#loginpopup').modal('show');
                } else if (result.status == 'Reviewed') {
                    swal('Thank You', 'You have reviewed the Product', 'warning')
                } else if (result.status == 'noOrders') {
                    swal('Sorry', 'You need to purchase this product before adding a review!', 'error')
                } else {
                    $('#review-modal').modal('show');
                }
            } else {
                swal('Sorry', 'Complete your profile to give a review!', 'warning')
                    .then((value) => {
                        window.location = '/account';
                    })
            }
        }
    })
}

function show(element) {
    var hidden = document.getElementById("hidden-reviews");
    if (hidden.style.display == "none") {
        hidden.style.display = "inline"
        element.innerHTML = "<i class='fas fa-arrow-up'></i> Hide Reviews"
    } else {
        hidden.style.display = "none"
        element.innerHTML = "<i class='fas fa-arrow-down'></i> View all reviews"
    }
}

function shareonWhatsApp() {
    var link = window.location.href
    window.open('https://wa.me?' + link, '_blank')
}