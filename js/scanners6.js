const data = [{
        link: "scanner_6900.php",
        title: "Сканер штрих кода 6900",
        desc: "Сканер штрих кода с подставкой обладает высоким уровнем обслуживания. Кнопка сканирования выдерживает не менее 100 нажатий в сек., поэтому может применяться в различных магазинах, супермаркетах, аптеках или же в любой торговли.",
        img: "/images/scanner/11.jpg",
        price: 11840,
        scanType: ["bar-code"],
        screenScan: false,
        connections: ["wired"],
        readType: "laser",
        scanMode: ["first", "second"]
    },
    {
        link: "scanner_t_5.php",
        title: "Сканер для считывания штрих кодов T5",
        desc: "Светодиодный сканер для считывания штрих кодов T5 может считывать любые штрих коды. Главным преимуществом сканера T5 является - считывание штрих-кодов прямо с экрана смартфона или монитора компьютера.",
        img: "/images/scanner/3.jpg",
        price: 15120,
        scanType: ["bar-code"],
        screenScan: false,
        connections: ["wired"],
        readType: "led",
        scanMode: ["first", "third", "fourth", "fifth"]
    },
    {
        link: "scanner_10t_2d.php",
        title: "Cканер QR и штрих-кодов 10T-2D",
        desc: "Cканер QR и штрих-кодов 10T- с 2D режимом считывания, сканирует любые штрих-коды: с экрана монитора, смартфона, а также считывает QR-коды. Применяется в розничной торговли, легкой промышленности, документообороте, а также в сфере банковских и коммунальных услуг.",
        img: "/images/scanner/9.png",
        price: 23940,
        scanType: ["bar-code", "qr-code"],
        screenScan: true,
        connections: ["wired"],
        readType: "image",
        scanMode: ["first", "second"]
    },
    {
        link: "scanner_1880.php",
        title: "Беспроводной сканер штрих кода 1880",
        desc: "Беспроводной сканер штрих кода с подставкой обладает высокой производительностью. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
        img: "/images/scanner/7.jpg",
        price: 20160,
        scanType: ["bar-code"],
        screenScan: true,
        connections: ["wired", "wifi"],
        readType: "laser",
        scanMode: ["first", "second"]
    },
    {
        link: "scanner_6100CG.php",
        title: "Беспроводной сканер штрих кода 6100 CG",
        desc: "Беспроводной сканер штрих кода обладает высокой производительностью. Имеет три вида сканирования: Штрих-код, QR-код, DATA Matrix. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
        img: "/images/6100CG/ava1.jpg",
        price: 20304,
        scanType: ["bar-code", "qr-code", "dmx-code"],
        screenScan: true,
        connections: ["wired", "wifi"],
        readType: "led",
        scanMode: ["first", "third", "fourth", "fifth"]
    },
    {
        link: "scanner_6600G.php",
        title: "Беспроводной сканер штрих кода 6600 G",
        desc: "Беспроводной сканер штрих кода обладает высокой производительностью. Имеет три вида сканирования: Штрих-код, QR-код, DATA Matrix. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
        img: "/images/6600G/ava1.jpg",
        price: 21855,
        scanType: ["bar-code", "qr-code", "dmx-code"],
        screenScan: true,
        connections: ["wired", "wifi"],
        readType: "image",
        scanMode: ["first", "fourth"]
    },
    {
        link: "scanner_6600B.php",
        title: "Беспроводной сканер штрих кода 6600 B (Bluetooth)",
        desc: "Беспроводной сканер штрих кода обладает высокой производительностью и подключается через bluetooth. Имеет три вида сканирования: Штрих-код, QR-код, DATA Matrix. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
        img: "/images/6600B/ava.jpg",
        price: 23970,
        scanType: ["bar-code", "qr-code", "dmx-code"],
        screenScan: true,
        connections: ["wired", "wifi", "bluetooth"],
        readType: "image",
        scanMode: ["first", "fourth"]
    }
]


const scanners = document.getElementById('scanners');

const priceSort = document.getElementById('priceSort');



let priceSortedArray = data.sort(function(a, b) {
    let x = a.price;
    let y = b.price;

    return x - y;
});
let initialArray = priceSortedArray;

