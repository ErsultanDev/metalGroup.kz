const data = [{
    link: "printer5802.html",
    title: "Принтер чеков 5802",
    desc: "Принтер чеков 5802 с термопечатью обладает высоким уровнем обслуживания в любых сферах. Принтер чеков имеет компактные размеры корпуса и предназначен для печати на 58 мм термоленте.",
    img: "/images/fulls/printer/1.jpg",
    price: 15840,
    paperWidth: 58,
    printSpeed: 90,
    thermSource: 100,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 3001
}, {
    link: "printer8256.html",
    title: "Принтер кассовых чеков 8256",
    desc: "Принтер кассовых чеков 8256 обладает не только замечательными техническими параметрами, но и высокоскоростной печатью 300мм/сек. Функциональные возможности принтера чеков существенно экономят время оператора и помогают бесперебойно обслуживать большой поток клиентов.",
    img: "/images/fulls/printer/3.jpg",
    price: 35280,
    paperWidth: 80,
    printSpeed: 300,
    thermSource: 100,
    interfaces: ["USB", "LAN"],
    autoCut: true,
    connections: ["autonomous"],
    code: 3002
}, {
    link: "printer_5860.html",
    title: "Мобильный термопринтер 5860 (bluetooth)",
    desc: "Мобильный термопринтер 5860 (bluetooth) легко синхронизируется с устройствами(Android) на смартфоне, планшете, компьютере и печатает на стандартной термоленте шириной 58 мм. Принтер чеков 5860 совместим с любыми программными обеспечениями и отлично впишется в малый или средний бизнес.",
    img: "/images/fulls/printer/10.png",
    price: 29040,
    paperWidth: 58,
    printSpeed: 50,
    thermSource: 80,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous", "bluetooth"],
    code: 3004
}, {
    link: "printer_58_b.html",
    title: "Принтер чеков Rongta 58 B",
    desc: "Принтер чеков Rongta 58B `обладает скоростью печати 90 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте.",
    img: "/images/fulls/printer/58b1.jpg",
    price: 12096,
    paperWidth: 58,
    printSpeed: 90,
    thermSource: 50,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5382
}, {
    link: "printer_58_a.html",
    title: "Принтер чеков Rongta 58A",
    desc: "Принтер чеков Rongta 58A обладает скоростью печати 90 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте.",
    img: "/images/fulls/printer/58a1.jpg",
    price: 12600,
    paperWidth: 58,
    printSpeed: 90,
    thermSource: 50,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5383
}, {
    link: "printer_rp_58e.html",
    title: "Принтер чеков Rongta 58E",
    desc: "Принтер чеков Rongta 58 E обладает скоростью печати 90 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте. Термопринтер чеков успешно используется в крупных торговых сетях, гостиницах и ресторанах, интернет-магазинах с большим клиентским потоком.",
    img: "/images/fulls/printer/1.jpg",
    price: 14742,
    paperWidth: 58,
    printSpeed: 100,
    thermSource: 100,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5381
}, {
    link: "printer_rp_328.html",
    title: "Принтер чеков Rongta RP 328",
    desc: "Принтер чеков Rongta RP 328 обладает скоростью печати 250 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 80мм термоленте. Термопринтер чеков успешно используется в крупных торговых сетях, гостиницах и ресторанах, интернет-магазинах с большим клиентским потоком.",
    img: "/images/fulls/printer/rp3281.jpg",
    price: 36280,
    paperWidth: 80,
    printSpeed: 250,
    thermSource: 100,
    interfaces: ["USB", "LAN", "Serial"],
    autoCut: true,
    connections: ["autonomous"],
    code: 5384
}, {
    link: "printer_rp_326.html",
    title: "Принтер чеков RP 326",
    desc: "Принтер чеков RP 326 обладает скоростью печати 250 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте. Термопринтер чеков успешно используется в крупных торговых сетях, гостиницах и ресторанах, интернет-магазинах с большим клиентским потоком.",
    img: "/images/fulls/printer/3.jpg",
    price: 44220,
    paperWidth: 58,
    printSpeed: 250,
    thermSource: 100,
    interfaces: ["USB", "LAN", "Serial"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5387
}]


const labels = document.getElementById('printers');

const monoblocksBlock = document.getElementById('prodItems1');const priceSort = document.getElementById("priceSort");

let priceSortedArray = data.sort(function (a, b) {
  let x = a.price;
  let y = b.price;

  return x - y;
});
let initialArray = priceSortedArray;

let initStage = true;
let priceOptionFirst = document.querySelector(".priceOptionFirst");
let priceOptionSecond = document.querySelector(".priceOptionSecond");

priceOptionFirst.addEventListener("click", function () {
  priceSortedArray = data.sort(function (a, b) {
    let x = a.price;
    let y = b.price;

    return x - y;
  });
  initialArray = priceSortedArray;
  filterArray();
});
priceOptionSecond.addEventListener("click", function () {

  priceSortedArray = data.sort(function (a, b) {
    let x = a.price;
    let y = b.price;

    return y - x;
  });
  initialArray = priceSortedArray;
  filterArray();
});



let myTabOne = document.querySelector('.myTabOne');
let myTabTwo = document.querySelector('.myTabTwo');


myTabOne.addEventListener('click', function() {
    monoblocksBlock.classList.remove('cardProductBlock');
    labels.classList.remove('cardProduct');
});

myTabTwo.addEventListener('click', function() {
    monoblocksBlock.classList.add('cardProductBlock');
    labels.classList.add('cardProduct');
});


function displayBlock(array) {
    monoblocksBlock.innerHTML = "";
    let video = document.createElement('div');
    // <p>Звоните прямо сейчас: <br><a href="tel:87015112200">8(727)<span> 344-99-00</span></a>; <a href="tel:+77012667700"><b>+7 701 266-77-00</b></a></p>
    video.innerHTML = `
            <p>Звоните прямо сейчас: <br><a href="tel:87015112200">8(727)<span> 344-99-00</span></a>; <a href="tel:+77012667700"><b>+7 701 266-77-00</b></a></p>
           `;

    array.map((a) => {
        let item = document.createElement('div');
        item.classList.add("mainCard");

        var formatter = function(priceSum) {
            let mn = 0;
            let price = priceSum.toString()
            for (let ij = price.length; ij > 0; ij--) {
                if (mn % 3 == 0) {
                    price = [price.slice(0, ij), " ", price.slice(ij)].join('');
                }
                mn++;
            }
            return price;
        }
        item.innerHTML = `
                  <div class="cardProductItem">
        <a href="${a.link}">
        <span class="cardProductItem_code">Код товара: ${a.code}</span>
            <div class="cardProductItem_img">
                <img src="${a.img}">
            </div>
            <div class="cardProductItem_content">
                <h3>${a.title} </h3>
              
                <div class="cardProductItem_info">
                    <div class="cardProductItem_info_sub">
                        <div>
                            <img src="/images/productInfo1.png" alt="">
                        </div>
                        <div>
                            <p>Есть в наличии</p>
                        </div>
                    </div>
                    <div class="cardProductItem_info_sub">
                    <div>
                        <img src="/images/productInfo2.png" alt="">
                    </div>
                    <div class="cardProductItem_info_sub_text">
                        <p>Доставка </p>
                        <p><p class="span_free"> - БЕСПЛАТНО</p></p>
                    </div>
                </div>
                    <div class="cardProductItem_info_sub">
                        <div>
                            <img src="/images/productInfo3.png" alt="">
                        </div>
                        <div class="cardProductItem_info_sub_text">
                            <p>Установка</p>
                            <p><p class="span_free"> - БЕСПЛАТНО</p></p>
                        </div>
                    </div>
                </div>
                <div class="cardProductItem_price_btn">
                <span class="cardProductItem_price"> от ${formatter(a.price)}  тг</span>
                </div>
             
            </div>
        </a>
    </div>
           
            `;
        monoblocksBlock.appendChild(item);

    })

}



function displayList(array) {
    labels.innerHTML = "";
    let video = document.createElement('div');
    // <p>Звоните прямо сейчас: <br><a href="tel:87015112200">8(727)<span> 344-99-00</span></a>; <a href="tel:+77012667700"><b>+7 701 266-77-00</b></a></p>
    video.innerHTML = `
        <p>Звоните прямо сейчас: <br><a href="tel:87015112200">8(727)<span> 344-99-00</span></a>; <a href="tel:+77012667700"><b>+7 701 266-77-00</b></a></p>
       `;

    array.map((a) => {
        let item = document.createElement('div');
        item.classList.add("main");

        var formatter = function(priceSum) {
            let mn = 0;
            let price = priceSum.toString()
            for (let ij = price.length; ij > 0; ij--) {
                if (mn % 3 == 0) {
                    price = [price.slice(0, ij), " ", price.slice(ij)].join('');
                }
                mn++;
            }
            return price;
        }
        item.innerHTML = `
       <li>
       <div id="ggg">
       <div class="firstly">
       <a  href="${a.link}"> 
       <img class="boximagee" src="${a.img}"
                  style="float:left">
      </div>
      <br>
      <div class="secondly">
          <h2>${a.title}</h2>
          <hr><span style="color:#CCCCCC; font-size:14px">Код товара: ${a.code}</span><br>
          <p>${a.desc}</p>
          <p><span class="item-price-indicator_second">Цена: от ${formatter(a.price)} тг </span></p>
          </div>
          </a>
          <div class="thirdly">
          <a class="but btn-zayavka" href="${a.link}">Перейти</a>
      </div>
        </div>
       </div>
       </li><br>

        `;
        labels.appendChild(item);

    })
}



function showInitialStage() {
    displayBlock(initialArray);
    displayList(initialArray);
    let params = countParam(initialArray);
    showParamCounters(params)
}

showInitialStage();

let filterParam = {
    paperWidth: [],
    interfaces: [],
    autoCut: [],
    connections: []
}

// filterArray()

function filterArray() {
    let updatedArray = initialArray.filter(function(a) {
            if (filterParam.paperWidth.length !== 0) {
                for (let i = 0; i < filterParam.paperWidth.length; i++) {
                    if (a.paperWidth === filterParam.paperWidth[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.interfaces.length !== 0) {
                for (let i = 0; i < filterParam.interfaces.length; i++) {
                    for (let j = 0; j < a.interfaces.length; j++) {
                        if (a.interfaces[j] === filterParam.interfaces[i]) {
                            return a;
                        }
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.autoCut.length !== 0) {
                for (let i = 0; i < filterParam.autoCut.length; i++) {
                    if (a.autoCut === filterParam.autoCut[i]) {
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

const firstSpeedWidthBtn = document.getElementById('58Btn');
const secondSpeedWidthBtn = document.getElementById('80Btn');
const USBbtn = document.getElementById('USBbtn');
const LanBtn = document.getElementById('LanBtn');
const SerialBtn = document.getElementById('SerialBtn');
const addAutoCutBtn = document.getElementById('addAutoCutBtn');
const removeAutoCutBtn = document.getElementById('removeAutoCutBtn');
const autonomousBtn = document.getElementById('autonomousBtn');
const bluetoothBtn = document.getElementById('bluetoothBtn');

function updateFilterParam() {
    filterParam.paperWidth = [];

    if (firstSpeedWidthBtn.checked === true) {
        filterParam.paperWidth.push(58);
    }

    if (secondSpeedWidthBtn.checked === true) {
        filterParam.paperWidth.push(80);
    }

    filterParam.interfaces = [];

    if (USBbtn.checked === true) {
        filterParam.interfaces.push("USB");
    }

    if (LanBtn.checked === true) {
        filterParam.interfaces.push("LAN");
    }

    if (SerialBtn.checked === true) {
        filterParam.interfaces.push("Serial");
    }
    filterParam.autoCut = [];

    if (addAutoCutBtn.checked === true) {
        filterParam.autoCut.push(true);
    }

    if (removeAutoCutBtn.checked === true) {
        filterParam.autoCut.push(false);
    }

    filterParam.connections = [];

    if (autonomousBtn.checked === true) {
        filterParam.connections.push("autonomous");
    }

    if (bluetoothBtn.checked === true) {
        filterParam.connections.push("bluetooth");
    }

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


function firstSpeedWidthBtnClick() {
    if (firstSpeedWidthBtn.checked == true) {
        filterOptionArray.push('58мм')
        clickArr.push(firstSpeedWidthBtn)
        arrCounter = true;
    } else {
        spliceMethod(firstSpeedWidthBtn);
        spliceMethodSecond('58мм')
        arrCounter = false;
    }
    updateFilterParam()
}

function secondSpeedWidthBtnClick() {
    if (secondSpeedWidthBtn.checked == true) {
        filterOptionArray.push('80мм')
        clickArr.push(secondSpeedWidthBtn)
        arrCounter = true;
    } else {
        spliceMethod(secondSpeedWidthBtn);
        spliceMethodSecond('80мм')
        arrCounter = false;
    }
    updateFilterParam()
}

function USBbtnClick() {
    if (USBbtn.checked == true) {
        filterOptionArray.push('USB')
        clickArr.push(USBbtn)
        arrCounter = true;
    } else {
        spliceMethod(USBbtn);
        spliceMethodSecond('USB')
        arrCounter = false;
    }
    updateFilterParam()
}

function LanBtnClick() {
    if (LanBtn.checked == true) {
        filterOptionArray.push('LAN')
        clickArr.push(LanBtn)
        arrCounter = true;
    } else {
        spliceMethod(LanBtn);
        spliceMethodSecond('LAN')
        arrCounter = false;
    }
    updateFilterParam()
}

function SerialBtnClick() {
    if (SerialBtn.checked == true) {
        filterOptionArray.push('Serial')
        clickArr.push(SerialBtn)
        arrCounter = true;
    } else {
        spliceMethod(SerialBtn);
        spliceMethodSecond('Serial')
        arrCounter = false;
    }
    updateFilterParam()
}

function addAutoCutBtnClick() {
    if (addAutoCutBtn.checked == true) {
        filterOptionArray.push('с автообрезкой')
        clickArr.push(addAutoCutBtn)
        arrCounter = true;
    } else {
        spliceMethod(addAutoCutBtn);
        spliceMethodSecond('с автообрезкой')
        arrCounter = false;
    }
    updateFilterParam()
}

function removeAutoCutBtnClick() {
    if (removeAutoCutBtn.checked == true) {
        filterOptionArray.push('без автообрезкой')
        clickArr.push(removeAutoCutBtn)
        arrCounter = true;
    } else {
        spliceMethod(removeAutoCutBtn);
        spliceMethodSecond('без автообрезкой')
        arrCounter = false;
    }
    updateFilterParam()
}

function autonomousBtnClick() {
    if (autonomousBtn.checked == true) {
        filterOptionArray.push('Автономный')
        clickArr.push(autonomousBtn)
        arrCounter = true;
    } else {
        spliceMethod(autonomousBtn);
        spliceMethodSecond('Автономный')
        arrCounter = false;
    }
    updateFilterParam()
}

function bluetoothBtnClick() {
    if (bluetoothBtn.checked == true) {
        filterOptionArray.push('Bluetooth')
        clickArr.push(bluetoothBtn)
        arrCounter = true;
    } else {
        spliceMethod(bluetoothBtn);
        spliceMethodSecond('Bluetooth')
        arrCounter = false;
    }
    updateFilterParam()
}

firstSpeedWidthBtn.addEventListener('click', firstSpeedWidthBtnClick)
secondSpeedWidthBtn.addEventListener('click', secondSpeedWidthBtnClick)
USBbtn.addEventListener('click', USBbtnClick)
LanBtn.addEventListener('click', LanBtnClick)
SerialBtn.addEventListener('click', SerialBtnClick)
addAutoCutBtn.addEventListener('click', addAutoCutBtnClick)
removeAutoCutBtn.addEventListener('click', removeAutoCutBtnClick)
autonomousBtn.addEventListener('click', autonomousBtnClick)
bluetoothBtn.addEventListener('click', bluetoothBtnClick)



// let checkBoxArr = []
//     // settings関数で初期設定 全体に適応させたい場合
// iziToast.settings({
//     timeout: 3000, // default timeout
//     resetOnHover: true,
//     // icon: '', // icon class
//     transitionIn: 'flipInX',
//     transitionOut: 'flipOutX',
//     position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
//     onOpen: function() {
//         // console.log('callback abriu!');
//     },
//     onClose: function() {
//         // console.log("callback fechou!");
//     }
// });


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

function countParam(array) {
    let paperWidth1 = 0;
    let paperWidth2 = 0;
    let interfaces1 = 0;
    let interfaces2 = 0;
    let interfaces3 = 0;
    let autoCut1 = 0;
    let autoCut2 = 0;
    let connections1 = 0;
    let connections2 = 0;

    for (let index = 0; index < array.length; index++) {
        if (array[index].paperWidth == 58) {
            paperWidth1++;
        } else if (array[index].paperWidth == 80) {
            paperWidth2++;
        }

        for (let i = 0; i < array[index].interfaces.length; i++) {
            if (array[index].interfaces[i] == "USB") {
                interfaces1++;
            } else if (array[index].interfaces[i] == "LAN") {
                interfaces2++;
            } else if (array[index].interfaces[i] == "Serial") {
                interfaces3++;
            }
        }


        if (array[index].autoCut == true) {
            autoCut1++;
        } else if (array[index].autoCut == false) {
            autoCut2++;
        }


        for (let i = 0; i < array[index].connections.length; i++) {
            if (array[index].connections[i] == "autonomous") {
                connections1++;
            } else if (array[index].connections[i] == "bluetooth") {
                connections2++;
            }
        }
    }

    return [paperWidth1, paperWidth2, interfaces1, interfaces2, interfaces3, autoCut1, autoCut2, connections1, connections2]

}

function showParamCounters(array) {
    for (let index = 0; index < array.length; index++) {
        document.getElementById(`${index+1}param`).innerHTML = array[index]
    }
}