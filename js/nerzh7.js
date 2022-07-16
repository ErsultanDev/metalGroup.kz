const data = [     // _____________________________________Подвесы для туш____________________________________________
    {
        link: "podves_dlya_tush.html",
        title: "Подвес для туш, 2 перекладины, 2 вертикальных опоры",
        desc: "Подвес для туш предназначен для подвешивания на крюках туш и полутуш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
        img: '/images/fulls/neutral/podvec/1.jpg',
        price: 174995,
        code: "2791"
    },

    {
        link: "podves_dlya_mytya.html",
        title: "Подвес для мытья туш стационарный",
        desc: "Подвес для мытья туш стационарный предназначен для подвешивания на крюках туш и полутуш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
        img: '/images/fulls/neutral/podvec/2.jpg',
        price: 999,
        code: "000"
    },

    {
        link: "kryuk_dlya_podvesa.html",
        title: "Крюк для подвеса туш",
        desc: "Крюк для подвеса туш предназначен для подвешивания, а также транспортировки по трубчатым подвесным путям, туш и полутуш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
        img: '/images/fulls/neutral/podvec/3.jpg',
        price: 3452,
        code: "2793"
    },

]

const labels = document.getElementById('nerzh7Js');
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
color: [],
paperWidth: [],
winding: []
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
        if (filterParam.winding.length !== 0) {
            for (let i = 0; i < filterParam.winding.length; i++) {
                if (a.winding === filterParam.winding[i]) {
                    return a;
                }
            }
        } else {
            return a;
        }
    })


let params = countParam(updatedArray);
showParamCounters(params)
    // console.log(updatedArray);


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

const whiteBtn = document.getElementById('whiteBtn');
const blackBtn = document.getElementById('blackBtn');
const grayBtn = document.getElementById('grayBtn');
const firstWidthBtn = document.getElementById('firstWidthBtn');
const secondWidthBtn = document.getElementById('secondWidthBtn');
const thirdWidthBtn = document.getElementById('thirdWidthBtn');
const withAutoCutBtn = document.getElementById('withAutoCutBtn');
const wtAutoCutBtn = document.getElementById('wtAutoCutBtn');
const autoSeperationBtn = document.getElementById('autoSeperationBtn');
const noAutoSeperationBtn = document.getElementById('noAutoSeperationBtn');


function updateFilterParam() {
filterParam.color = [];

if (whiteBtn.checked === true) {
    filterParam.color.push("white");
}

if (blackBtn.checked === true) {
    filterParam.color.push("black");
}

if (grayBtn.checked === true) {
    filterParam.color.push("gray");
}

filterParam.paperWidth = [];

if (firstWidthBtn.checked === true) {
    filterParam.paperWidth.push(76);
}

if (secondWidthBtn.checked === true) {
    filterParam.paperWidth.push(80);
}

if (thirdWidthBtn.checked === true) {
    filterParam.paperWidth.push(104);
}

filterParam.winding = [];

if (autoSeperationBtn.checked === true) {
    filterParam.winding.push(true);
}

if (noAutoSeperationBtn.checked === true) {
    filterParam.winding.push(false);
}

// console.log("object");
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

function grayBtnClick() {
if (grayBtn.checked == true) {
    filterOptionArray.push('черный')
    clickArr.push(grayBtn)
    arrCounter = true;
} else {
    spliceMethod(grayBtn);
    spliceMethodSecond('черный')
    arrCounter = false;
}
updateFilterParam()
}

function firstWidthBtnClick() {
if (firstWidthBtn.checked == true) {
    filterOptionArray.push('до 80мм')
    clickArr.push(firstWidthBtn)
    arrCounter = true;
} else {
    spliceMethod(firstWidthBtn);
    spliceMethodSecond('до 80мм')
    arrCounter = false;
}
updateFilterParam()
}

function secondWidthBtnClick() {
if (secondWidthBtn.checked == true) {
    filterOptionArray.push('до 82мм')
    clickArr.push(secondWidthBtn)
    arrCounter = true;
} else {
    spliceMethod(secondWidthBtn);
    spliceMethodSecond('до 82мм')
    arrCounter = false;
}
updateFilterParam()
}

function thirdWidthBtnClick() {
if (thirdWidthBtn.checked == true) {
    filterOptionArray.push('до 120мм')
    clickArr.push(thirdWidthBtn)
    arrCounter = true;
} else {
    spliceMethod(thirdWidthBtn);
    spliceMethodSecond('до 120мм')
    arrCounter = false;
}
updateFilterParam()
}

function autoSeperationBtnClick() {
if (autoSeperationBtn.checked == true) {
    filterOptionArray.push('имеется')
    clickArr.push(autoSeperationBtn)
    arrCounter = true;
} else {
    spliceMethod(autoSeperationBtn);
    spliceMethodSecond('имеется')
    arrCounter = false;
}
updateFilterParam()
}

function noAutoSeperationBtnClick() {
if (noAutoSeperationBtn.checked == true) {
    filterOptionArray.push('отсуствует')
    clickArr.push(noAutoSeperationBtn)
    arrCounter = true;
} else {
    spliceMethod(noAutoSeperationBtn);
    spliceMethodSecond('отсуствует')
    arrCounter = false;
}
updateFilterParam()
}

// whiteBtn.addEventListener('click', whiteBtnClick)
// blackBtn.addEventListener('click', blackBtnClick)
// grayBtn.addEventListener('click', grayBtnClick)
// firstWidthBtn.addEventListener('click', firstWidthBtnClick)
// secondWidthBtn.addEventListener('click', secondWidthBtnClick)
// thirdWidthBtn.addEventListener('click', thirdWidthBtnClick)
// autoSeperationBtn.addEventListener('click', autoSeperationBtnClick)
// noAutoSeperationBtn.addEventListener('click', noAutoSeperationBtnClick)


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
let color1 = 0;
let color2 = 0;
let color3 = 0;
let paperWidth1 = 0;
let paperWidth2 = 0;
let paperWidth3 = 0;
let winding1 = 0;
let winding2 = 0;

for (let index = 0; index < array.length; index++) {

    if (array[index].color == "white") {
        color1++;
    } else if (array[index].color == "black") {
        color2++;
    } else if (array[index].color == "gray") {
        color3++;
    }

    if (array[index].paperWidth == 76) {
        paperWidth1++;
    } else if (array[index].paperWidth == 80) {
        paperWidth2++;
    } else if (array[index].paperWidth == 104) {
        paperWidth3++;
    }



    if (array[index].winding == true) {
        winding1++;
    } else if (array[index].winding == false) {
        winding2++;
    }
}

return [color1, color2, color3, paperWidth1, paperWidth2, paperWidth3, winding1, winding2]

}

function showParamCounters(array) {
for (let index = 0; index < array.length; index++) {
    document.getElementById(`${index+1}param`).innerHTML = array[index]
}
}

// var filename = window.location.href.split('/').pop().split('#')[0].split('?')[0];
// console.log(filename);