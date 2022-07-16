const data = [ // _____________________________________Кассовые боксы____________________________________________
        {
            link: "kassovyie_boksyi15.html",
            title: "Кассовый бокс с одинарным накопителем красный",
            desc: "Кассовый бокс с одинарным накопителем - идеальное решение для современного супермаркета или магазинов самообслуживания.",
            img: '/images/fulls/kas/kasMS1.png',
            price: 128265,
            code: "4109"
        },
        {
            link: "kassovyie_boksyi9.html",
            title: "Кассовый бокс с одинарным накопителем синий",
            desc: "Кассовый бокс с одинарным накопителем - идеальное решение для современного супермаркета или магазинов самообслуживания.",
            img: '/images/fulls/kas/kasMS2.png',
            price: 128265,
            code: "4109"
        },

        {
            link: "kassovyie_boksyi9.html",
            title: "Кассовый бокс с одинарным накопителем зеленый",
            desc: "Кассовый бокс с одинарным накопителем - идеальное решение для современного супермаркета или магазинов самообслуживания.",
            img: '/images/fulls/kas/kasMS3.png',
            price: 128265,
            code: "4109"
        },



        {
            link: "kassovyie_boksyi9.html",
            title: "Кассовый бокс с одинарным накопителем серый",
            desc: "Кассовый бокс с одинарным накопителем - идеальное решение для современного супермаркета или магазинов самообслуживания.",
            img: '/images/fulls/kas/kasMS4.png',
            price: 128265,
            code: "4109"
        },


        {
            link: "kassovyie_boksyi9.html",
            title: "Кассовый бокс с одинарным накопителем черный",
            desc: "Кассовый бокс с одинарным накопителем - идеальное решение для современного супермаркета или магазинов самообслуживания.",
            img: '/images/fulls/kas/kasMS5.png',
            price: 128265,
            code: "4109"
        },

    ]
    // console.log(data.length);
    // document.head.innerHTML += `
    // <link rel="stylesheet" href="https://cdnsdg09uh90wi4uhw49u0hjs.cloudflare.com/ajax/libs/izitoast/1.4.0/css/iziToast.css" />
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/js/iziToast.min.js"></script>
    // `

const monoblocks = document.getElementById('kasBoks');
const monoblocksBlock = document.getElementById('monoblocksBlock');


const priceSort = document.getElementById("priceSort");

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
    monoblocks.classList.remove('cardProduct');
});

myTabTwo.addEventListener('click', function() {
    monoblocksBlock.classList.add('cardProductBlock');
    monoblocks.classList.add('cardProduct');
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
            </a>
            <div class="cardProductItem">
            <a href="${a.link}">
                <div class="cardProductItem_img cardProductItem_img_kas">
                    <img src="${a.img}">
                </div>
                <div class="cardProductItem_content cardProductItem_content_kas">
                    <h3>${a.title} </h3>
                    <div class="cardProductItem_codes">
                        <span class="cardProductItem_code">Код товара: ${a.code}</span>
                    </div>
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
                        <div>
                            <p>Доставка</p>
                        </div>
                    </div>
                    <div class="cardProductItem_info_sub">
                        <div>
                            <img src="/images/productInfo3.png" alt="">
                        </div>
                        <div>
                            <p>Установка</p>
                        </div>
                    </div>
                </div>
                <span class="cardProductItem_price">  ${formatter(a.price)} тг</span>
                </div>
                
            </a>
        </div>
            `;
        monoblocksBlock.appendChild(item);

    })

}





function displayList(array) {
    monoblocks.innerHTML = "";
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
   <div class="gggProductImg">    <img class="boximagee" src="${a.img}"
   style="float:left"></div>
      </div>
      <br>
      <div class="secondly">
          <h2>${a.title}</h2>
          <hr><span style="color:#CCCCCC; font-size:14px">Код товара: ${a.code}</span><br>
          <p>${a.desc}</p>
          <p><span class="item-price-indicator_second">Цена: ${formatter(a.price)} тг </span></p>
          </div>
          </a>
          <div class="thirdly">
          <a class="but btn-zayavka" href="${a.link}">Перейти</a>
      </div>
        </div>
       </div>
       </li><br>

        `;
        monoblocks.appendChild(item);

    })
}



function showInitialStage() {
    displayBlock(initialArray);
    displayList(initialArray);
    let params = countParam(initialArray);
    showParamCounters(params)
}

// function showInitialStage() {
//     displayList(initialArray);
//     let params = countParam(initialArray);
//     showParamCounters(params)
// }


showInitialStage();

let filterParam = {
    color: [],
    ram: [],
    ssd: [],
    diagonal: [],
    displayType: []
}


