// ____________________________________Кассовые боксы EL - серия___________________________________________

const holod_steklo = [{
        link: "kassovyie_boksyi17.html",
        title: "Кассовый бокс энергия, универсальный ",
        desc: "Кассовый бокс красный универсальный - идеальное решение для современного супермаркета или магазинов самообслуживания.",
        img: "/images/fulls/kas/kasNew3.png",
        // img2: "/themes/images/products/shkaf/polair/main/9.jpg",
        price: 151011,
        code: "4109"
    },
    {
        link: "kassovyie_boksyi17.html",
        title: "Кассовый бокс энергия, универсальный ",
        desc: "Кассовый бокс красный универсальный - идеальное решение для современного супермаркета или магазинов самообслуживания.",
        img: "/images/fulls/kas/kasNew3.png",
        // img2: "/themes/images/products/shkaf/polair/main/9.jpg",
        price: 151011,
        code: "4109"
    },
    {
        link: "kassovyie_boksyi17.html",
        title: "Кассовый бокс энергия, универсальный ",
        desc: "Кассовый бокс красный универсальный - идеальное решение для современного супермаркета или магазинов самообслуживания.",
        img: "/images/fulls/kas/kasNew3.png",
        // img2: "/themes/images/products/shkaf/polair/main/9.jpg",
        price: 151011,
        code: "4109"
    },
]



// _________________________________________________________________________________________________


const listViewDiv = document.getElementById('listView');
const blockViewDiv = document.getElementById('blockView');

let pageName = window.location.href.split('/').pop().split('#')[0].split('?')[0];
console.log(pageName);

// const priceSort = document.getElementById('priceSort');
// let priceSortedArray = data.sort(function(a, b) {
//     let x = a.price;
//     let y = b.price;

//     return x - y;
// });
// let initialArray = priceSortedArray;

// let initStage = true;

// priceSort.addEventListener("change", function() {
//     if (priceSort.value == "first") {
//         priceSortedArray = data.sort(function(a, b) {
//             let x = a.price;
//             let y = b.price;

//             return x - y;
//         });

//     } else if (priceSort.value == "second") {
//         priceSortedArray = data.sort(function(a, b) {
//             let x = a.price;
//             let y = b.price;

//             return y - x;
//         });
//     }

//     initialArray = priceSortedArray;
//     filterArray();
// });





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




let myTabList = document.querySelector(".myTabOne");
let myTabBlock = document.querySelector(".myTabTwo");


console.log(myTabList);

// __________________________________________________________________________