let initStage = true;

priceSort.addEventListener("change", function() {
    if (priceSort.value == "first") {
        priceSortedArray = data.sort(function(a, b) {
            let x = a.price;
            let y = b.price;

            return x - y;
        });

    } else if (priceSort.value == "second") {
        priceSortedArray = data.sort(function(a, b) {
            let x = a.price;
            let y = b.price;

            return y - x;
        });
    }

    initialArray = priceSortedArray;
    filterArray();
});


function displayList(array) {
    scanners.innerHTML = "";
    let video = document.createElement('div');
    // <p>Звоните прямо сейчас: <br><a href="tel:87273449900">8(727)<span> 344-99-00</span></a>; <a href="tel:+77012667700"><b>+7 701 266-77-00</b></a></p>
    video.innerHTML = `
        <div class="video1"><iframe width="780" height="439" src="https://www.youtube.com/embed/jpDM-Ybi5DE?rel=0&autoplay=0" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
        `;

    array.map((a) => {
        let item = document.createElement('div');
        item.classList.add("main");
        var formatter = function(priceSum) {
            let mn = 0;
            let price = priceSum.toString()
            for (let ij = price.length; ij > 0; ij--) {
                if (mn % 3 == 0) {
                    // price.splice(ij, 0, " ")
                    price = [price.slice(0, ij), " ", price.slice(ij)].join('');
                }
                mn++;
            }
            return price;
        }


        item.innerHTML = `
    <a href="${a.link}">
        <div class="col-md-3">
            <img src="${a.img}">
        </div>
        <div class="col-md-7">
            <div class="nazvanie">
                <p>${a.title}</p>
            </div>
            <p>${a.desc}</p>
        </div>     
        </a>
        <div class="col-md-2">
            <p><span class="item-price-indicator_second">Цена:<br> </span><span class="item_price_second">${formatter(a.price)} тг </span></p>
            <a class="hvr-outline-out button2" href="${a.link}">Перейти</a>
        </div>

`;
        scanners.appendChild(item);

    })
}

function showInitialStage() {
    displayList(initialArray);
    let params = countParam(initialArray);
    showParamCounters(params)
}


showInitialStage();



let filterParam = {
    scanType: [],
    screenScan: [],
    connections: [],
    readType: [],
    // scanMode: []
}

// filterArray()

