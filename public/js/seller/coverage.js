var state = ["Maharashtra"]

// var Maharashtra = ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"]

var Maharashtra = ["Mumbai City", "Mumbai Suburban", "Thane"]

var mumbai_city = [400001, 400002, 400003, 400004, 400005, 400006, 400007, 400008, 400009, 400010, 400011, 400012, 400013, 400014, 400015, 400016, 400017, 400018, 400019, 400020, 400021, 400022, 400023, 400025, 400026, 400027, 400028, 400030, 400031, 400032, 400033, 400034, 400035, 400036, 400037, 400038, 400039, 400040]

var mumbai_suburban = [400024, 400029, 400042, 400043, 400044, 400045, 400046, 400047, 400048, 400049, 400050, 400051, 400052, 400053, 400054, 400055, 400056, 400057, 400058, 400059, 400060, 400061, 400062, 400063, 400064, 400065, 400066, 400067, 400068, 400069, 400070, 400071, 400072, 400073, 400074, 400075, 400076, 400077, 400078, 400079, 400080, 400081, 400082, 400083, 400084, 400085, 400086, 400087, 400088, 400089, 400090, 400091, 400092, 400093, 400094, 400095, 400096, 400097, 400098, 400099, 400100, 400101, 400102, 400103, 400104]

var thane = [400601, 400602, 400603, 400604, 400605, 400606, 400607, 400608, 400610, 400612, 400613, 400614, 400615, 400701, 400703, 400705, 400706, 400708, 400709, 400710, 401101, 401104, 401105, 401106, 401107, 401204, 401206]

function createNew(arr) {
    var insertArray = []
    arr.forEach(element => {
        insertArray.push({ label: element, value: element })
    });
    return insertArray;
}

$(document).ready(function() {
    VirtualSelect.init({
        ele: '#state',
        search: false,
        disableSelectAll: true,
        showSelectedOptionsFirst: true,
        disableAllOptionsSelectedText: true
    });
    var arr = createNew(state)
    document.querySelector('#state').setOptions(arr);

    VirtualSelect.init({
        ele: '#district',
        disableSelectAll: true,
        showSelectedOptionsFirst: true
    });
    var arr = createNew(Maharashtra)
    document.querySelector('#district').setOptions(arr);

    VirtualSelect.init({
        ele: '#pin',
        disableSelectAll: true,
        showSelectedOptionsFirst: true
    })

    document.querySelector('#state').addEventListener('change', function() {
        var optionsArr = []
        var arr = this.value
        arr.forEach(element => {
            switch (element) {
                case 'Maharashtra':
                    optionsArr = optionsArr.concat(Maharashtra)
                    document.querySelector('#district').focus();
                    break;
                default:
                    document.querySelector('#district').setOptions();
                    break;
            }
        });
        var newArr = createNew(optionsArr)
        document.querySelector('#district').setOptions(newArr);

    });

    document.querySelector('#district').addEventListener('change', function() {
        var optionsArr = []
        var arr = this.value
        arr.forEach(element => {
            switch (element) {
                case 'Mumbai City':
                    optionsArr = optionsArr.concat(mumbai_city)
                    document.querySelector('#pin').focus();
                    break;
                case 'Mumbai Suburban':
                    optionsArr = optionsArr.concat(mumbai_suburban)
                    document.querySelector('#pin').focus();
                    break;
                case 'Thane':
                    optionsArr = optionsArr.concat(thane)
                    document.querySelector('#pin').focus();
                    break;
                default:
                    document.querySelector('#pin').setOptions();
                    break;
            }
        });
        var newArr = createNew(optionsArr)
        document.querySelector('#pin').setOptions(newArr);

    });
});