function displayBlock(array) {
    let blockViewUl = blockViewDiv.querySelector('.thumbnails')
    blockViewUl.innerHTML = "";

    array.map((a) => {
        let item = document.createElement('li');
        item.classList.add("span3");

        item.innerHTML = `
        <div class="cardProductItem">
        <a href="${a.link}">
            <div class="cardProductItem_img">
                <img src="${a.img}">
            </div>
            <div class="cardProductItem_content">
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
        blockViewUl.appendChild(item);
    })





}



myTabBlock.addEventListener('click', function() {

    switch (pageName) {
        case "kassovyie_boksyi_el.html":
            displayBlock(holod_steklo)
            break;
        default:
            break;
    }



    // // _______________________________Count basket number (display block)_______________________________________
    // let card_count_display = document.querySelector(".my-cart-badge")
    // $("#fly, .fly").click(function() {

    //     $("#target")
    //         .clone()
    //         .css({
    //             'position': 'absolute',
    //             'z-index': '100'
    //         })
    //         .appendTo("#fly")
    //         .animate({
    //             opacity: 0.8,
    //             marginLeft: 550,
    //             marginTop: -750,
    //             /* Важно помнить, что названия СSS-свойств пишущихся  
    //                                         через дефис заменяются на аналогичные в стиле "camelCase" */
    //             width: 100,
    //             height: 100
    //         }, 500, function() {
    //             $(this).remove();
    //         });
    //     card_count_display.classList.remove("card_count_display")
    // });


    //     // _____________________Card Notification__________________________
    //     $("#fly, .fly").click(function() {
    //         toastr.options = {
    //             "closeButton": true,
    //             "debug": false,
    //             "newestOnTop": true,
    //             "progressBar": true,
    //             "positionClass": "toast-top-right",
    //             "preventDuplicates": false,
    //             "onclick": null,
    //             "showDuration": "300",
    //             "hideDuration": "1000",
    //             "timeOut": "5000",
    //             "extendedTimeOut": "1000",
    //             "showEasing": "swing",
    //             "hideEasing": "linear",
    //             "showMethod": "fadeIn",
    //             "hideMethod": "fadeOut"
    //         }

    //         const galochka = document.createElement('div');
    //         galochka.innerHTML = `<img src="/themes/images/galochka.png" alt="galochka">`

    //         let btn_fly = document.querySelector('#fly')
    //         let product_notif = this.getAttribute('data-id')


    //         // toastr["info"](`<img class='galochka' src='/themes/images/galochka.png' alt='galochka'> Товар <p class="product_notif"> ${product_notif} </p> добавлен в корзину`);
    //         toastr["info"](`<div class="notification_container">
    //                                             <div class="notification_ikon">
    //                                                 <img class='galochka' src='/themes/images/galochka.png' alt='galochka'>
    //                                             </div>
    //                                             <div class="notification_message">
    //                                                 <div class="notification_message_1">
    //                                                     Товар 
    //                                                     <p class="product_notif"> ${product_notif} </p>
    //                                                 </div>
    //                                                 добавлен в корзину
    //                                             </div>
    //                                         </div>`);
    //     });
    //     // _______________________________________________________________
});



const mediaQuery3 = window.matchMedia('(max-width: 668px)')


function card_position(e) {

    switch (pageName) {
        case "kassovyie_boksyi_el.html":
            displayBlock(holod_steklo)
            break;
        default:
            break;
    }
    // displayBlock(boneta)
}

mediaQuery3.addListener(card_position)
card_position(mediaQuery3)


// _______________


function displayList(array) {
    listViewDiv.innerHTML = "";


    array.map((a) => {
        let item = document.createElement('div');
        // item.classList.add("tovar_height");


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

        // let softt = document.createElement('div');
        // softt.classList.add('softt')
        // softt.innerHTML = `<hr class="soft" />`


        // let item_res = item + softt;


        listViewDiv.appendChild(item);

    })




}

switch (pageName) {
    case "kassovyie_boksyi_el.html":
        displayList(holod_steklo)
        break;

    default:
        break;
}


// displayList(boneta)
myTabList.addEventListener('click', function() {

    switch (pageName) {
        case "kassovyie_boksyi_el.html":
            displayList(holod_steklo)
            break;

        default:
            break;
    }
    // displayList(boneta)

    // // _______________________________Count basket number (display block)_______________________________________
    // let card_count_display = document.querySelector(".my-cart-badge")
    // $("#fly, .fly").click(function() {

    //     $("#target")
    //         .clone()
    //         .css({
    //             'position': 'absolute',
    //             'z-index': '100'
    //         })
    //         .appendTo("#fly")
    //         .animate({
    //             opacity: 0.8,
    //             marginLeft: 550,
    //             marginTop: -750,
    //             /* Важно помнить, что названия СSS-свойств пишущихся  
    //                                         через дефис заменяются на аналогичные в стиле "camelCase" */
    //             width: 100,
    //             height: 100
    //         }, 500, function() {
    //             $(this).remove();
    //         });
    //     card_count_display.classList.remove("card_count_display")
    // });


    // _____________________Card Notification__________________________


    // $("#fly, .fly").click(function() {
    //     toastr.options = {
    //         "closeButton": true,
    //         "debug": false,
    //         "newestOnTop": true,
    //         "progressBar": true,
    //         "positionClass": "toast-top-right",
    //         "preventDuplicates": false,
    //         "onclick": null,
    //         "showDuration": "300",
    //         "hideDuration": "1000",
    //         "timeOut": "5000",
    //         "extendedTimeOut": "1000",
    //         "showEasing": "swing",
    //         "hideEasing": "linear",
    //         "showMethod": "fadeIn",
    //         "hideMethod": "fadeOut"
    //     }

    //     const galochka = document.createElement('div');
    //     galochka.innerHTML = `<img src="/themes/images/galochka.png" alt="galochka">`

    //     let btn_fly = document.querySelector('#fly')
    //     let product_notif = this.getAttribute('data-id')


    //     // toastr["info"](`<img class='galochka' src='/themes/images/galochka.png' alt='galochka'> Товар <p class="product_notif"> ${product_notif} </p> добавлен в корзину`);
    //     toastr["info"](`<div class="notification_container">
    //                             <div class="notification_ikon">
    //                                 <img class='galochka' src='/themes/images/galochka.png' alt='galochka'>
    //                             </div>
    //                             <div class="notification_message">
    //                                 <div class="notification_message_1">
    //                                     Товар 
    //                                     <p class="product_notif"> ${product_notif} </p>
    //                                 </div>
    //                                 добавлен в корзину
    //                             </div>
    //                         </div>`);
    // });

    // _______________________________________________________________
});








// function showInitialStage() {
//     displayBlock(initialArray);
//     displayList(initialArray);
//     let params = countParam(initialArray);
//     showParamCounters(params)
// }

// function showInitialStage() {
//     displayList(initialArray);
//     let params = countParam(initialArray);
//     showParamCounters(params)
// }


// showInitialStage();