function filterArray() {
    let updatedArray = initialArray.filter(function(a) {
            if (filterParam.scanType.length !== 0) {
                for (let i = 0; i < filterParam.scanType.length; i++) {
                    for (let j = 0; j < a.scanType.length; j++) {
                        if (a.scanType[j] === filterParam.scanType[i]) {
                            return a;
                        }
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.screenScan.length !== 0) {
                for (let i = 0; i < filterParam.screenScan.length; i++) {
                    if (a.screenScan === filterParam.screenScan[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.connections.length !== 0) {
                for (let i = 0; i < filterParam.connections.length; i++) {
                    for (let j = 0; j < a.connections.length; j++) {
                        if (a.connections[j] === filterParam.connections[i]) {
                            return a;
                        }
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.readType.length !== 0) {
                for (let i = 0; i < filterParam.readType.length; i++) {
                    if (a.readType === filterParam.readType[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })



    let params = countParam(updatedArray);
    showParamCounters(params)
    console.log(updatedArray);


    if (updatedArray.length !== 0) {
        displayList(updatedArray)
        displayBlock(updatedArray)
        addFilterOption(filterOptionArray)
    } else {
        clickArr[clickArr.length - 1].checked = false;
        clickArr.pop()
        filterOptionArray.pop()
        errorMsg()
            // console.log(clickArr);
            // console.log(filterOptionArray)
        updateFilterParam()
    }
}


let clickArr = []
let filterOptionArray = []
let btnArray = []

const barCodeBtn = document.getElementById('barCodeBtn');
const qrCodeBtn = document.getElementById('qrCodeBtn');
const dmxBtn = document.getElementById('dmxBtn');
const screenScan1 = document.getElementById('screenScan1');
const screenScan2 = document.getElementById('screenScan2');
const wiredBtn = document.getElementById('wiredBtn');
const wifiBtn = document.getElementById('wifiBtn');
const bluetoothBtn = document.getElementById('bluetoothBtn');
const laserBtn = document.getElementById('laserBtn');
const ledBtn = document.getElementById('ledBtn');
const imageBtn = document.getElementById('imageBtn');
// const modeBtn1 = document.getElementById('modeBtn1');
// const modeBtn2 = document.getElementById('modeBtn2');
// const modeBtn3 = document.getElementById('modeBtn3');
// const modeBtn4 = document.getElementById('modeBtn4');
// const modeBtn5 = document.getElementById('modeBtn5');

function updateFilterParam() {
    filterParam.scanType = [];

    if (barCodeBtn.checked === true) {
        filterParam.scanType.push("bar-code");
    }

    if (qrCodeBtn.checked === true) {
        filterParam.scanType.push("qr-code");
    }

    if (dmxBtn.checked === true) {
        filterParam.scanType.push("dmx-code");
    }

    filterParam.screenScan = [];

    if (screenScan1.checked === true) {
        filterParam.screenScan.push(true);
    }

    if (screenScan2.checked === true) {
        filterParam.screenScan.push(false);
    }

    filterParam.connections = [];

    if (wiredBtn.checked === true) {
        filterParam.connections.push("wired");
    }

    if (wifiBtn.checked === true) {
        filterParam.connections.push("wifi");
    }

    if (bluetoothBtn.checked === true) {
        filterParam.connections.push("bluetooth");
    }

    filterParam.readType = [];

    if (laserBtn.checked === true) {
        filterParam.readType.push("laser");
    }

    if (ledBtn.checked === true) {
        filterParam.readType.push("led");
    }

    if (imageBtn.checked === true) {
        filterParam.readType.push("image");
    }

    // filterParam.scanMode = [];

    // if (modeBtn1.checked === true) {
    //     filterParam.scanMode.push("first");
    // }

    // if (modeBtn2.checked === true) {
    //     filterParam.scanMode.push("second");
    // }

    // if (modeBtn3.checked === true) {
    //     filterParam.scanMode.push("third");
    // }

    // if (modeBtn4.checked === true) {
    //     filterParam.scanMode.push("fourth");
    // }

    // if (modeBtn5.checked === true) {
    //     filterParam.scanMode.push("fifth");
    // }

    filterArray()
}

function spliceMethod(value) {
    const idx = clickArr.indexOf(value);
    if (idx > -1) {
        clickArr.splice(idx, 1);
    }
}

function spliceMethodSecond(value) {
    const idx = filterOptionArray.indexOf(value);
    if (idx > -1) {
        filterOptionArray.splice(idx, 1);
    }
}


function barCodeBtnClick() {
    if (barCodeBtn.checked == true) {
        filterOptionArray.push('штрих-код')
        clickArr.push(barCodeBtn)
        arrCounter = true;
    } else {
        spliceMethod(barCodeBtn);
        spliceMethodSecond('штрих-код')
        arrCounter = false;
    }
    updateFilterParam()
}

function qrCodeBtnClick() {
    if (qrCodeBtn.checked == true) {
        filterOptionArray.push('qr-код')
        clickArr.push(qrCodeBtn)
        arrCounter = true;
    } else {
        spliceMethod(qrCodeBtn);
        spliceMethodSecond('qr-код')
        arrCounter = false;
    }
    updateFilterParam()
}

function dmxBtnClick() {
    if (dmxBtn.checked == true) {
        filterOptionArray.push('data matrix')
        clickArr.push(dmxBtn)
        arrCounter = true;
    } else {
        spliceMethod(dmxBtn);
        spliceMethodSecond('data matrix')
        arrCounter = false;
    }
    updateFilterParam()
}

function screenScan1Click() {
    if (screenScan1.checked == true) {
        filterOptionArray.push('да')
        clickArr.push(screenScan1)
        arrCounter = true;
    } else {
        spliceMethod(screenScan1);
        spliceMethodSecond('да')
        arrCounter = false;
    }
    updateFilterParam()
}

function screenScan2Click() {
    if (screenScan2.checked == true) {
        filterOptionArray.push('нет')
        clickArr.push(screenScan2)
        arrCounter = true;
    } else {
        spliceMethod(screenScan2);
        spliceMethodSecond('нет')
        arrCounter = false;
    }
    updateFilterParam()
}

function wiredBtnClick() {
    if (wiredBtn.checked == true) {
        filterOptionArray.push('проводной')
        clickArr.push(wiredBtn)
        arrCounter = true;
    } else {
        spliceMethod(wiredBtn);
        spliceMethodSecond('проводной')
        arrCounter = false;
    }
    updateFilterParam()
}

function wifiBtnClick() {
    if (wifiBtn.checked == true) {
        filterOptionArray.push('wifi')
        clickArr.push(wifiBtn)
        arrCounter = true;
    } else {
        spliceMethod(wifiBtn);
        spliceMethodSecond('wifi')
        arrCounter = false;
    }
    updateFilterParam()
}

function bluetoothBtnClick() {
    if (bluetoothBtn.checked == true) {
        filterOptionArray.push('bluetooth')
        clickArr.push(bluetoothBtn)
        arrCounter = true;
    } else {
        spliceMethod(bluetoothBtn);
        spliceMethodSecond('bluetooth')
        arrCounter = false;
    }
    updateFilterParam()
}

function laserBtnClick() {
    if (laserBtn.checked == true) {
        filterOptionArray.push('лазерный')
        clickArr.push(laserBtn)
        arrCounter = true;
    } else {
        spliceMethod(laserBtn);
        spliceMethodSecond('лазерный')
        arrCounter = false;
    }
    updateFilterParam()
}

function ledBtnClick() {
    if (ledBtn.checked == true) {
        filterOptionArray.push('светодиодный')
        clickArr.push(ledBtn)
        arrCounter = true;
    } else {
        spliceMethod(ledBtn);
        spliceMethodSecond('светодиодный')
        arrCounter = false;
    }
    updateFilterParam()
}

function imageBtnClick() {
    if (imageBtn.checked == true) {
        filterOptionArray.push('имиджевый')
        clickArr.push(imageBtn)
        arrCounter = true;
    } else {
        spliceMethod(imageBtn);
        spliceMethodSecond('имиджевый')
        arrCounter = false;
    }
    updateFilterParam()
}




barCodeBtn.addEventListener('click', barCodeBtnClick)
qrCodeBtn.addEventListener('click', qrCodeBtnClick)
dmxBtn.addEventListener('click', dmxBtnClick)
screenScan1.addEventListener('click', screenScan1Click)
screenScan2.addEventListener('click', screenScan2Click)
wiredBtn.addEventListener('click', wiredBtnClick)
wifiBtn.addEventListener('click', wifiBtnClick)
bluetoothBtn.addEventListener('click', bluetoothBtnClick)
laserBtn.addEventListener('click', laserBtnClick)
ledBtn.addEventListener('click', ledBtnClick)
imageBtn.addEventListener('click', imageBtnClick)
    // modeBtn1.addEventListener('click', modeBtn1Click)
    // modeBtn2.addEventListener('click', modeBtn2Click)
    // modeBtn3.addEventListener('click', modeBtn3Click)
    // modeBtn4.addEventListener('click', modeBtn4Click)
    // modeBtn5.addEventListener('click', modeBtn5Click)




let checkBoxArr = []
    // settings関数で初期設定 全体に適応させたい場合
iziToast.settings({
    timeout: 3000, // default timeout
    resetOnHover: true,
    // icon: '', // icon class
    transitionIn: 'flipInX',
    transitionOut: 'flipOutX',
    position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
    onOpen: function() {
        // console.log('callback abriu!');
    },
    onClose: function() {
        // console.log("callback fechou!");
    }
});


// error
function errorMsg() {
    iziToast.warning({ title: '', message: 'По таким параметрам продуктов не найдено' });
}


const filter = document.getElementById("filter");
let arrCounter = true;

function addFilterOption(arr) {
    let index = 0;
    filter.innerHTML = "";
    arr.map(a => {
        let filterOption = document.createElement('div');
        filterOption.setAttribute("data-id", index)
        filterOption.id = "filterOption"
        filterOption.classList.add('filter-option')
        if (arrCounter == true) {
            filterOption.classList.add('filter-animation')
        }
        if (index > 0) {
            document.querySelector(`[data-id="${index - 1}"]`).classList.remove('filter-animation');
        }
        filterOption.innerHTML = `
    <span class="filter-option-value" data-id="${index}">${a} 
        <svg xmlns="https://www.w3.org/2000/svg" style="
        pointer-events: none;
        margin-left: 8.5px;" data-id="${index} width="10px" height="10px" viewBox="0 0 7 7" id="filterOptionSvg" fill="none">
            <path data-id="${index} id="filterOptionPath" fill-rule="evenodd" clip-rule="evenodd" d="M4.00199 4.7091L6.64844 7.35554L7.35554 6.64844L4.7091 4.00199L7.35554 1.35554L6.64844 0.648438L4.00199 3.29488L1.35554 0.648438L0.648438 1.35554L3.29488 4.00199L0.648438 6.64844L1.35554 7.35554L4.00199 4.7091Z" fill="#C4C4C4"></path>
        </svg>
    </span>
    `;
        filter.appendChild(filterOption);
        index++;
    })
}

let filterOption = document.querySelector(".filter-option");

document.addEventListener(
    "click",
    function(e) {
        e = e || window.event;
        let target = e.srcElement;
        if (
            target.id === "filterOption" ||
            target.parentNode.id === "filterOption"
        ) {
            arrCounter = false;
            // console.log(filterOptionArray);
            let selectedId = parseInt(target.getAttribute('data-id'), 10);
            removeFilterElement(selectedId)
                // console.log(filterOptionArray);

        }
    },
    false
);



function removeFilterElement(value) {
    filterOptionArray.splice(value, 1);
    clickArr[value].checked = false;
    clickArr.splice(value, 1)
    updateFilterParam();
}

// let filterParam = {
//     scanType: [],
//     screenScan: [],
//     connections: [],
//     readType: [],
//     scanMode: []
// }

function countParam(array) {
    let scanType1 = 0;
    let scanType2 = 0;
    let scanType3 = 0;
    let screenScan1 = 0;
    let screenScan2 = 0;
    let connections1 = 0;
    let connections2 = 0;
    let connections3 = 0;
    let readType1 = 0;
    let readType2 = 0;
    let readType3 = 0;
    // let scanMode1 = 0;
    // let scanMode2 = 0;
    // let scanMode3 = 0;
    // let scanMode4 = 0;
    // let scanMode5 = 0;



    for (let index = 0; index < array.length; index++) {

        for (let i = 0; i < array[index].scanType.length; i++) {
            if (array[index].scanType[i] == "bar-code") {
                scanType1++;
            } else if (array[index].scanType[i] == "qr-code") {
                scanType2++;
            } else if (array[index].scanType[i] == "dmx-code") {
                scanType3++;
            }
        }


        if (array[index].screenScan == true) {
            screenScan1++;
        } else if (array[index].screenScan == false) {
            screenScan2++;
        }


        for (let i = 0; i < array[index].connections.length; i++) {
            if (array[index].connections[i] == "wired") {
                connections1++;
            } else if (array[index].connections[i] == "wifi") {
                connections2++;
            } else if (array[index].connections[i] == "bluetooth") {
                connections3++;
            }
        }


        if (array[index].readType == "laser") {
            readType1++;
        } else if (array[index].readType == "led") {
            readType2++;
        } else if (array[index].readType == "image") {
            readType3++;
        }



    }

    return [scanType1, scanType2, scanType3, screenScan1, screenScan2, connections1, connections2, connections3, readType1, readType2, readType3]

}

function showParamCounters(array) {
    for (let index = 0; index < array.length; index++) {
        document.getElementById(`${index+1}param`).innerHTML = array[index]
    }
}

let scrollHeight = document.querySelector(".header-bot").clientHeight + document.querySelector(".navbar-header").clientHeight + document.querySelector(".page-head_agile_info_w3l").clientHeight


setTimeout(function() {
    $('body,html').animate({ scrollTop: scrollHeight }, 800);
    imageBtn.click()
}, 200)