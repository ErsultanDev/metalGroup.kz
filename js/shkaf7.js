const data = [
    // _____________________________________Почтовые ящики, ключницы____________________________________________

    {
        link: "pochta_4.html",
        title: "Металлический почтовый ящик 4-секционный",
        desc: "Металлический четырех-секционный почтовый ящик ПМ 4 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 4 замка). Каждая дверь имеет окно выштамповки под номер (25х55 мм).",
        img: '/images/fulls/pochta/1.jpg',
        price: 6655,
        code: "3801",
        sections: '4',
        lock: '4'
    },


    {
        link: "pochta_5.html",
        title: "Металлический почтовый ящик 5-секционный",
        desc: "Металлический пяти-секционный почтовый ящик ПМ 5 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 5 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм).",
        img: '/images/fulls/pochta/2.jpg',
        price: 7919,
        code: "3802",
        sections: '5',
        lock: 'lock5'
    },

    {
        link: "pochta_6.html",
        title: "Металлический почтовый ящик 6-секционный",
        desc: "Металлический шести-секционный почтовый ящик ПМ 6 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 6 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм). ",
        img: '/images/fulls/pochta/3.jpg',
        price: 9140,
        code: "3803",
        sections: '6',
        lock: 'lock6'
    },

    {
        link: "pochta_7.html",
        title: "Металлический почтовый ящик 7-секционный",
        desc: "Металлический семи-секционный почтовый ящик ПМ 7 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 7 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм).	",
        img: '/images/fulls/pochta/4.jpg',
        price: 10285,
        code: "3804",
        sections: '8',
        lock: 'lock7'
    },


    {
        link: "pochta_8.html",
        title: "Металлический почтовый ящик 8-секционный",
        desc: "Металлический восьми-секционный почтовый ящик ПМ 8 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 8 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм).",
        img: '/images/fulls/pochta/5.jpg',
        price: 11417,
        code: "3805",
        sections: '7',
        lock: 'lock8'
    },

    {
        link: "kc_20.html",
        title: "Металлический шкаф для ключей КС - 20",
        desc: "Металлический шкаф для ключей (ключница) КС-20, изготовлены из стали толщиной 1 мм, с полимерным (порошковым) покрытием. В комплекте поставляются разноцветные пластиковые брелки с номерами (20 шт.) и крепежная арматура.",
        img: '/images/fulls/pochta/6.jpg',
        price: 4395,
        code: "3806",
        brelok: 'brelok20',
    },

    {
        link: "kc_48.html",
        title: "Металлический шкаф для ключей КС - 48",
        desc: "Металлический шкаф для ключей (ключница) КС-48, изготовлены из стали толщиной 1 мм, с полимерным (порошковым) покрытием. В комплекте поставляются разноцветные пластиковые брелки с номерами (48 шт.) и крепежная арматура. ",
        img: '/images/fulls/pochta/7.jpg',
        price: 7488,
        code: "3807",
        brelok: 'brelok48'
    },

    {
        link: "kc_96.html",
        title: "Металлический шкаф для ключей КС - 96",
        desc: "Металлический шкаф для ключей (ключница) КС-96, изготовлены из стали толщиной 1 мм, с полимерным (порошковым) покрытием. В комплекте поставляются разноцветные пластиковые брелки (96 шт.) и крепежная арматура.",
        img: '/images/fulls/pochta/8.jpg',
        price: 9614,
        code: "3808",
        brelok: 'brelok96'
    },



]

