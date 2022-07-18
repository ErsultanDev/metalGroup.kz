<!DOCTYPE html>
<html>
<?php
$time=time();
if (session_id()=='') session_start();

$db=mysqli_connect("localhost","v_20478_Gulbanu","dala3940","v_20478_metal") or die();
$res=mysqli_query($db,"set names utf8");

$mess_url=mysqli_real_escape_string($db,basename($_SERVER['SCRIPT_FILENAME']));

//получаем id текущей темы
$res=mysqli_query($db,"SELECT id FROM таблица WHERE file_name='".$mess_url."'");
$res=mysqli_fetch_array($res);
$theme_id=$res["id"];

if (isset($_POST["contr_cod"])){    //отправлен комментарий
 $mess_login=htmlspecialchars($_POST["mess_login"]);
 $user_text=htmlspecialchars($_POST["user_text"]);
 $rating=htmlspecialchars($_POST["rating"]);
 if (md5($_POST["contr_cod"])==$_POST["prov_summa"]){    //код правильный
  if ($mess_login!='' and $user_text!=''){
   if (is_numeric($_POST["parent_id"]) and is_numeric($_POST["f_parent"]))
    $res=mysqli_query($db,"insert into posa1
    (parent_id, first_parent, date, theme_id, login, message, rating)
    values ('".$_POST["parent_id"]."','".$_POST["f_parent"]."',
    '".$time."','".$theme_id."','".$mess_login."','".$user_text."', '".$rating."')");
   else $res=mysqli_query($db,"insert into posa1 (date, theme_id, login, message, rating)
   values ('".$time."','".$theme_id."','".$mess_login."','".$user_text."','".$rating."')");
    $_SESSION["send"]="Комментарий принят!";
    header("Location: $mess_url#last"); exit;
  }
  else {
   $_SESSION["send"]="Не все поля заполнены!";
   header("Location: $mess_url#last"); exit;
  }
 }
 else {
  $_SESSION["send"]="Неверный проверочный код!";
  header("Location: $mess_url#last"); exit;
 }
}

if (isset($_SESSION["send"]) and $_SESSION["send"]!="") {    //вывод сообщения
    echo '<script type="text/javascript">alert("'.$_SESSION["send"].'");</script>';
    $_SESSION["send"]="";
}
?>

<head>
    <title>Микрокиоск Zebra MK500 купить купить Шымкент | Сенсорные прайс чекеры цена</title>
    <!--/tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="keywords" content="микрокиоск, zebra, mk500, прайс чекер, для проверки цен, алматы, купить, цена, продажа." />
    <meta name="description" content="Купить Микрокиоск Zebra MK500 купить Шымкент для проверки цен по доступным ценам. Широкий выбор сенсорных прайс чекеров Zebra от компании Softgroup">
    <!--//tags -->
    <link href="/css/bootstrap.css" rel="stylesheet" type="text/css" media="all" />
    <link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" media="all" />
    <link rel="stylesheet" href="/css/flexslider.css" type="text/css" media="screen" />
    <link href="/css/font-awesome.css" rel="stylesheet">
    <link href="/css/easy-responsive-tabs.css" rel='stylesheet' type='text/css' />
    <link href="/css/style.css" rel="stylesheet" type="text/css" media="all" />
    <link href="/css/jqcart.css" rel="stylesheet" type="text/css" media="all" />
    <link rel="shortcut icon" src="/images/favicon.ico" type="image/x-icon">
</head>

<body>
    <div class="header-bot" id="home">
        <!-- фильтр под регионы -->
        <div class="header-bot_inner_wthreeinfo_header_mid">
            <div class="fond">
                <div id="myfond_gris" opendiv=""></div>
                <div iddiv="box_2" class="mymagicoverbox"> <i class="fa fa-map-marker" aria-hidden="true"></i> Алматы <i class="fa fa-caret-down " aria-hidden="true"></i> </div>
                <link href='http://fonts.googleapis.com/css?family=Roboto:100,400,300,500,700' rel='stylesheet' type='text/css'>
                <div id="box_2" class="mymagicoverbox_fenetre">
                    <div class="mymagicoverbox_fenetreinterieur">
                        <ul>
                            <li><a href="aktau/pos_mk_500.php">Актау</a></li>
                            <li><a href="aktobe/pos_mk_500.php">Актобе</a></li>
                            <li><a href="pos_mk_500.php">Алматы</a></li>
                            <li><a href="atyrau/pos_mk_500.php">Атырау</a></li>
                            <li><a href="janaozen/pos_mk_500.php">Жанаозен</a></li>
                            <li><a href="jezkazgan/pos_mk_500.php">Жезказган</a></li>
                            <li><a href="karaganda/pos_mk_500.php">Караганда</a></li>
                            <li><a href="kokshetau/pos_mk_500.php">Кокшетау</a></li>
                            <li><a href="kostanai/pos_mk_500.php">Костанай</a></li>
                            <li><a href="kyzylorda/pos_mk_500.php">Кызылорда</a></li>
                        </ul>
                        <ul class="dlya_left">
                            <li><a href="astana/pos_mk_500.php">Нур-Султан</a></li>
                            <li><a href="pavlodar/pos_mk_500.php">Павлодар</a></li>
                            <li><a href="petropavlovsk/pos_mk_500.php">Петропавловск</a></li>
                            <li><a href="semei/pos_mk_500.php">Семей</a></li>
                            <li><a href="taldykorgan/pos_mk_500.php">Талдыкорган</a></li>
                            <li><a href="taraz/pos_mk_500.php">Тараз</a></li>
                            <li><a href="turkestan/pos_mk_500.php">Туркестан</a></li>
                            <li><a href="uralsk/pos_mk_500.php">Уральск</a></li>
                            <li><a href="ust-kamenogorsk/pos_mk_500.php">Усть-Каменогорск</a></li>
                            <li><a href="shymkent/pos_mk_500.php">Шымкент</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div> <!-- end фильтр под регионы -->
        <div class="header-bot_inner_wthreeinfo_header_mid">

            <!-- header-bot -->
            <div class="col-md-4 logo_agile">
                <p><a href="index.html"><span>Soft</span>Gr<img src="/images/globe1.png">up</a></p>
            </div>
            <!-- header-bot -->
            <div class="col-md-4 agileits-social top_content">
                <div class="nomer"><a href="tel:87273449900">8(727) <span>344-99-00</span></a></div>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
    <div class="ban-top">
        <div class="container">
            <div class="top_nav_left">
                <nav class="navbar navbar-default">
                    <div class="container-fluid">
                        <!-- Brand and toggle get grouped for better mobile display -->
                        <div class="navbar-header">
                            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span class="sr-only">Toggle navigation</span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                            </button>
                        </div>
                        <!-- Collect the nav links, forms, and other content for toggling -->
                        <div class="collapse navbar-collapse menu--shylock" id="bs-example-navbar-collapse-1">
                            <ul class="nav navbar-nav menu__list">
                                <li class=" menu__item"><a class="menu__link" href="index.html">Главная <span class="sr-only">(current)</span></a></li>
                                <li class=" active menu__item menu__item--current"><a class="menu__link" href="products.html">Оборудование<span class="sr-only">(current)</span></a></li>

                                <li class=" menu__item"><a class="menu__link" href="uslugi.html">Программы</a></li>
                                <li class=" menu__item"><a class="menu__link" href="otzovik.php">Отзывы</a></li>
                                <li class=" menu__item"><a class="menu__link" href="about.html">О нас</a></li>
                                <li style="margin:0;" class=" menu__item"><a class="menu__link" href="contact.html">Контакты</a></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
            <div class="top_nav_right">
                <span id="open" class="glyphicon glyphicon-shopping-cart my-cart-icon"><span class="badge badge-notify my-cart-badge">
                        <div class="label-place"></div>
                    </span></span>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
    </div>
    <div class="page-head_agile_info_w3l">
        <div class="container">

            <!--/w3_short-->

            <!--//w3_short-->
        </div>
    </div>

    <!-- banner-bootom-w3-agileits -->
    <div class="banner-bootom-w3-agileits">
        <div class="container">
            <div class="services-breadcrumb">
                <div class="agile_inner_breadcrumb">

                    <ul class="w3_short">
                        <li><a href="index.html">Главная</a><i>/</i></li>
                        <li><a href="products.html">Оборудование</a><i>/</i></li>
                        <li><a href="pos.html">Pos системы</a><i>/</i></li>
                        <li>Микрокиоск Zebra MK500</li>
                    </ul>
                </div>
            </div>
            <div class="col-md-333 single-right-left ">
                <div class="grid images_3_of_2">
                    <div class="flexslider">

                        <ul class="slides">
                            <li data-thumb="/images/monitor/23.jpg">
                                <div class="thumb-image"> <img src="/images/monitor/23.jpg" id="target" class="img-responsive"> </div>
                            </li>

                            <li data-thumb="/images/monitor/233.jpg">
                                <div class="thumb-image"> <img src="/images/monitor/233.jpg" class="img-responsive"> </div>
                            </li>
                            <li data-thumb="/images/monitor/2333.jpg">
                                <div class="thumb-image"> <img src="/images/monitor/2333.jpg" class="img-responsive"> </div>
                            </li>
                        </ul>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8 single-right-left simpleCart_shelfItem">
                <h1>Микрокиоск Zebra MK500</h1>
                <hr>
                <p class="code-products">Код товара: 1011</p>
                <p><span class="item_price">172 900 тг. </span></p>
                <div class="rating1">
                    <span class="starRating">
                        <input id="rating55" type="radio" name="rating" value="5" checked="">
                        <label for="rating55">5</label>
                        <input id="rating44" type="radio" name="rating" value="4">
                        <label for="rating44">4</label>
                        <input id="rating33" type="radio" name="rating" value="3">
                        <label for="rating33">3</label>
                        <input id="rating22" type="radio" name="rating" value="2">
                        <label for="rating22">2</label>
                        <input id="rating11" type="radio" name="rating" value="1">
                        <label for="rating11">1</label>
                    </span>
                </div>
                <div class="description">
                    <p>Микрокиоск Zebra - компактное, лёгкое в установке и недорогое устройство, позволяющее центрам розничной торговли внедрить систему самообслуживания в каждый отдел. Таким образом, неважно, в какой части магазина находятся покупатели, помощь всегда будет рядом. Чтобы узнать цену и наличие товара, проверить баланс подарочной карты и бонусных баллов, определить местоположение продукта и вызвать консультанта, покупателю достаточно воспользоваться сканером штрихкода, сенсорной панелью или нажать кнопку.</p>
                    <h3><b>Микрокиоск Zebra состоит из:</b></h3>
                    <p><i class="fa fa-check"></i> Дисплей: Цветной сенсорный 8,9 см, 320 x 240 пикселей</p>
                    <p><i class="fa fa-check"></i> Аудио: Громкоговоритель</p>
                    <p><i class="fa fa-check"></i> Клавиатура: 3-кнопочная</p>

                    <div> <button id="fly" class="add_item" data-id="8" data-title="<a href='https://softgroup.kz/pos_mk_600.php'>Микрокиоск Zebra MK500</a>" data-price="172900" data-quantity="1" data-img="http://softgroup.kz/images/monitor/23.jpg"><i class="fa fa-shopping-cart" aria-hidden="true"></i> В корзину</button></div>
                </div>
            </div>
            <div class="clearfix"> </div>

        </div>

        <!-- /new_arrivals -->
        <div class="responsive_tabs_agileits">
            <div class="bootstrap-tab-text-grids">
                <div class="bootstrap-tab-text-grid" style="background-color: #e5f6f8; padding-bottom:40px">

                    <div class="container">
                        <div class="models" style="margin-top:50px">
                            <p style="font-size:1.9em">Описание</p>
                            <hr>
                        </div>
                        <div style="text-align:center; margin-top:50px">
                            <img src="/images/monitor/sensor4.png" style="text-align:center; "></div>
                        <div class="wthree_text_info">
                            <h2>Чувствительный сенсорный экран Микрокиоска MK500</h2>
                        </div>
                        <p style="line-height:normal">Сенсорный экран с высокой чувствительностью имеет высокую скорость отклика и мгновенно отреагирует на ваше нажатие. Сенсорный экран позволяет сократить время обслуживания клиента: оператору на кассе не нужно делать лишних движений (браться за мышь, наводить курсор в нужное место на экране, тратить секунды на поиск клавиши и т.д.) </p>
                        <div class="clearfix"> </div>
                    </div>
                </div>


                <div class="bootstrap-tab-text-grid" style="padding-bottom:20px">
                    <div class="container">
                        <div style="text-align:center;">
                            <img src="/images/monitor/scanner1.png" style="text-align:center; "></div>
                        <p class="wthree_text_info" style=" color:#ff9601; text-transform:none; margin:40px 0 10px 0">Многоплоскостное сканирование штрих-кода</p>
                        <p style="line-height:normal"> в микрокиоск Zebra МК 500 встроен лазерный многоплоскостной сканер с имидж технологией считывания всех типов штрихкодов (1D/2D ,в том числе PDF 417), в том числе с экранов мобильных телефонов и планшетов. При помощи сканирования, посетители магазина могут получить любую информацию о товаре, его наличии на складе, инструкцию по применению и многое другое </p>
                        <div class="clearfix"> </div>
                    </div>
                </div>
                <div class="bootstrap-tab-text-grid" style="background-color: #e5f6f8;   border-top: 1px solid #eee; padding-bottom:20px">
                    <div class="container">
                        <div style="text-align:center; margin-top:50px">
                            <img src="/images/monitor/intel.png" style="text-align:center; margin-top:20px"></div>
                        <p class="wthree_text_info" style=" color:#ff9601; text-transform:none; margin:40px 0 10px 0">Высокопроизводительный процессор</p>
                        <p style="line-height:normal">Микрокиоск Zebra MK 500 работает на базе мощного процессора Intel Xscale с частотой 520 МГц и операционной системы Windows. Высокопроизводительная
                            архитектура процессора обеспечивает
                            поддержку самых
                            требовательных приложений. </p>
                        <div class="clearfix"> </div>
                    </div>
                </div>


            </div>
        </div>
        <div class="container">
            <div class="models" style="margin-top:70px">
                <p>Характеристика</p>
                <hr>
            </div>
            <table class="zui-table zui-table-zebra zui-table-horizontal">
                <tbody>
                    <tr>

                        <td>Дисплей:</td>
                        <td> Цветной сенсорный 8,9 см, 320 x 240 пикселей</td>
                    </tr>
                    <tr>

                        <td>Разъем расширения:</td>
                        <td>MicroSD</td>
                    </tr>
                    <tr>

                        <td>ОС:</td>
                        <td>(OC):Windows CE Net 5.0</td>
                    </tr>
                    <tr>

                        <td>Оперативная память:</td>
                        <td>64MB ОЗУ; 64MB ПЗУ</td>
                    </tr>
                    <tr>

                        <td>Тип сканера:</td>
                        <td>Лазерный многоплоскостной сканер/имидж-технология</td>
                    </tr>
                    <tr>

                        <td>Аудио:</td>
                        <td> Громкоговоритель</td>
                    </tr>
                    <tr>

                        <td>Клавиатура:</td>
                        <td> 3-кнопочная</td>
                    </tr>
                    <tr>

                        <td>Дополнительно:</td>
                        <td>Mini USB 1.1, Ethernet RJ-45</td>
                    </tr>

                    <tr>

                        <td>Ударопрочность: </td>
                        <td> Выдерживает 500 падений с высоты 0, 5 м</td>
                    </tr>

                    <tr>
                        <td>Питания: </td>
                        <td>PoE: Питание через Ethernet 802.3af’</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>
    <div class="container">
        <div class="models">
            <p>Автоматизация торговли:</p>
            <hr>
        </div>
        <div>
            <div class="col-md-333 product-men"><a href="r_keeper.html">
                    <div class="men-pro-item " style="border:none;">
                        <div class="men-thumb-item qwe">
                            <img src="/images/caffe.jpg" alt="" class="pro-image-front" style="border-radius: 1000px; ">
                            <img src="/images/caffe.jpg" alt="" class="pro-image-back" style="border-radius: 1000px; ">

                        </div>
                        <div class="qwe">
                            R-keeper
                            <p class="text1">Автоматизация ресторанов</p>
                        </div>
                    </div>
                </a>
            </div>

            <div class="col-md-333 product-men"><a href="1c.html">
                    <div class="men-pro-item " style="border:none;">
                        <div class="men-thumb-item qwe">
                            <img src="/images/magazin.jpg" alt="" class="pro-image-front" style="border-radius:1000px; ">
                            <img src="/images/magazin.jpg" alt="" class="pro-image-back" style="border-radius: 1000px; ">

                        </div>
                        <div class="qwe">
                            1C Розница
                            <p class="text1">Автоматизация магазинов</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-md-333 product-men"><a href="pharmacy.html">
                    <div class="men-pro-item " style="border:none;">
                        <div class="men-thumb-item qwe">
                            <img src="/images/apteka.jpg" alt="" class="pro-image-front" style="border-radius:1000px; ">
                            <img src="/images/apteka.jpg" alt="" class="pro-image-back" style="border-radius: 1000px; ">

                        </div>
                        <div class="qwe">
                            1С Аптека
                            <p class="text1">Автоматизация аптек</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-md-333 product-men"><a href="umag_magazin.html">
                    <div class="men-pro-item " style="border:none;">
                        <div class="men-thumb-item qwe">
                            <img src="/images/odejda.jpg" alt="" class="pro-image-front" style="border-radius:1000px; ">
                            <img src="/images/odejda.jpg" alt="" class="pro-image-back" style="border-radius: 1000px; ">

                        </div>
                        <div class="qwe">
                            Umag
                            <p class="text1">Автоматизация розничной торговли</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="video"><iframe width="1000" height="563" src="https://www.youtube.com/embed/jpDM-Ybi5DE?rel=0&autoplay=0" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
        <!--/slider_owl-->
        <?php
function parents($up=0, $left=0) {    //Строим иерархическое дерево комментариев
global $tag,$mess_url;

for ($i=0; $i<=count($tag[$up])-1; $i++) {
 //Можно выделять цветом указанные логины
 if ($tag[$up][$i][2]=='Admin') $tag[$up][$i][2]='<font color="#C00">Admin</font>';
 if ($tag[$up][$i][6]==0) $tag[$up][$i][6]=$tag[$up][$i][0];
 //Высчитываем рейтинг комментария
 $sum=$tag[$up][$i][4]-$tag[$up][$i][5];

 if ($up==0) echo '<div class="otz" style=" color: #2a4f5e;  margin-left:104px; margin-top:25px; border-bottom: 1px solid #e6e6ec; padding-bottom:10px; float:none!important; width:850px;">';
 else {
    if (count($tag[$up])-1!=$i)
        echo '<div class="strelka" style="padding:5px 0 0 '.($left-2).'px;">';
    else echo '<div class="strelka_2" style="padding:5px 0 0 '.$left.'px;">';
 }
 echo '<div class="comm_head" id="m'.$tag[$up][$i][0].'">';
 echo '<div style="float:left; margin-right:5px; font-size:16px!important; color:#2a4f5e;"><b>'.$tag[$up][$i][3].'</b></div>';
 echo '<div style="text-align:right; float:none">  '.date("d.m.Y в H:i ", $tag[$up][$i][4]).'</div></div>';
 echo '<div style="float:none; display:none;"> '.$tag[$up][$i][2].' </div>';
 if ($tag[$up][$i][2]==5) echo '<img src="/images/five.png">';
 elseif ($tag[$up][$i][2]==4){
	 echo '<img src="/images/four.png">';
 }
 elseif ($tag[$up][$i][2]==3) {
	 echo '<img src="/images/three.png">';
 }
 elseif ($tag[$up][$i][2]==2) {
	 echo '<img src="/images/two.png">';
 }
 else echo '<img src="/images/one.png">';
 echo '<div style="clear:both; "></div>';
 echo '<div class="comm_body"  style="float:none!important; margin:15px 0 20px 0;">';
 if ($sum<0) echo '<u class="sp_link">Показать/скрыть</u><div class="comm_text">';
 else echo '<div style="word-wrap:break-word; float:none!important;">';
 echo str_replace("<br />","<br>",nl2br($tag[$up][$i][1])).'</div>';

 if (isset($tag[ $tag[$up][$i][0] ])) parents($tag[$up][$i][0],20);
 echo '</div></div>';
}
}

$res=mysqli_query($db,"SELECT * FROM posa1
    WHERE theme_id='".$theme_id."' ORDER BY id");
$number=mysqli_num_rows($res);

if ($number>0) {
 echo '<div style="padding-top:10px;">';
 echo '<div style="float:none;font-size:26px; font-weight:bold;padding: 10px 0px 10px; color: #0ba98b; "><div  class="models"><p>Отзывы</p><hr></div></div>';
 while ($com=mysqli_fetch_assoc($res))
    $tag[(int)$com["parent_id"]][] = array((int)$com["id"], $com["message"], $com["rating"],
    $com["login"], $com["date"], $com["plus"], $com["minus"], $com["first_parent"]);
 echo parents().'</div><br>';
}
?>
        <?php
$cod=rand(100,900); $cod2=rand(10,99);
echo '<div id="last" >';

echo '<form method="POST" action="'.$mess_url.'#last" class="add_comment">';
echo '<div style="float:none; font-size:22px; font-weight:bold; color:#f36f21; padding: 40px 0px 10px; ">Оставить отзыв</div>';
echo '<div class="oott" style="margin-left:65px; margin-top:10px; float:none;">';
echo '<div style="float:left; margin-right:5px;">Имя*</div>';
echo '<input style="height:23px; width:419px; " type="text" name="mess_login" maxlength="20" value=""></div>';
echo '<div class="oott" style="float:none;margin-left:47px; margin-top:10px">';
echo '<div  style="float:left; margin-right:5px;">Отзыв*</div>';
echo '<textarea cols="50" rows="5" name="user_text"></textarea>';
echo '</div>';
echo '<div class="rating1" style="margin-left:0px; margin-top:10px;">Ваша оценка:';
					echo '	<span class="starRating">';
						echo '	<input id="rating5" type="radio" name="rating" value="5"  checked="">';
							echo '<label for="rating5">5</label>';
							echo '<input id="rating4" type="radio" name="rating" value="4">';
							echo '<label for="rating4">4</label>';
							echo '<input id="rating3" type="radio" name="rating" value="3">';
							echo '<label for="rating3">3</label>';
							echo '<input id="rating2" type="radio" name="rating" value="2">';
							echo '<label for="rating2">2</label>';
							echo '<input id="rating1" type="radio" name="rating" value="1" >';
							echo '<label for="rating1">1</label>';
						echo '</span>';
					echo '</div>';
echo '<div class="ott" style="margin-top:10px; margin-left:29px; float:none">'.$cod.' + '.$cod2.' = ';
echo '<input  type="hidden" name="prov_summa" value="'.md5($cod+$cod2).'">';
echo '<input style="height:22px;" type="text" name="contr_cod" maxlength="4" size="4">&nbsp;</div>';

echo '<div style="margin-top:15px; margin-left:104px;"><input class="knopka" style="height:28px; font-size: 14px !important;
    background: #3a5265;
    border: 0px solid #007f87;
        box-shadow: 0 2px 2px 0 #606060;
		    -webkit-border-radius: 5px;
    text-shadow: none;
    float: left;
    width: 150px;
    line-height: normal;
    color: #fff;
    cursor: pointer;
 
    outline: none;" type="submit" value="Отправить" ></div>';
echo '</form></div>';
?>
        <div class="w3_agile_latest_arrivals">
            <div class="ll">
                <p class="wthree_text_info">Похожие <span>товары</span></p>
            </div>
            <div class="col-md-3 product-men single">
                <div class="men-pro-item">
                    <a href="pos_376.php">
                        <div class="men-thumb-item"><img src="/images/p1.png" alt="" class="pro-image-front">
                            <img src="/images/p1.png" alt="" class="pro-image-back">

                            <span class="product-new-top">New</span></div>
                    </a>
                    <div class="item-info-product ">
                        <h4><a href="pos_376.php">Pos-система Для Магазина</a></h4>

                    </div>
                </div>
            </div>
            <div class="col-md-3 product-men single">
                <div class="men-pro-item">
                    <a href="pos_t3.php">
                        <div class="men-thumb-item"><img src="/images/p3.png" alt="" class="pro-image-front">
                            <img src="/images/p3.png" alt="" class="pro-image-back">

                            <span class="product-new-top">New</span></div>
                    </a>
                    <div class="item-info-product ">
                        <h4><a href="pos_t3.php">Сенсорный моноблок T3</a></h4>

                    </div>
                </div>
            </div>
            <div class="col-md-3 product-men single">
                <div class="men-pro-item">
                    <a href="pos_3072.php">
                        <div class="men-thumb-item"><img src="/images/p4.png" alt="" class="pro-image-front">
                            <img src="/images/p4.png" alt="" class="pro-image-back"></div>
                    </a>
                    <div class="item-info-product ">
                        <h4><a href="pos_3072.php">Сенсорный моноблок 3072 </a></h4>

                    </div>
                </div>
            </div>
            <div class="col-md-3 product-men single">
                <div class="men-pro-item">
                    <a href="pos_t6.php">
                        <div class="men-thumb-item"><img src="/images/p2.png" alt="" class="pro-image-front">
                            <img src="/images/p2.png" alt="" class="pro-image-back">

                            <span class="product-new-top">New</span></div>
                    </a>
                    <div class="item-info-product ">
                        <h4><a href="pos_t6.php">Сенсорный моноблок T6</a></h4>


                    </div>
                </div>
            </div>
            <div class="clearfix"> </div>
            <!--//slider_owl-->
        </div>
    </div>
    </div>
    <!--//single_page-->
    <div class="coupons">
        <div class="coupons-grids text-center">
            <div class="w3layouts_mail_grid">
                <div class="col-md-3 w3layouts_mail_grid_left">
                    <div class="w3layouts_mail_grid_left1 hvr-radial-out">
                        <i class="fa fa-truck" aria-hidden="true"></i>
                    </div>
                    <div class="w3layouts_mail_grid_left2">
                        <p style="font-size: 1.1em; color: #26a69a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600;">Бесплатная Доставка</p>
                        <p>Оперативная доставка - БЕСПЛАТНО. Осуществляется доставка во все регионы РК.</p>
                    </div>
                </div>
                <div class="col-md-3 w3layouts_mail_grid_left">
                    <div class="w3layouts_mail_grid_left1 hvr-radial-out">
                        <i class="fa fa-cogs" aria-hidden="true"></i>
                    </div>
                    <div class="w3layouts_mail_grid_left2">
                        <p style="font-size: 1.1em; color: #26a69a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600;">Сервисное обслуживание</p>
                        <p>Технические специалисты помогут вам настроить оборудование под ваши требования</p>
                    </div>
                </div>
                <div class="col-md-3 w3layouts_mail_grid_left">
                    <div class="w3layouts_mail_grid_left1 hvr-radial-out">
                        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                    </div>
                    <div class="w3layouts_mail_grid_left2">
                        <p style="font-size: 1.1em; color: #26a69a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600;">Огромный выбор товара</p>
                        <p>У нас есть все виды оборудования для автоматизации любого вида торговли</p>
                    </div>
                </div>
                <div class="col-md-3 w3layouts_mail_grid_left">
                    <div class="w3layouts_mail_grid_left1 hvr-radial-out">
                        <i class="fa fa-users" aria-hidden="true"></i>
                    </div>
                    <div class="w3layouts_mail_grid_left2">
                        <p style="font-size: 1.1em; color: #26a69a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600;">Квалифицированные специалисты</p>
                        <p>Наши сотрудники владеют умением и навыками для качественной работы с клиентами</p>
                    </div>
                </div>
                <div class="clearfix"> </div>
            </div>

        </div>
    </div>
    <!--grids-->
    <!-- footer -->
    <div class="footer">
        <div class="footer_agile_inner_info_w3l">
            <div class="col-md-3 footer-left">
                <div class="sign-gd">

                    <ul>
                        <li><a href="index.html">Главная</a></li>
                        <li><a href="products.html">Оборудование</a></li>
                        <li><a href="service.html">Программы</a></li>
                        <li><a href="otzovik.php">Отзывы</a></li>
                        <li><a href="about.html">О нас</a></li>
                        <li><a href="contact.html">Контакты</a></li>
                        <li><a href="index.html">Кассовое оборудование</a></li>
                        <li><a href="r_keeper.html">Автоматизация ресторанов</a></li>
                        <li><a href="1c.html">Автоматизация магазинов</a></li>
                        <li><a href="umag_magazin.html">Автоматизация продуктовых магазинов</a></li>
                    </ul>
                </div>
            </div>
            <div class="col-md-9 footer-right">
                <div class="sign-grds">
                    <div class="col-md-4 sign-gd">

                        <ul>
                            <li><a href="pos.html">POS системы</a></li>
                            <li><a href="monoblock.html">Сенсорные моноблоки</a></li>
                            <li><a href="scanner.html">Сканеры штрих-кодов</a></li>
                            <li><a href="receipt.html">Принтеры чеков</a></li>
                            <li><a href="label.html">Принтеры этикеток</a></li>
                            <li><a href="scale.html">Весы электронные</a></li>
                            <li><a href="till.html">Денежные ящики</a></li>
                            <li><a href="terminal.html">Терминалы сбора данных</a></li>
                            <li><a href="banknotes.html">Счетчики и детекторы банкнот</a></li>
                            <li><a href="eas.html">Антикражное оборудование</a></li>
                        </ul>
                    </div>

                    <div class="col-md-5 sign-gd-two">

                        <div class="w3-address">
                            <div class="w3-address-grid">
                                <div class="w3-address-left">
                                    <i class="fa fa-phone" aria-hidden="true"></i>
                                </div>
                                <div class="w3-address-right">
                                    <p style="margin:0">Телефон:</p>
                                    <p><a href="tel:87273449900">8 (727) 344-99-00</a></p>
                                    <p><a href="tel:87012667700">+7 (701) 266-77-00</a></p>

                                </div>
                                <div class="clearfix"> </div>
                            </div>
                            <div class="w3-address-grid">
                                <div class="w3-address-left">
                                    <i class="fa fa-envelope" aria-hidden="true"></i>
                                </div>
                                <div class="w3-address-right">
                                    <p style="margin:0">Email</p>
                                    <p><a href="mailto:zakaz@idiamarket.kz"> zakaz@idiamarket.kz</a></p>
                                </div>
                                <div class="clearfix"> </div>
                            </div>
                            <div class="w3-address-grid">
                                <div class="w3-address-left">
                                    <i class="fa fa-map-marker" aria-hidden="true"></i>
                                </div>
                                <div class="w3-address-right">
                                    <p style="margin:0">Адрес</p>
                                    <p>ул. Мынбаева 43 (уг. ул. между Ауезова и Манаса), 1-этаж, 050008

                                    </p>
                                </div>
                                <div class="clearfix"> </div>
                            </div>
                            <div id="socialMedia" class="span3 pull-right">
                                <a href="https://www.youtube.com/channel/UCNDMIviMuZOhhCP7xoxGYAA/videos"><img width="50" height="50" src="/images/youtube.png" title="youtube" alt="youtube" /></a><a href="https://www.instagram.com/idiamarket/"><img width="50" height="50" src="/images/insta.png" title="instagram" alt="instagram"></a>
                            </div>
                        </div>
                    </div>

                    <div class="clearfix"></div>
                </div>
            </div>
            <div class="clearfix"></div>

            <p class="copy-right">&copy 2010-2022 SoftGroup</p>
        </div>
    </div>
    <!-- //footer -->


    <!-- js -->
    <script type="text/javascript" src="/js/jquery-2.1.4.min.js"></script>
    <!-- //js -->
    <script src="/js/modernizr.custom.js"></script>
    <!-- Custom-JavaScript-File-Links -->
    <!-- cart-js -->
    <script type="text/javascript">
        $(document).ready(function() {
            $("#fly").click(function() {
                $("#target")
                    .clone()
                    .css({
                        'position': 'absolute',
                        'z-index': '100'
                    })
                    .appendTo("#fly")
                    .animate({
                        opacity: 0.8,
                        marginLeft: 550,
                        marginTop: -900,
                        /* Важно помнить, что названия СSS-свойств пишущихся  
                                                    через дефис заменяются на аналогичные в стиле "camelCase" */
                        width: 100,
                        height: 100
                    }, 500, function() {
                        $(this).remove();
                    });
            });
        });

    </script>
    <link href="/css/jqcart.css" rel="stylesheet" type="text/css">
    <script src="/js/jquery-1.11.3.min.js"></script>
    <script src="/js/jqcart.min.js"></script>
    <script>
        $(function() {
            'use strict';
            // инициализация плагина
            $.jqCart({
                buttons: '.add_item',
                handler: './request/handler.php',
                cartLabel: '.label-place',
                visibleLabel: true,
                openByAdding: false,
                currency: 'тг'
            });
            // Пример с дополнительными методами
            $('#open').click(function() {
                $.jqCart('openCart'); // открыть корзину
            });
        });

    </script>
    <!-- //cart-js -->
    <!-- single -->
    <script src="/js/imagezoom.js"></script>
    <!-- single -->
    <!-- script for responsive tabs -->
    <script src="/js/easy-responsive-tabs.js"></script>
    <script>
        $(document).ready(function() {
            $('#horizontalTab').easyResponsiveTabs({
                type: 'default', //Types: default, vertical, accordion           
                width: 'auto', //auto or any width like 600px
                fit: true, // 100% fit in a container
                closed: 'accordion', // Start closed if in accordion view
                activate: function(event) { // Callback function if tab is switched
                    var $tab = $(this);
                    var $info = $('#tabInfo');
                    var $name = $('span', $info);
                    $name.text($tab.text());
                    $info.show();
                }
            });
            $('#verticalTab').easyResponsiveTabs({
                type: 'vertical',
                width: 'auto',
                fit: true
            });
        });

    </script>
    <!-- FlexSlider -->
    <script src="/js/jquery.flexslider.js"></script>
    <script>
        $('.flexslider').flexslider({
            directionNav: false,
            slideshow: false,
            animation: "slide",
            controlNav: "thumbnails",
            controlsContainer: ".flex-container",
            start: function(slider) {
                $('.slides li img').click(function(event) {
                    event.preventDefault();
                    slider.flexAnimate(slider.getTarget("next"));
                });
            }
        });

    </script>
    <!-- //FlexSlider-->
    <!-- //script for responsive tabs -->
    <!-- start-smoth-scrolling -->
    <script type="text/javascript" src="/js/move-top.js"></script>
    <script type="text/javascript" src="/js/jquery.easing.min.js"></script>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            $(".scroll").click(function(event) {
                event.preventDefault();
                $('html,body').animate({
                    scrollTop: $(this.hash).offset().top
                }, 1000);
            });
        });

    </script>

    <!-- //here ends scrolling icon -->

    <!-- for bootstrap working -->
    <script type="text/javascript" src="/js/bootstrap.js"></script>
    <!-- WhatsHelp.io widget -->
    <script type="text/javascript">
        (function() {
            var options = {
                whatsapp: "+7 (701) 877-33-00", // WhatsApp number
                telegram: "botaidiamarket", // Telegram number

                email: "zakaz@idiamarket.kz", // Email
                sms: "+7 (701) 877-33-00", // Sms phone number
                call: "8 (727) 344-99-00", // Call phone number
                company_logo_url: "//softgroup.kz/images/globe1.png", // URL of company logo (png, jpg, gif)
                greeting_message: "Выберите удобный для Вас способ связи с нами.", // Text of greeting message
                call_to_action: "Если у вас есть вопросы, пишите нам.", // Call to action
                button_color: "#FF6550", // Color of button
                position: "right", // Position may be 'right' or 'left'
                order: "whatsapp,telegram,sms,call,email", // Order of buttons
            };
            var proto = document.location.protocol,
                host = "whatshelp.io",
                url = proto + "//static." + host;
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = url + '/widget-send-button/js/init.js';
            s.onload = function() {
                WhWidgetSendButton.init(host, proto, options);
            };
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
        })();

    </script>
    <script type="text/javascript">
        $(document).ready(function() {
            $(".mymagicoverbox").click(function() {
                $('#myfond_gris').fadeIn(300);
                var iddiv = $(this).attr("iddiv");
                $('#' + iddiv).fadeIn(300);
                $('#myfond_gris').attr('opendiv', iddiv);
                return false;
            });
            $('#myfond_gris, .mymagicoverbox_fermer').click(function() {
                var iddiv = $("#myfond_gris").attr('opendiv');
                $('#myfond_gris').fadeOut(300);
                $('#' + iddiv).fadeOut(300);
            });
            $(".mymagicoverbox").click(function() {
                $("body").attr("style", "overflow:hidden;");
            });
            $("#myfond_gris").click(function() {
                $("body").attr("style", "overflow:visible;");
            });
        });

    </script> <!-- /WhatsHelp.io widget -->
</body>
<script src="js/main.js"></script>

</html>