function filterArray() {
    let updatedArray = initialArray.filter(function(a) {
            if (filterParam.color.length !== 0) {
                for (let i = 0; i < filterParam.color.length; i++) {
                    if (a.color === filterParam.color[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.ram.length !== 0) {
                for (let i = 0; i < filterParam.ram.length; i++) {
                    if (a.ram === filterParam.ram[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })
        .filter(function(a) {
            if (filterParam.ssd.length !== 0) {
                for (let i = 0; i < filterParam.ssd.length; i++) {
                    if (a.ssd === filterParam.ssd[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        }).filter(function(a) {
            if (filterParam.diagonal.length !== 0) {
                for (let i = 0; i < filterParam.diagonal.length; i++) {
                    if (a.diagonal === filterParam.diagonal[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        }).filter(function(a) {
            if (filterParam.displayType.length !== 0) {
                for (let i = 0; i < filterParam.displayType.length; i++) {
                    if (a.displayType === filterParam.displayType[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })


    let params = countParam(updatedArray);
    showParamCounters(params)
        // console.log(params);


    if (updatedArray.length !== 0) {
        displayBlock(updatedArray)
        displayList(updatedArray)
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
    // if (updatedArray.length !== 0) {
    //     displayList(updatedArray)
    //     addFilterOption(filterOptionArray)
    // } else {
    //     clickArr[clickArr.length - 1].checked = false;
    //     clickArr.pop()
    //     filterOptionArray.pop()
    //     errorMsg()
    //         // console.log(clickArr);
    //         // console.log(filterOptionArray)
    //     updateFilterParam()
    // }

    // console.log(filterParam);
}

let clickArr = []
let filterOptionArray = []
let btnArray = []

const whiteBtn = document.getElementById('whiteBtn');
const blackBtn = document.getElementById('blackBtn');
const firstRam = document.getElementById('firstRam');
const secondRam = document.getElementById('secondRam');
const firstSsd = document.getElementById('firstSsd');
const secondSsd = document.getElementById('secondSsd');
const firstInch = document.getElementById('firstInch');
const secondInch = document.getElementById('secondInch');
const thirdInch = document.getElementById('thirdInch');
const fourthInch = document.getElementById('fourthInch');
const displayType1 = document.getElementById('displayType1');
const displayType2 = document.getElementById('displayType2');


function updateFilterParam() {
    filterParam.color = [];

    if (whiteBtn.checked === true) {
        filterParam.color.push('white');
    }

    if (blackBtn.checked === true) {
        filterParam.color.push('black');
    }

    filterParam.ram = [];

    if (firstRam.checked === true) {
        filterParam.ram.push(2);
    }

    if (secondRam.checked === true) {
        filterParam.ram.push(4);
    }

    filterParam.ssd = [];

    if (firstSsd.checked === true) {
        filterParam.ssd.push(32);
    }

    if (secondSsd.checked === true) {
        filterParam.ssd.push(64);
    }

    filterParam.diagonal = [];
    if (firstInch.checked === true) {
        filterParam.diagonal.push(12.1);
    }

    if (secondInch.checked === true) {
        filterParam.diagonal.push(15);
    }

    if (thirdInch.checked === true) {
        filterParam.diagonal.push(15.6);
    }

    if (fourthInch.checked === true) {
        filterParam.diagonal.push(17);
    }

    filterParam.displayType = [];

    if (displayType1.checked === true) {
        filterParam.displayType.push('capacitive');
    }

    if (displayType2.checked === true) {
        filterParam.displayType.push('resistive');
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

function whiteBtnClick() {
    if (whiteBtn.checked == true) {
        filterOptionArray.push('белый')
        clickArr.push(whiteBtn)
        arrCounter = true;
    } else {
        spliceMethod(whiteBtn);
        spliceMethodSecond('белый')
        arrCounter = false;
    }
    updateFilterParam()
}

function blackBtnClick() {
    if (blackBtn.checked == true) {
        filterOptionArray.push('черный')
        clickArr.push(blackBtn)
        arrCounter = true;
    } else {
        spliceMethod(blackBtn);
        spliceMethodSecond('черный')
        arrCounter = false;
    }
    updateFilterParam()
}


function firstRamClick() {
    if (firstRam.checked == true) {
        filterOptionArray.push('2ГБ')
        clickArr.push(firstRam)
        arrCounter = true;
    } else {
        spliceMethod(firstRam);
        spliceMethodSecond('2ГБ')
        arrCounter = false;
    }
    updateFilterParam()
}

function secondRamClick() {
    if (secondRam.checked == true) {
        filterOptionArray.push('4ГБ')
        clickArr.push(secondRam)
        arrCounter = true;
    } else {
        spliceMethod(secondRam);
        spliceMethodSecond('4ГБ')
        arrCounter = false;
    }
    updateFilterParam()
}

function firstSsdClick() {
    if (firstSsd.checked == true) {
        filterOptionArray.push('32ГБ')
        clickArr.push(firstSsd)
        arrCounter = true;
    } else {
        spliceMethod(firstSsd);
        spliceMethodSecond('32ГБ')
        arrCounter = false;
    }
    updateFilterParam()
}

function secondSsdClick() {
    if (secondSsd.checked == true) {
        filterOptionArray.push('64ГБ')
        clickArr.push(secondSsd)
        arrCounter = true;
    } else {
        spliceMethod(secondSsd);
        spliceMethodSecond('64ГБ')
        arrCounter = false;
    }
    updateFilterParam()
}




//// 

function firstInchClick() {
    if (firstInch.checked == true) {
        filterOptionArray.push(`12.1"`)
        clickArr.push(firstInch)
        arrCounter = true;
    } else {
        spliceMethod(firstInch);
        spliceMethodSecond(`12.1"`)
        arrCounter = false;
    }
    updateFilterParam()
}

function secondInchClick() {
    if (secondInch.checked == true) {
        filterOptionArray.push(`15"`)
        clickArr.push(secondInch)
        arrCounter = true;
    } else {
        spliceMethod(secondInch);
        spliceMethodSecond(`15"`)
        arrCounter = false;
    }
    updateFilterParam()
}

function thirdInchClick() {
    if (thirdInch.checked == true) {
        filterOptionArray.push(`15.6"`)
        clickArr.push(thirdInch)
        arrCounter = true;
    } else {
        spliceMethod(thirdInch);
        spliceMethodSecond(`15.6"`)
        arrCounter = false;
    }
    updateFilterParam()
}

function fourthInchClick() {
    if (fourthInch.checked == true) {
        filterOptionArray.push(`17"`)
        clickArr.push(fourthInch)
        arrCounter = true;
    } else {
        spliceMethod(fourthInch);
        spliceMethodSecond(`17"`)
        arrCounter = false;
    }
    updateFilterParam()
}

function displayType1Click() {
    if (displayType1.checked == true) {
        filterOptionArray.push(`Емкостный`)
        clickArr.push(displayType1)
        arrCounter = true;
    } else {
        spliceMethod(displayType1);
        spliceMethodSecond(`Емкостный`)
        arrCounter = false;
    }
    updateFilterParam()
}

function displayType2Click() {
    if (displayType2.checked == true) {
        filterOptionArray.push(`Резистивный`)
        clickArr.push(displayType2)
        arrCounter = true;
    } else {
        spliceMethod(displayType2);
        spliceMethodSecond(`Резистивный`)
        arrCounter = false;
    }
    updateFilterParam()
}



whiteBtn.addEventListener('click', whiteBtnClick)
blackBtn.addEventListener('click', blackBtnClick)
firstRam.addEventListener('click', firstRamClick)
secondRam.addEventListener('click', secondRamClick)
firstSsd.addEventListener('click', firstSsdClick)
secondSsd.addEventListener('click', secondSsdClick)
firstInch.addEventListener('click', firstInchClick)
secondInch.addEventListener('click', secondInchClick)
thirdInch.addEventListener('click', thirdInchClick)
fourthInch.addEventListener('click', fourthInchClick)
displayType1.addEventListener('click', displayType1Click)
displayType2.addEventListener('click', displayType2Click)



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
// function errorMsg() {
//     iziToast.warning({ title: '', message: 'По таким параметрам продуктов не найдено' });
// }


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

let whiteCounter = 0;
let blackCounter = 0;

function countParam(array) {
    let whiteCount = 0;
    let blackCount = 0;
    let ram1 = 0;
    let ram2 = 0;
    let ssd1 = 0;
    let ssd2 = 0;
    let inch1 = 0;
    let inch2 = 0;
    let inch3 = 0;
    let inch4 = 0;
    let dType1 = 0;
    let dType2 = 0;
    for (let index = 0; index < array.length; index++) {
        if (array[index].color == "white") {
            whiteCount++;
        } else if (array[index].color == "black") {
            blackCount++;
        }
        if (array[index].ram == 2) {
            ram1++;
        } else if (array[index].ram == 4) {
            ram2++;
        }
        if (array[index].ssd == 32) {
            ssd1++;
        } else if (array[index].ssd == 64) {
            ssd2++;
        }

        if (array[index].diagonal == 12.1) {
            inch1++;
        } else if (array[index].diagonal == 15) {
            inch2++;
        } else if (array[index].diagonal == 15.6) {
            inch3++;
        } else if (array[index].diagonal == 17) {
            inch4++;
        }

        if (array[index].displayType == "capacitive") {
            dType1++;
        } else if (array[index].displayType == "resistive") {
            dType2++;
        }
    }

    return [whiteCount, blackCount, ram1, ram2, ssd1, ssd2, inch1, inch2, inch3, inch4, dType1, dType2]

}

function showParamCounters(array) {
    for (let index = 0; index < array.length; index++) {
        document.getElementById(`${index+1}param`).innerHTML = array[index]
    }
}