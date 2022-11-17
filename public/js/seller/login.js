const mobOtp1 = $('#mobOtp1')[0]
const mobOtp2 = $('#mobOtp2')[0]
const mobOtp3 = $('#mobOtp3')[0]
const mobOtp4 = $('#mobOtp4')[0]
const emailOtp1 = $('#emailOtp1')[0]
const emailOtp2 = $('#emailOtp2')[0]
const emailOtp3 = $('#emailOtp3')[0]
const emailOtp4 = $('#emailOtp4')[0]
var val;

mobOtp1.addEventListener('keyup', function(event) {
    if (event.key != "Backspace" && event.key != "Enter") {
        mobOtp2.focus();
    }
    checkMobileOtp()
});

mobOtp2.addEventListener('keyup', function(event) {
    if (event.key == "Backspace") {
        mobOtp1.focus();
    } else if (event.key != "Enter") {
        mobOtp3.focus();
    }
    checkMobileOtp()
});

mobOtp3.addEventListener('keyup', function(event) {
    if (event.key == "Backspace") {
        mobOtp2.focus();
    } else if (event.key != "Enter") {
        mobOtp4.focus();
    }
    checkMobileOtp()
});

mobOtp4.addEventListener('keyup', function(event) {
    if (event.key == "Backspace") {
        mobOtp3.focus();
    }
    checkMobileOtp()
});

emailOtp1.addEventListener('keyup', function(event) {
    if (event.key != "Backspace" && event.key != "Enter") {
        emailOtp2.focus();
    }
    checkEmailOtp()
});

emailOtp2.addEventListener('keyup', function(event) {
    if (event.key == "Backspace") {
        emailOtp1.focus();
    } else if (event.key != "Enter") {
        emailOtp3.focus();
    }
    checkEmailOtp()
});

emailOtp3.addEventListener('keyup', function(event) {
    if (event.key == "Backspace") {
        emailOtp2.focus();
    } else if (event.key != "Enter") {
        emailOtp4.focus();
    }
    checkEmailOtp()
});

emailOtp4.addEventListener('keyup', function(event) {
    if (event.key == "Backspace") {
        emailOtp3.focus();
    } else if (event.key == "Enter") {}
    checkEmailOtp()
});

function sendOTP() {
    var err = document.getElementById('err');
    var errMsg = document.getElementById('errMsg');
    val = $('#val').val()
    let emailRegex = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');
    let mobileRegex = new RegExp('^[0-9]{10}$');
    var toFind, toCheck, modal;

    if (emailRegex.test(val)) {
        toFind = 'busEmail'
        toCheck = 'emailOtp'
        modal = 1
    } else if (mobileRegex.test(val)) {
        toFind = 'busMobile'
        toCheck = 'mobileOtp'
        modal = 2
    } else {
        toFind = null
        toCheck = null
    }
    if (toFind) {
        $('#val').removeClass('is-invalid')
        err.style.display = "none"
        $.ajax({
            url: "/seller/sendOtp",
            type: "POST",
            data: {
                toFind: toFind,
                val: val,
                toCheck: toCheck,
            },
            dataType: 'json',
            success: function(res) {
                console.log(res)
                if (res.status == 0) {
                    $('#val').addClass('is-invalid')
                    errMsg.innerHTML = "No Seller found!"
                    err.style.display = "block"
                } else if (res.status == 2) {
                    $('#val').addClass('is-invalid')
                    errMsg.innerHTML = "Seller Verification Pending!"
                    err.style.display = "block"
                } else if (res.status == 1) {
                    location.href = "/seller/reauthenticate/" + res.slugID
                } else {
                    $('#val').removeClass('is-invalid')
                    $('#val').addClass('is-valid')
                    err.style.display = "block"
                    $('#' + toFind).append(val)
                    $('#slugID').val(res.slugID)
                    if (modal == 1)
                        openModal('#email')
                    else
                        openModal('#mobile')
                }
            }
        })
    } else {
        $('#val').addClass('is-invalid')
        errMsg.innerHTML = "Enter valid Mobile Number"
        err.style.display = "block"
    }
}

function openModal(val) {
    $(val + "Modal").modal({ backdrop: "static" });
    $(val + 'Modal').modal('show');
    $(val + 'Timer').css('display', 'inline')
    $(val + 'Resend').removeClass('timer-active')
    $(val + 'Resend').addClass('timer-inactive')
    timer(30);
}

function submitLogin() {
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/seller/login/" + $('#slugID').val());
    document.body.appendChild(form);
    form.submit()
}

function checkMobileOtp() {
    var otp = mobOtp1.value + mobOtp2.value + mobOtp3.value + mobOtp4.value
    if (otp.length == 4) {
        var elements = [mobOtp1, mobOtp2, mobOtp3, mobOtp4]
        $.ajax({
            url: "/seller/checkOtp",
            type: "POST",
            data: {
                toFind: 'busMobile',
                val: val,
                toCheck: 'mobileOtp',
                otp: otp
            },
            dataType: 'json',
            success: function(res) {
                if (res.status) {
                    elements.forEach(element => {
                        element.classList.remove('is-invalid')
                        element.classList.add('is-valid')
                        element.setAttribute("disabled", 'true')
                    });
                    $('#submit1').removeAttr('disabled');
                    $('#mobResendstr').css('display', 'none')
                } else {
                    elements.forEach(element => {
                        element.classList.add('is-invalid')
                    })
                }
            }
        })
    }
}

function checkEmailOtp() {
    var otp = emailOtp1.value + emailOtp2.value + emailOtp3.value + emailOtp4.value
    if (otp.length == 4) {
        var elements = [emailOtp1, emailOtp2, emailOtp3, emailOtp4]
        $.ajax({
            url: "/seller/checkOtp",
            type: "POST",
            data: {
                toFind: 'busEmail',
                val: val,
                toCheck: 'emailOtp',
                otp: otp
            },
            dataType: 'json',
            success: function(res) {
                if (res.status) {
                    elements.forEach(element => {
                        element.classList.remove('is-invalid')
                        element.classList.add('is-valid')
                        element.setAttribute("disabled", "true")
                    });
                    $('#submit2').removeAttr('disabled');
                    $('#emailResendstr').css('display', 'none')
                } else {
                    elements.forEach(element => {
                        element.classList.add('is-invalid')
                    })
                }
            }
        })
    }
}

function timer(remaining) {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    $('#mobTimer').html('(' + m + ':' + s + ')')
    $('#emailTimer').html('(' + m + ':' + s + ')')
    remaining -= 1;
    if (remaining >= 0) {
        setTimeout(function() {
            timer(remaining);
        }, 1000);
        return;
    } else {
        $('#mobTimer').css('display', 'none')
        $('#emailTimer').css('display', 'none')
        $('#mobResend').removeClass('timer-inactive')
        $('#mobResend').addClass('timer-active')
        $('#emailResend').removeClass('timer-inactive')
        $('#emailResend').addClass('timer-active')
    }
}