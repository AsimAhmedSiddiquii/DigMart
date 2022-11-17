var swiper = new Swiper(".categorySwiper", {
    slidesPerView: 6,
    spaceBetween: 20,
    slidesPerGroup: 1,
    // loop: true,
    // loopFillGroupWithBlank: true,
    fade: 'true',
    keyboard: {
        enabled: true,
    },
    navigation: {
        nextEl: "#nextCategoryBtn",
        prevEl: "#prevCategoryBtn",
    },

    breakpoints: {
        0: {
            slidesPerView: 1,
            spaceBetween: 10,
        },
        360: {
            slidesPerView: 2,
            spaceBetween: 10,
        },
        575: {
            slidesPerView: 3,
            spaceBetween: 10,
        },
        730: {
            slidesPerView: 4,
        },
        992: {
            slidesPerView: 5,
        },
        1175: {
            slidesPerView: 6,
        },
    },
});

var swiper = new Swiper(".sellerSwiper", {
    slidesPerView: 6,
    spaceBetween: 20,
    slidesPerGroup: 1,
    fade: 'true',
    keyboard: {
        enabled: true,
    },
    navigation: {
        nextEl: "#nextSellerBtn",
        prevEl: "#prevSellerBtn",
    },

    breakpoints: {
        0: {
            slidesPerView: 1,
            spaceBetween: 10,
        },
        360: {
            slidesPerView: 2,
            spaceBetween: 10,
        },
        575: {
            slidesPerView: 3,
            spaceBetween: 10,
        },
        730: {
            slidesPerView: 4,
        },
        992: {
            slidesPerView: 5,
        },
        1175: {
            slidesPerView: 6,
        },
    },
});

var swiper = new Swiper(".productSwiper", {
    slidesPerView: 5,
    spaceBetween: 20,
    slidesPerGroup: 1,
    fade: 'true',
    keyboard: {
        enabled: true,
    },
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: "#nextProductBtn",
        prevEl: "#prevProductBtn",
    },

    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        430: {
            slidesPerView: 2,
            spaceBetween: 5,
        },
        730: {
            slidesPerView: 3,
        },
        992: {
            slidesPerView: 4,
        },
        1175: {
            slidesPerView: 5,
        },
    },
});

document.addEventListener("DOMContentLoaded", function() {
    var myOffcanvas = document.getElementById('homeOffCanvas');
    var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
    document.getElementById("navbar-toggler").addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        bsOffcanvas.toggle();
    });
});

function wishlist(element, sellerID, productID, variantID, size) {
    if (!element.classList.contains('i-red'))
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
                    element.classList.add('i-red')
                    if (result.already) {
                        swal("Wishlisted", "Product already in your wishlist", 'success');
                    } else {
                        swal("Wishlisted", "Product added to your wishlist", 'success');
                    }
                } else {
                    $('#loginpopup').modal('show');
                }
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
                if (result.login) {
                    element.classList.remove('i-red');
                    swal({
                        title: "Product removed from wishlist",
                        icon: "error",
                    });
                } else {
                    $('#loginpopup').modal('show');

                }
            }
        })
}

function getLocation() {
    if (navigator.geolocation) {
        if (!sessionStorage.pincode)
            navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else
        alert("Geolocation is not supported by this browser.")
}

getLocation();

function showPosition(position) {
    $.ajax({
        url: "/api/pincode",
        type: "POST",
        data: {
            lat: position.coords.latitude,
            long: position.coords.longitude,
        },
        dataType: 'json',
        success: function(result) {
            if (result.pincode != 'error')
                sessionStorage.setItem("pincode", result.pincode);
        }
    });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
                // window.location.reload()
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
}

function openProduct(productID, variantID) {
    if (variantID) {
        location.href = '/product/variant/' + variantID
    } else {
        location.href = '/product/view-product/' + productID
    }
}

function openSeller(sellerID) {
    location.href = '/seller/' + sellerID
}

function searchData(e) {

    const container = document.getElementById('search-results')
    const containerSeller = document.getElementById('results-sellers')
    const containerProduct = document.getElementById('results-products')
    const searchField = document.getElementById('searchField')
    const searchBtn = document.getElementById('searchBtn')

    let match = e.value.match(/^[a-zA-z0-9-]*/)
    let match2 = e.value.match(/\s*/)

    if (match2[0] === e.value) {
        container.style.display = 'none'
        searchField.style.borderRadius = '10px 0 0 10px'
        searchBtn.style.borderRadius = '0 10px 10px 0'
        return;
    }
    if (match[0] === e.value) {
        $.ajax({
            url: "/search",
            type: "POST",
            data: {
                payload: e.value
            },
            dataType: 'json',
            success: function(res) {
                if (res.products.length < 1)
                    containerProduct.style.display = 'none'
                else {
                    containerProduct.style.display = 'block'
                    containerProduct.innerHTML = '<div class="suggestion-title">Products</div>'
                    res.products.forEach(prod => {
                        containerProduct.innerHTML += '<li onclick="openResult(this,1)" data-resId=' + prod.slugID + '>' + prod.productName + '<span>' + prod.category.catName + '</span></li>'
                    });
                }

                if (res.sellers.length < 1)
                    containerSeller.style.display = 'none'
                else {
                    containerSeller.style.display = 'block'
                    containerSeller.innerHTML = '<div class="suggestion-title">Sellers</div>'
                    res.sellers.forEach(seller => {
                        containerSeller.innerHTML += '<li onclick="openResult(this,2)" data-resId=' + seller.slugID + '>' + seller.busName + '</li>'
                    });
                }

                if (containerSeller.style.display == 'block' || containerProduct.style.display == 'block') {
                    container.style.display = 'block'
                    searchField.style.borderRadius = '10px 0 0 0'
                    searchBtn.style.borderRadius = '0 10px 0 0'
                } else {
                    searchField.style.borderRadius = '10px 0 0 10px'
                    searchBtn.style.borderRadius = '0 10px 10px 0'
                }
            }
        })
    }
}

function openResult(element, type) {
    var resId = element.getAttribute("data-resId")
    if (type == 1)
        location.href = '/product/view-product/' + resId
    else
        location.href = '/seller/' + resId
}

$("#navbar-menu").on("shown.bs.collapse", function() {
    $(".dropdown-menu").css({ "position": "absolute", "left": "50%" })
});

$("#navbar-menu").on("hidden.bs.collapse", function() {
    $(".dropdown-menu").css({ "position": "absolute", "left": "auto" })
});