const coverageForm = document.getElementById('coverageForm')
coverageForm.addEventListener("submit", function(e) {
    if ($('#state').val().length == 0) {
        e.preventDefault();
        $('#district_err').css("display", "none");
        $('#pin_err').css("display", "none");
        $('#state_err').css("display", "block");
    } else if ($('#district').val().length == 0) {
        e.preventDefault();
        $('#state_err').css("display", "none");
        $('#pin_err').css("display", "none");
        $('#district_err').css("display", "block");
    } else if ($('#pin').val().length == 0) {
        e.preventDefault();
        $('#state_err').css("display", "none");
        $('#district_err').css("display", "none");
        $('#pin_err').css("display", "block");
    } else {
        $('#state_err').css("display", "none");
        $('#district_err').css("display", "none");
        $('#pin_err').css("display", "none");
    }
})















// function addDistrict(val) {
//     console.log(val)
//     var StateSelected = val;
//     var optionsList;
//     var htmlString = "";

//     switch (StateSelected) {
//       case "Andra Pradesh":
//           optionsList = AndraPradesh;
//           break;
//       case "Arunachal Pradesh":
//           optionsList = ArunachalPradesh;
//           break;
//       case "Assam":
//           optionsList = Assam;
//           break;
//       case "Bihar":
//           optionsList = Bihar;
//           break;
//       case "Chhattisgarh":
//           optionsList = Chhattisgarh;
//           break;
//       case "Goa":
//           optionsList = Goa;
//           break;
//       case  "Gujarat":
//           optionsList = Gujarat;
//           break;
//       case "Haryana":
//           optionsList = Haryana;
//           break;
//       case "Himachal Pradesh":
//           optionsList = HimachalPradesh;
//           break;
//       case "Jammu and Kashmir":
//           optionsList = JammuKashmir;
//           break;
//       case "Jharkhand":
//           optionsList = Jharkhand;
//           break;
//       case  "Karnataka":
//           optionsList = Karnataka;
//           break;
//       case "Kerala":
//           optionsList = Kerala;
//           break;
//       case  "Madya Pradesh":
//           optionsList = MadhyaPradesh;
//           break;
//       case "Maharashtra":
//           optionsList = Maharashtra;
//           break;
//       case  "Manipur":
//           optionsList = Manipur;
//           break;
//       case "Meghalaya":
//           optionsList = Meghalaya ;
//           break;
//       case  "Mizoram":
//           optionsList = Mizoram;
//           break;
//       case "Nagaland":
//           optionsList = Nagaland;
//           break;
//       case  "Orissa":
//           optionsList = Orissa;
//           break;
//       case "Punjab":
//           optionsList = Punjab;
//           break;
//       case  "Rajasthan":
//           optionsList = Rajasthan;
//           break;
//       case "Sikkim":
//           optionsList = Sikkim;
//           break;
//       case  "Tamil Nadu":
//           optionsList = TamilNadu;
//           break;
//       case  "Telangana":
//           optionsList = Telangana;
//           break;
//       case "Tripura":
//           optionsList = Tripura ;
//           break;
//       case  "Uttaranchal":
//           optionsList = Uttaranchal;
//           break;
//       case  "Uttar Pradesh":
//           optionsList = UttarPradesh;
//           break;
//       case "West Bengal":
//           optionsList = WestBengal;
//           break;
//       case  "Andaman and Nicobar Islands":
//           optionsList = AndamanNicobar;
//           break;
//       case "Chandigarh":
//           optionsList = Chandigarh;
//           break;
//       case  "Dadar and Nagar Haveli":
//           optionsList = DadraHaveli;
//           break;
//       case "Daman and Diu":
//           optionsList = DamanDiu;
//           break;
//       case  "Delhi":
//           optionsList = Delhi;
//           break;
//       case "Lakshadeep":
//           optionsList = Lakshadeep ;
//           break;
//       case  "Pondicherry":
//           optionsList = Pondicherry;
//           break;
//   }


//     for(var i = 0; i < optionsList.length; i++){
//       htmlString = htmlString+"<option value='"+ optionsList[i] +"'>"+ optionsList[i] +"</option>";
//     }
//     $("#district").html(htmlString);
//   }