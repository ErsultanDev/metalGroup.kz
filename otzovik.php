<!DOCTYPE html>

<html>
<?php
$time = time();
if (session_id() == '') session_start();

$db = mysqli_connect("localhost", "v_20478_Gulbanu", "dala3940", "v_20478_metal") or die();
$res = mysqli_query($db, "set names utf8");

$mess_url = mysqli_real_escape_string($db, basename($_SERVER['SCRIPT_FILENAME']));

//получаем id текущей темы
$res = mysqli_query($db, "SELECT id FROM таблица WHERE file_name='" . $mess_url . "'");
$res = mysqli_fetch_array($res);
$theme_id = $res["id"];
$secret = '6Leh3rYeAAAAAP4yzsq3nMiOC4j2CZNJg1_9Q06I';
//get verify response data
$verify = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . $secret . '&response=' . $_POST['g-recaptcha-response']);
$respponse = json_decode($verify);


//your site secret key


if ($respponse->success) {    //отправлен комментарий
    $mess_login = htmlspecialchars($_POST["mess_login"]); // name
    $user_text = htmlspecialchars($_POST["user_text"]); // otziv
    $rating = htmlspecialchars($_POST["rating"]); // rating
    $city_text = htmlspecialchars($_POST["mess_gorod"]); // gorod

    if ($mess_login != '' and $user_text != '') {
        if (is_numeric($_POST["parent_id"]) and is_numeric($_POST["f_parent"]))
            $res = mysqli_query($db, "insert into comment1
    (parent_id, first_parent, date, theme_id, login, gorod, message, rating)
    values ('" . $_POST["parent_id"] . "','" . $_POST["f_parent"] . "',
    '" . $time . "','" . $theme_id . "','" . $mess_login . "','" . $city_text . "','" . $user_text . "','" . $rating . "')");
        else $res = mysqli_query($db, "insert into comment1 (date, theme_id, login,gorod, message, rating)
   values ('" . $time . "','" . $theme_id . "','" . $mess_login . "','" . $mess_gorod . "','" . $user_text . "','" . $rating . "')");
        $_SESSION["send"] = "Комментарий принят!";
        header("Location: $mess_url#last");
        exit;
    } else {
        $_SESSION["send"] = "Не все поля заполнены!";
        header("Location: $mess_url#last");
        exit;
    }
}



if (isset($_POST["contr_cod"])) {    //отправлен комментарий
    $mess_login = htmlspecialchars($_POST["mess_login"]);
    $mess_gorod = htmlspecialchars($_POST["mess_gorod"]);
    $user_text = htmlspecialchars($_POST["user_text"]);
    $rating = htmlspecialchars($_POST["rating"]);
    if (md5($_POST["contr_cod"]) == $_POST["prov_summa"]) {    //код правильный
        if ($mess_login != '' and $mess_gorod != '' and $user_text != '') {
            if (is_numeric($_POST["parent_id"]) and is_numeric($_POST["f_parent"]))
                $res = mysqli_query($db, "insert into comment1
    (parent_id, first_parent, date, theme_id, login, gorod, message, rating)
    values ('" . $_POST["parent_id"] . "','" . $_POST["f_parent"] . "',
    '" . $time . "','" . $theme_id . "','" . $mess_login . "','" . $mess_gorod . "','" . $user_text . "', '" . $rating . "')");
            else $res = mysqli_query($db, "insert into comment1 (date, theme_id, login, gorod, message, rating)
   values ('" . $time . "','" . $theme_id . "','" . $mess_login . "','" . $mess_gorod . "','" . $user_text . "','" . $rating . "')");
            $_SESSION["send"] = "Комментарий принят!";
            header("Location: $mess_url#last");
            exit;
        } else {
            $_SESSION["send"] = "Не все поля заполнены!";
            header("Location: $mess_url#last");
            exit;
        }
    } else {
        $_SESSION["send"] = "Неверный проверочный код!";
        header("Location: $mess_url#last");
        exit;
    }
}

if (isset($_SESSION["send"]) and $_SESSION["send"] != "") {    //вывод сообщения
    echo '<script type="text/javascript">alert("' . $_SESSION["send"] . '");</script>';
    $_SESSION["send"] = "";
}
?>
<style type="text/css">
    .add_comment {
        display: table;
        width: 50%;
        color: #44494c;

    }



    .comm_head {
        padding: 0 0 10px;
        color: #949494;
        font-size: 14px !important;
        float: none !important;
    }

    .comm_body {
        margin-bottom: 10px;
        font-size: 16px;

        padding: 0 0 10px;
    }

    .close_hint,
    .open_hint {
        float: right;
        border: 1px solid #77A;
        background: #6e6;
        width: 100px;
        text-align: center;
        cursor: pointer;
    }

    .close_hint {
        margin: 5px;
        color: #F00;
    }

    .comm_minus {
        background: url('image/minus.png') no-repeat;
    }

    .comm_plus {
        background: url('image/plus.png') no-repeat;
    }

    .comm_minus,
    .comm_plus {
        float: right;
        width: 19px;
        height: 18px;
        cursor: pointer;
    }

    .comm_text {
        display: none;
    }

    .sp_link {
        color: #F33;
        cursor: pointer;
    }

    .strelka {
        background: url(image/strelka.png) no-repeat;
        border-left: 2px solid #000;
    }

    .strelka_2 {
        background: url(image/strelka_2.png) no-repeat;
    }

    #hint {
        position: absolute;
        display: none;
        z-index: 100;
    }

    @media screen and(max-width:860px) {
        .otz b {
            font-size: 15px !important;
        }
    }
</style>

<head>
    <script src='https://www.google.com/recaptcha/api.js'></script>
    <!-- Google Tag Manager -->
    <script>
        (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-WVWNZ4V');
    </script><!-- End Google Tag Manager -->

    <meta charset="utf-8" />
    <title>Отзывы наших клиентов о работе компании – Metalgroup.kz</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" href="images/Icon.ico" type="image/x-icon">
    <meta name="keywords" content="отзывы Metalgroup">
    <meta name="description" content="Отзывы клиентов о компании MetalGroup. Все отзывы публикуются без предварительного рецензирования. Отправить жалобу, благодарность на работу Metalgroup.kz">
    <link rel="stylesheet" type="text/css" href="/css/style.css" media="all" />
    <link rel="stylesheet" type="text/css" href="/css/slick.css">
    <link rel="stylesheet" type="text/css" href="/css/slick-theme.css">
</head>

<body>
    <!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WVWNZ4V" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->
    <div id="header">
        <div class="container">
            <div id="logo">
                <a href="index.html"><img src="/images/logo17.png" alt="" /></a>
            </div>

            <div class="chernyi">
                <p><span style="color:#ffc843; font-weight:600">Звоните нам: </span><a href="tel:87273449900">Алматы 8(727) <b>344 99 00</b></a></p>
                <p> <a href="tel:87172279900">Нур-Султан 8(7172) <b>27 99 00</b></a></p>
            </div>
        </div>
        <div class="linehead_back">
            <div class="linehead">

                <div class="fond">
                    <div id="myfond_gris" opendiv="box_2" data-behaviour="toggle-menu-bg" data-element="toggle-nav-bg"></div>
                    <div iddiv="box_2" class="mymagicoverbox" data-behaviour="toggle-menu-icon">
                        <div class="categories"><a>Категории товаров</a></div>
                    </div>
                    <div id="box_2" class="mymagicoverbox_fenetre" data-element="toggle-nav">
                        <div class="mymagicoverbox_fenetreinterieur">
                            <ul>
                                <div class="hovering-title-wrapper">
                                    <div>
                                        <li class="hovering-title"><a href="#"> Категории товаров</a> </li>
                                    </div>
                                    <div data-behaviour="toggle-menu-close">
                                        <span class="hovering-title_close">×</span>
                                    </div>
                                </div>
                                <li class="hovering"><a href="stellazhtor.html"> Торговые стеллажи</a></li>
                                <li class="hovering2"><a href="sklad.html"> Складские стеллажи</a></li>
                                <li class="hovering3"><a href="pallet.html"> Паллетные стеллажи</a></li>
                                <li class="hovering4"><a href="vitrina.html"> Витрины</a></li>
                                <li class="hovering5"><a href="mebel_butik.html"> Мебель для бутика и аптеки</a></li>
                                <li class="hovering6"><a href="obor.html"> Торговое оборудование</a></li>
                                <li class="hovering7"><a href="holod.html"> Холодильное оборудование</a></li>
                                <li class="hovering8"><a href="neutral.html"> Нейтральное оборудование</a></li>
                                <li class="hovering9"><a href="pos_obor.html"> POS оборудование</a></li>
                                <li class="hovering10"><a href="kassovyie_boksyi.html"> Кассовые боксы</a></li>
                                <li class="hovering11"><a href="met_shkaf.html"> Металлические шкафы</a></li>
                                <li class="hovering12"><a href="horest.html"> Профессиональное кухонное оборудование</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="menu_lists">
                    <ul class="menu">
                        <li class="glavnaya_menu"><a href="index.html"><span>Главная</span></a></li>
                        <li class="tovary_menu"><a href="products.html"><span>Товары</span></a></li>
                        <li class="news_menu"><a href="news.html"><span>Новости</span></a></li>
                        <li class="design_menu"><a href="des.html"><span>3D Дизайн</span></a></li>
                        <li class="dostavka_menu"><a href="services.html"><span>Доставка</span></a></li>
                        <li class="selected otzyvy_menu"><a href="otzovik.php"><span>Отзывы</span></a></li>
                        <li class="about_menu"><a href="about.html"><span>О нас</span></a></li>
                        <li class="dealer_menu"><a href="dealer.php"><span>Дилерам</span></a></li>
                        <li class="contact_menu"><a href="contact.html"><span>Контакты</span></a></li>
                    </ul>
                </div>

            </div>

        </div>
    </div>
    <div id="body">


        <br>

        <div class="footer">
            <div class="section">
                <div>
                    <p class="catalog_contact">Каталог</p>
                    <ul class="tochki">
                        <li>
                            <p><a href="stellazhtor.html"><img src="/images/bullets.png"> Торговые стеллажи</a></p>
                            <hr>
                        </li>

                        <li>
                            <p><a href="sklad.html"><img src="/images/bullets.png"> Складские стеллажи </a>
                                <hr>
                            </p>

                        </li>
                        <li>
                            <p><a href="pallet.html"><img src="/images/bullets.png"> Паллетные стеллажи </a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="vitrina.html"><img src="/images/bullets.png"> Витрины</a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="mebel_butik.html"><img src="/images/bullets.png"> Мебель для бутика и аптеки</a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="obor.html"><img src="/images/bullets.png"> Торговое оборудование </a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="holod.html"><img src="/images/bullets.png"> Холодильное оборудование</a></p>
                            <hr>
                        </li>

                        <li>
                            <p><a href="neutral.html"><img src="/images/bullets.png"> Нейтральное оборудование</a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="pos_obor.html"><img src="/images/bullets.png"> POS оборудование </a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="kassovyie_boksyi.html"><img src="/images/bullets.png"> Кассовые боксы </a></p>
                            <hr>
                        </li>
                        <li>
                            <p><a href="met_shkaf.html"><img src="/images/bullets.png"> Металлические шкафы</a></p>
                            <hr>
                        </li>

                        <li>
                            <p><a href="horest.html"><img src="/images/bullets.png"> Профессиональное кухонное оборудование </a></p>
                        </li>
                    </ul>
                    <br>
                </div>
                <div><a href="contact.html">
                        <p class="catalog_contact">Контакты</p>
                        <ul class="tochki">

                            <li>
                                <p><b>г. Алматы:</b><br> ул. Мынбаева 43 <br>(уг.ул. Манаса),<br> 1-этаж, 050008 </p>


                            </li>
                            <li>
                                <p> 8 (727) 344-99-00<br> +7 (701) 266-77-00 <br>+7 (701) 761-66-00 </p>

                            </li>
                            <li>
                                <p><b>Email: </b>zakaz@idiamarket.kz</p>

                            </li>
                            <br>
                            <li>
                                <p><b>г. Нур-Султан:</b><br> ул. Бейсекбаева 24/1, 2-этаж, <br>мебельный центр DARA </p>


                            </li>
                            <li>
                                <p>8 (7172) 27-99-00<br>‎+7 (701) 511-22-00 <br>+7 (701) 911 55 00 </p>

                            </li>
                            <li>
                                <p><b>Email: </b>astana@idiamarket.kz</p>
                            </li>
                        </ul>
                    </a></div>
            </div>
            <div class="featured featuredNone">

                <div class="otzov">
                    <h1><strong>Отзывы</strong></h1>
                    <hr>


                    <?php
                    function parents($up = 0, $left = 0)
                    {    //Строим иерархическое дерево комментариев
                        global $tag, $mess_url;

                        for ($i = 0; $i <= count($tag[$up]) - 1; $i++) {
                            //Можно выделять цветом указанные логины
                            if ($tag[$up][$i][2] == 'Admin') $tag[$up][$i][2] = '<font color="#C00">Admin</font>';
                            if ($tag[$up][$i][6] == 0) $tag[$up][$i][6] = $tag[$up][$i][0];
                            //Высчитываем рейтинг комментария
                            $sum = $tag[$up][$i][4] - $tag[$up][$i][5];

                            if ($up == 0) echo '<div class="otz" style=" color: #2a4f5e;    border-bottom: 1px solid #e6e6ec; margin-bottom:5px; float:none!important; padding-top:10px;">';
                            else {
                                if (count($tag[$up]) - 1 != $i)
                                    echo '<div class="strelka" style="padding:5px 0 0 ' . ($left - 2) . 'px;">';
                                else echo '<div class="strelka_2" style="padding:5px 0 0 ' . $left . 'px;">';
                            }
                            echo '<div class="comm_head" id="m' . $tag[$up][$i][0] . '">';
                            echo '<div style="margin-right:3px; float:left"> Имя: </div>';
                            echo '<div style="float:left; margin-right:5px; font-size:16px!important; color:#2a4f5e;"> <b>   ' . $tag[$up][$i][3] . ' </b></div>';

                            echo '<div style="margin-right:3px; margin-left:5px; float:left"> | </div>';
                            echo '<div style="margin-right:3px; margin-left:5px; float:left"> Город: </div>';
                            echo '<div style="float:left;  margin-right:5px; font-size:16px!important; color:#2a4f5e; "><b>   ' . $tag[$up][$i][4] . '</b></div>';



                            echo '<div style="text-align:right; float:none; ">  <span style="color:#949494;"><b> ' . date("d.m.Y в H:i ", $tag[$up][$i][5]) . '</div></div>';
                            echo '<div style="float:none; display:none;"> ' . $tag[$up][$i][2] . ' </div>';
                            if ($tag[$up][$i][2] == 5) echo '<img src="/images/icon/five.png">';
                            elseif ($tag[$up][$i][2] == 4) {
                                echo '<img src="/images/icon/four.png">';
                            } elseif ($tag[$up][$i][2] == 3) {
                                echo '<img src="/images/icon/three.png">';
                            } elseif ($tag[$up][$i][2] == 2) {
                                echo '<img src="/images/icon/two.png">';
                            } else echo '<img src="/images/icon/one.png">';


                            echo '<div style="clear:both; "></div>';
                            echo '<div class="comm_body"  style="float:none!important; font-weight:normal; margin-top:7px">';
                            if ($sum > 0) echo '<u class="sp_link">Показать/скрыть</u><div class="comm_text">';
                            else echo '<div style="word-wrap:break-word; float:none!important;">';
                            echo str_replace("<br />", "<br>", nl2br($tag[$up][$i][1])) . '</div>';

                            if (isset($tag[$tag[$up][$i][0]])) parents($tag[$up][$i][0], 20);
                            echo '</div></div>';
                        }
                    }

                    $res = mysqli_query($db, "SELECT * FROM comment1
    WHERE theme_id='" . $theme_id . "' ORDER BY id");
                    $number = mysqli_num_rows($res);

                    if ($number > 0) {
                        echo '<div>';
                        while ($com = mysqli_fetch_assoc($res))
                            $tag[(int)$com["parent_id"]][] = array(
                                (int)$com["id"], $com["message"], $com["rating"],
                                $com["login"], $com["gorod"], $com["date"], $com["plus"], $com["minus"], $com["first_parent"]
                            );
                        echo parents() . '</div><br>';
                    }
                    ?>
                    <?php
                    $cod = rand(100, 900);
                    $cod2 = rand(10, 99);
                    // echo '<div id="last" style="margin-top:30px;">';
                    // echo '<form method="POST" action="'.$mess_url.'#last" class="add_comment"';
                    // echo 'name="add_comment" id="hint"><div class="close_hint">Закрыть</div>';
                    // echo '<textarea cols="68" rows="5" name="user_text"></textarea>';
                    // echo '<div style="margin:5px; float:left;">';
                    // echo 'Имя* <input type="text" name="mess_login" maxlength="20" value=""></div>';
                    // echo '<div style="margin:5px; float:left;">';
                    // echo 'Город* <input type="text" name="mess_gorod" maxlength="20" value=""></div>';
                    // echo '<div style="margin:5px; float:right;">'.$cod.' + '.$cod2.' = ';
                    // echo '<input type="hidden" name="prov_summa" value="'.md5($cod+$cod2).'">';
                    // echo '<input type="hidden" name="parent_id" value="0">';
                    // echo '<input type="hidden" name="f_parent" value="0">';
                    // echo '<input type="text" name="contr_cod" maxlength="4" size="4">&nbsp;';
                    // echo '<input type="submit" value="Отправить"></div>';
                    // echo '</form>';

                    echo '<div class="commentWrapper"><div style="float:none;font-size:18px; margin-bottom:15px; font-weight:bold;" class="commentTitle">Оставить отзыв</div>   <div><div class="commentForm"> <form method="POST" action="' . $mess_url . '#last" class="add_comment">';
                    echo '<div style="text-align:right; margin-top:10px; float:none; font-weight:bold;">';
                    echo '<div class="commentBlock"><div class="commentDescTitle">Имя:</div><div> <input style="height:23px; width:60%; font-weight:normal;  " type="text" name="mess_login" maxlength="20" value=""></div></div></div>';
                    echo '<div style="text-align:right; margin-top:10px; float:none; font-weight:bold;"> <div class="commentBlock"><div class="commentDescTitle">Город:</div>';
                    echo ' <div><input style="height:23px; width:60%; font-weight:normal; " type="text" name="mess_gorod" maxlength="20"  value=""></div></div></div>';
                    echo '<div class="oott" style="float:none;text-align:right;  margin-top:10px">';
                    echo '<div  style="font-weight:bold;"><div><div class="commentBlock"> <div class="commentDescTitle">Отзыв:</div> <div><textarea style="font-weight:normal; width:60.5%;" cols="50" rows="5" name="user_text"></textarea></div></div> </div>';
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
                    echo '</div> ';
                    //echo '<div class="ott" style="margin-top:10px; text-align:right;  float:none">'.$cod.' + '.$cod2.' = ';
                    //echo '<input  type="hidden" name="prov_summa" value="'.md5($cod+$cod2).'">';
                    echo '
					<div class="captcha">
				<div class="g-recaptcha" data-sitekey="6Leh3rYeAAAAAKJ8-NF9YsWDS4HenpyZxrodqJhj"></div>
			</div>
				';
                    //echo '<input style="height:22px;" type="text" name="contr_cod" maxlength="4" size="4"></div>';
                    echo '</div>';
                    echo '<div class="commentBtn" style="margin-top:15px; text-align:right;  float:none;"><input style="height:28px; font-size: 14px !important;
    background: #3a5265;
    border: 0px solid #007f87;
        box-shadow: 0 2px 2px 0 #606060;
		    -webkit-border-radius: 5px;
    text-shadow: none;
    width: 150px;
    line-height: normal;
    color: #fff;
    cursor: pointer;
    outline: none;" type="submit" value="Отправить" ></div>';
                    echo '</form> </div></div> </div>';
                    ?>

                </div>
            </div>

        </div>

    </div>
    </div>

    </div>

    <div style="width:98%; margin: 0 auto;">
        <div class="ll_cl">
            <p>НАШИ КЛИЕНТЫ</p>
        </div>
    </div>
    <section class="variable slider">
        <div><img src="/images/logo/tech.png"></div>
        <div><img src="/images/logo/bee.jpg"></div>
        <div><img src="/images/logo/kaz.png"></div>
        <div><img src="/images/logo/sin.jpg"></div>
        <div><img src="/images/logo/bip.jpg"></div>
        <div><img src="/images/logo/for.png"></div>
        <div><img src="/images/logo/alt.jpg"></div>
        <div><img src="/images/logo/cha.jpg"></div>
        <div><img src="/images/logo/kot.jpg"></div>
        <div><img src="/images/logo/mag.jpg"></div>
        <div><img src="/images/logo/mel.jpg"></div>
        <div><img src="/images/logo/hyu.png"></div>
        <div><img src="/images/logo/arz.png"></div>
        <div><img src="/images/logo/kul.png"></div>
        <div><img src="/images/logo/meg.png"></div>
        <div><img src="/images/logo/pra.jpg"></div>
        <div><img src="/images/logo/hel.png"></div>
        <div><img src="/images/logo/naz.png"></div>
    </section>
    <div id="sidebar">
        <div class="side">
            <div class="footer_wrapper">
                <div class="footer_desc_1">
                    <dd><a href="index.html">Главная</a></dd>
                    <dd><a href="about.html">О нас</a></dd>
                    <dd><a href="contact.html">Контакты</a></dd>
                    <dd><a href="des.html">3D Дизайн</a></dd>
                </div>
                <div class="footer_desc_2">
                    <dd><a href="products.html">Товары</a></dd>
                    <dd><a href="services.html">Доставка и оплата</a></dd>
                    <dd><a href="news.html">Новости</a></dd>
                    <dd><a href="otzovik.php">Отзывы</a></dd>
                </div>

                <div class="footer_logo">
                    <dd style="margin:0"><img src="/images/logo1.png" /></dd>
                </div>

                <div class="footer_address">
                    <div class="footer_address_one">
                        <div class="foooter_address_city">

                            <a href="almaty.html">
                                <h3>
                                    г. Алматы:</h3><br>ул. Мынбаева 43 <br>(уг.ул. Манаса), 1-этаж, <br> Казахстан, Алматы, 050008
                            </a>
                        </div>
                        <div class="footer_address_contacts">
                            <a href="almaty.html"><b></b><br> 8 (727) 344-99-00 <br> +7 (701) 266-77-00</a>
                        </div>
                    </div>

                    <div class="footer_address_two">
                        <div class="foooter_address_city">

                            <a href="astana.html">
                                <h3>
                                    г. Нур-Султан:</h3><br>ул. Бейсекбаева 24/1 <br> бизнес центр DARA, 2-этаж, <br> Казахстан, Нур-Султан, 050008
                            </a>
                        </div>
                        <div class="footer_address_contacts">
                            <a href="astana.html"><b></b><br> 8 (7172) 27-99-00 <br> +7 (701) 511-22-00</a>
                        </div>
                    </div>
                </div>
            </div>


            <div id="socialMedia" class="span3 pull-right"><a href="https://www.youtube.com/channel/UCNDMIviMuZOhhCP7xoxGYAA/videos"><img width="40" height="40" src="/images/youtube.png" title="youtube" alt="youtube"></a><a href="https://www.instagram.com/idiamarket/" style="margin-left:5px"><img width="40" height="40" src="/images/insta.png" title="instagram" alt="instagram"></a></div>
        </div>

    </div>
    </div>
</body>
<!-- Other sliders -->
<script src="https://www.google.com/recaptcha/api.js"></script>
<script src="https://code.jquery.com/jquery-2.2.0.min.js" type="text/javascript"></script>
<script src="js/slick.js" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript">
    $(document).on('ready', function() {
        $(".variable").slick({
            dots: true,
            infinite: true,
            autoplaySpeed: 3500,
            slidesToShow: 5,
            slidesToScroll: 5,
            variableWidth: true
        });
    });
</script>

<!-- Categories -->
<script type="text/javascript">
     function init() {
        $('[data-behaviour="toggle-menu-burger"]').on('click', toggleMenuBurger);
        $('[data-behaviour="toggle-menu-icon"]').on('click', toggleMenuIcon);
        $('[data-behaviour="toggle-menu-close"]').on('click', toggleMenuClose);
        $('[data-behaviour="toggle-menu-bg"]').on('click', toggleMenuBg);
    };
    function toggleMenuBurger() {
        $('[data-element="toggle-nav-burger"]').toggleClass('nav--activeAdap');
        $('[data-element="toggle-nav-bg"]').addClass('menu-icon--open');
        $('body').toggleClass('no-scroll');
    };
    function toggleMenuIcon() {
        $('[data-element="toggle-nav"]').toggleClass('nav--active');
        $('[data-element="toggle-nav-bg"]').addClass('menu-icon--open');
        $('body').toggleClass('no-scroll');
    };

    function toggleMenuClose() {
        $(this).removeClass('menu-icon--open');
        $('[data-element="toggle-nav-burger"]').removeClass('nav--activeAdap');
        $('[data-element="toggle-nav"]').removeClass('nav--active');
        $('[data-element="toggle-nav-bg"]').removeClass('menu-icon--open');
        $('body').toggleClass('no-scroll');
    };

    function toggleMenuBg() {
        $(this).removeClass('menu-icon--open');
        $('[data-element="toggle-nav"]').removeClass('nav--active');
        $('[data-element="toggle-nav-burger"]').removeClass('nav--activeAdap');
        $('body').toggleClass('no-scroll');
    };


    init();

    $(add).on('click', function () {
        $(tab).prop('checked', true);
    })


    $(".mymagicoverbox").click(function () {
        $('#myfond_gris').fadeIn(300);

        var iddiv = $(this).attr("iddiv");
        $('#' + iddiv).fadeIn(300);
        $('#myfond_gris').attr('opendiv', iddiv);
        return false;

    });

    $('#myfond_gris, .mymagicoverbox_fermer').click(function () {

        var iddiv = $("#myfond_gris").attr('opendiv');
        $('#myfond_gris').fadeOut(300);
        $('#' + iddiv).fadeOut(300);

    });


    $(".mymagicoverbox").click(function () {
        $("body").attr("style", "overflow:hidden;");
    });
    $("#myfond_gris").click(function () {
        $("body").attr("style", "overflow:visible;");
    });

    $("#performanceRadioBtns").find("#IndividualPD").prop("checked", true);
</script>
<!-- WhatsHelp.io widget -->

<!-- GoogleAnalytics -->
<script>
    (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o), m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
    ga('create', 'UA-88187213-1', 'auto');
    ga('send', 'pageview');
</script>
<!-- Yandex Metrika -->
<script type="text/javascript">
    (function(d, w, c) {
        (w[c] = w[c] || []).push(function() {
            try {
                w.yaCounter46412580 = new Ya.Metrika({
                    id: 46412580,
                    clickmap: true,
                    trackLinks: true,
                    accurateTrackBounce: true,
                    webvisor: true
                });
            } catch (e) {}
        });

        var n = d.getElementsByTagName("script")[0],
            s = d.createElement("script"),
            f = function() {
                n.parentNode.insertBefore(s, n);
            };
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://mc.yandex.ru/metrika/watch.js";

        if (w.opera == "[object Opera]") {
            d.addEventListener("DOMContentLoaded", f, false);
        } else {
            f();
        }
    })(document, window, "yandex_metrika_callbacks");
</script>
<noscript>
    <div><img src="https://mc.yandex.ru/watch/46412580" style="position:absolute; left:-9999px;" alt="" /></div>
</noscript>

</html>