const labels = document.getElementById('shkaf7Js');
const monoblocksBlock = document.getElementById('shkaf7Block');
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
    // 
    video.innerHTML = `
    <p>Звоните прямо сейчас: <br><a href="tel:87273449900">8(727)<span> 344-99-00</span></a>; <a href="tel:+77012667700"><b>+7 701 266-77-00</b></a></p>
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
    sections: [],
    brelok: [],
    lock: [],
}



function filterArray() {
    let updatedArray = initialArray
        .filter(function(a) {
            if (filterParam.sections.length !== 0) {
                for (let i = 0; i < filterParam.sections.length; i++) {
                    if (a.sections === filterParam.sections[i]) {
                        return a;
                    }
                }
            } else {
                return a;
            }
        })


    .filter(function(a) {
        if (filterParam.brelok.length !== 0) {
            for (let i = 0; i < filterParam.brelok.length; i++) {
                if (a.brelok === filterParam.brelok[i]) {
                    return a;
                }
            }
        } else {
            return a;
        }
    })


    .filter(function(a) {
        if (filterParam.lock.length !== 0) {
            for (let i = 0; i < filterParam.lock.length; i++) {
                if (a.lock === filterParam.lock[i]) {
                    return a;
                }
            }
        } else {
            return a;
        }
    })


    let params = countParam(updatedArray);
    showParamCounters(params)


    if (updatedArray.length !== 0) {
        displayBlock(updatedArray)
        displayList(updatedArray)
        addFilterOption(filterOptionArray)
    } else {
        clickArr[clickArr.length - 1].checked = false;
        clickArr.pop()
        filterOptionArray.pop()
        errorMsg()

        updateFilterParam()
    }
}

let clickArr = []
let filterOptionArray = []
let btnArray = []


const eightSection = document.getElementById('eightSection');
const sevenSection = document.getElementById('sevenSection');
const sixSection = document.getElementById('sixSection');
const fiveSection = document.getElementById('fiveSection');
const fourthSection = document.getElementById('fourthSection');


const brelok96 = document.getElementById('brelok96');
const brelok20 = document.getElementById('brelok20');
const brelok48 = document.getElementById('brelok48');


const lock8 = document.getElementById('lock8');
const lock7 = document.getElementById('lock7');
const lock6 = document.getElementById('lock6');
const lock5 = document.getElementById('lock5');
const lock4 = document.getElementById('lock4');








function updateFilterParam() {
    filterParam.sections = [];
    if (sevenSection.checked === true) {
        filterParam.sections.push('8');
    }
    if (eightSection.checked === true) {
        filterParam.sections.push('7');
    }

    if (sixSection.checked === true) {
        filterParam.sections.push('6');
    }
    if (fourthSection.checked === true) {
        filterParam.sections.push('4');
    }
    if (fiveSection.checked === true) {
        filterParam.sections.push('5');
    }


    filterParam.lock = [];
    if (lock8.checked === true) {
        filterParam.lock.push('lock8');
    }
    if (lock7.checked === true) {
        filterParam.lock.push('lock7');
    }
    if (lock6.checked === true) {
        filterParam.lock.push('lock6');
    }
    if (lock5.checked === true) {
        filterParam.lock.push('lock5');
    }

    filterParam.brelok = [];
    if (brelok96.checked === true) {
        filterParam.brelok.push('brelok96');
    }
    if (brelok48.checked === true) {
        filterParam.brelok.push('brelok48');
    }
    if (brelok20.checked === true) {
        filterParam.brelok.push('brelok20');
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




function eightSectionBtnClick() {
    if (eightSection.checked == true) {
        filterOptionArray.push('7-секционный')
        clickArr.push(eightSection)
        arrCounter = true;
    } else {
        spliceMethod(eightSection);
        spliceMethodSecond('7-секционный')
        arrCounter = false;
    }
    updateFilterParam()
}

function sevenSectionBtnClick() {
    if (sevenSection.checked == true) {
        filterOptionArray.push('8-секционный')
        clickArr.push(sevenSection)
        arrCounter = true;
    } else {
        spliceMethod(sevenSection);
        spliceMethodSecond('8-секционный')
        arrCounter = false;
    }
    updateFilterParam()
}

function sixSectionBtnClick() {
    if (sixSection.checked == true) {
        filterOptionArray.push('6-секционный')
        clickArr.push(sixSection)
        arrCounter = true;
    } else {
        spliceMethod(sixSection);
        spliceMethodSecond('6-секционный')
        arrCounter = false;
    }
    updateFilterParam()
}


function fourthSectionBtnClick() {
    if (fourthSection.checked == true) {
        filterOptionArray.push('4-секционный')
        clickArr.push(fourthSection)
        arrCounter = true;
    } else {
        spliceMethod(fourthSection);
        spliceMethodSecond('4-секционный')
        arrCounter = false;
    }
    updateFilterParam()
}



function fiveSectionBtnClick() {
    if (fiveSection.checked == true) {
        filterOptionArray.push('5-секционный')
        clickArr.push(fiveSection)
        arrCounter = true;
    } else {
        spliceMethod(fiveSection);
        spliceMethodSecond('5-секционный')
        arrCounter = false;
    }
    updateFilterParam()
}

function brelok96BtnClick() {
    if (brelok96.checked == true) {
        filterOptionArray.push('96 шт:')
        clickArr.push(brelok96)
        arrCounter = true;
    } else {
        spliceMethod(brelok96);
        spliceMethodSecond('48 шт:')
        arrCounter = false;
    }
    updateFilterParam()
}


function brelok48BtnClick() {
    if (brelok48.checked == true) {
        filterOptionArray.push('48 шт:')
        clickArr.push(brelok48)
        arrCounter = true;
    } else {
        spliceMethod(brelok48);
        spliceMethodSecond('48 шт::')
        arrCounter = false;
    }
    updateFilterParam()
}



function brelok20BtnClick() {
    if (brelok20.checked == true) {
        filterOptionArray.push('20 шт:')
        clickArr.push(brelok20)
        arrCounter = true;
    } else {
        spliceMethod(brelok20);
        spliceMethodSecond('20 шт:')
        arrCounter = false;
    }
    updateFilterParam()
}


function lock8BtnClick() {
    if (lock8.checked == true) {
        filterOptionArray.push('8 замков:')
        clickArr.push(lock8)
        arrCounter = true;
    } else {
        spliceMethod(lock8);
        spliceMethodSecond('8 замков:')
        arrCounter = false;
    }
    updateFilterParam()
}

function lock7BtnClick() {
    if (lock7.checked == true) {
        filterOptionArray.push('7 замков:')
        clickArr.push(lock7)
        arrCounter = true;
    } else {
        spliceMethod(lock7);
        spliceMethodSecond('7 замков:')
        arrCounter = false;
    }
    updateFilterParam()
}



function lock6BtnClick() {
    if (lock6.checked == true) {
        filterOptionArray.push('6 замков:')
        clickArr.push(lock6)
        arrCounter = true;
    } else {
        spliceMethod(lock6);
        spliceMethodSecond('6 замков:')
        arrCounter = false;
    }
    updateFilterParam()
}




function lock5BtnClick() {
    if (lock5.checked == true) {
        filterOptionArray.push('5 замков:')
        clickArr.push(lock5)
        arrCounter = true;
    } else {
        spliceMethod(lock5);
        spliceMethodSecond('5 замков:')
        arrCounter = false;
    }
    updateFilterParam()
}



eightSection.addEventListener('click', eightSectionBtnClick)
sevenSection.addEventListener('click', sevenSectionBtnClick)
sixSection.addEventListener('click', sixSectionBtnClick)
fourthSection.addEventListener('click', fourthSectionBtnClick)
fiveSection.addEventListener('click', fiveSectionBtnClick)

brelok96.addEventListener('click', brelok96BtnClick)
brelok48.addEventListener('click', brelok48BtnClick)
brelok20.addEventListener('click', brelok20BtnClick)

lock8.addEventListener('click', lock8BtnClick)
lock7.addEventListener('click', lock7BtnClick)
lock6.addEventListener('click', lock6BtnClick)
lock5.addEventListener('click', lock5BtnClick)


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
            let selectedId = parseInt(target.getAttribute('data-id'), 10);
            removeFilterElement(selectedId)

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

    let sections1 = 0;
    let sections2 = 0;
    let sections3 = 0;
    let sections4 = 0;
    let sections5 = 0;


    let brelok1 = 0;
    let brelok2 = 0;
    let brelok3 = 0;


    let lock1 = 0;
    let lock2 = 0;
    let lock3 = 0;
    let lock4 = 0;


    for (let index = 0; index < array.length; index++) {




        if (array[index].sections == '8') {
            sections1++;
        } else if (array[index].sections == '7') {
            sections2++;
        } else if (array[index].sections == '6') {
            sections3++;
        } else if (array[index].sections == '5') {
            sections4++;
        } else if (array[index].sections == '4') {
            sections5++;
        }

        if (array[index].brelok == 'brelok96') {
            brelok1++;
        } else if (array[index].brelok == 'brelok48') {
            brelok2++;
        } else if (array[index].brelok == 'brelok20') {
            brelok3++;
        }

        if (array[index].lock == 'lock8') {
            lock1++;
        } else if (array[index].lock == 'lock7') {
            lock2++;
        } else if (array[index].lock == 'lock6') {
            lock3++;
        } else if (array[index].lock == 'lock5') {
            lock4++;
        }


        // if (array[index].winding == true) {
        //     winding1++;
        // } else if (array[index].winding == false) {
        //     winding2++;
        // }
    }

    return [sections1, sections2, sections3, sections4, sections5, lock1, lock2, lock3, lock4, brelok1, brelok2, brelok3]

}

function showParamCounters(array) {
    for (let index = 0; index < array.length; index++) {
        document.getElementById(`${index+1}param`).innerHTML = array[index]
    }
}

// var filename = window.location.href.split('/').pop().split('#')[0].split('?')[0];
// console.log(filename);