<!DOCTYPE html>
 
<html>
<head><!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WVWNZ4V');</script><!-- End Google Tag Manager -->
<meta charset="utf-8" />
<title>MetalGroup</title><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" src="/images/Icon.ico" type="image/x-icon">
<link rel="stylesheet" type="text/css" href="/css/style.css" media="all" />
<link rel="stylesheet" type="text/css" href="/css/slick.css">
<link rel="stylesheet" type="text/css" href="/css/slick-theme.css">
<link rel="stylesheet" href="/css/flexslider.css" type="text/css" media="screen" />
</head>
<body><!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WVWNZ4V"height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->

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
        <div class="linehead_back"><div class="linehead">

                                <div class="fond">
                <div id="myfond_gris" opendiv="box_2" data-behaviour="toggle-menu-bg"  data-element="toggle-nav-bg"></div>
                <div iddiv="box_2" class="mymagicoverbox" data-behaviour="toggle-menu-icon">
                    <div class="categories"><a>Категории товаров</a></div>
                </div>
                <div id="box_2" class="mymagicoverbox_fenetre"  data-element="toggle-nav" >
                    <div class="mymagicoverbox_fenetreinterieur">
                        <ul>
                           <div class="hovering-title-wrapper">
                         <div>
                            <li class="hovering-title"><a href="#"> Категории товаров</a> </li>
                         </div>
                         <div data-behaviour="toggle-menu-close">
                            <span class="hovering-title_close" >×</span>
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
                    <li class="selected"><a href="index.html"><span>Главная</span></a></li>
                    <li class="tovary_menu"><a href="products.html"><span>Товары</span></a></li>
                    <li class="news_menu"><a href="news.html"><span>Новости</span></a></li>
                    <li class="design_menu"><a href="des.html"><span>3D Дизайн</span></a></li>
                    <li class="dostavka_menu"><a href="services.html"><span>Доставка</span></a></li>
                    <li class="otzyvy_menu"><a href="otzovik.php"><span>Отзывы</span></a></li>
                    <li class="about_menu"><a href="about.html"><span>О нас</span></a></li><li class="dealer_menu"><a href="dealer.php"><span>Дилерам</span></a></li>
                    <li class="contact_menu"><a href="contact.html"><span>Контакты</span></a></li>
                </ul>
            </div>

        </div>
		<!--
        <div class="search">
            <form action="search.php" method="post" id="search" style="float:left; width:80%">
                <input type="text" name="search" value="Найти товар" onblur="if(this.value=='') this.value='Найти товар';" onfocus="if(this.value=='Найти товар') this.value='';" class="input" />
                <button class="btn--search" type="submit" value="search">
                    <img class="icon" src="/images/searching.png">
                </button></form>
				<img src="/images/controls.png">
        </div>-->
    </div>
</div><div id="body">
<div class="container_p" style="margin-top:30px;">
			<form action="search.php" method="post" class="searching">
	<input type="search" name="" placeholder="поиск" class="input" />
	<input type="submit" name="" value="" class="submit" />
</form>
</div>

	</div><div id="body">	
	<div style="margin:30px 0 20px 30px">
	<div class="zagolovok">По вашему запросу найдено:</div>
				<?php

mysql_connect("localhost","v_20478_Gulbanu","dala3940") or die("couldn't connect");
mysql_query('SET NAMES utf8');
mysql_query('SET CHARACTER SET utf8' );
mysql_query('SET COLLATION_CONNECTION="utf8_general_ci"' ); 

mysql_select_db("v_20478_metal") or die("couldn't connect to database");
$output = '';
if(isset($_POST['search'])){
	$searchq = $_POST['search'];
	$searchq = preg_replace("#[^0-9a-z]#i","",$searchq);
	$query = mysql_query("SELECT * FROM last WHERE keywords LIKE '%$searchq%'") or die("could not search!");
	$count = mysql_num_rows($query);
	if($count == 0){
		$output = '0 результатов!';
	
	}else{
	while($row = mysql_fetch_array($query)){
		$keywords = $row['keywords'];
		$link = $row['link'];
		$name = $row['name'];
		Echo "<a href=$link>$name</a>";
		}
	}
}
?></div>
				<div class="shop_content" style="margin-top:100px;">
							
							<!-- Product Item -->
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(241,241,241,1) 65%);">
							
								 <a href="stellazhtor.html">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/tor1.png" alt=""></div>
								</a><div class="product_content"><a href="stellazhtor.html">
									
									</a><div class="product_name1"><a href="stellazhtor.html"></a><div><a href="stellazhtor.html">Торговые стеллажи</a></div></div>
								</div>
								
							</div>

							<!-- Product Item -->
							<div class="product_item1" style="background: rgb(255,255,255);
background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(194,253,196,1) 65%);">
							 
								  <a href="sklad.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/stellazh 1.png" alt=""></div>
								</a><div class="product_content"><a href="sklad.html" tabindex="0">
									
									</a><div class="product_name1"><a href="sklad.html" tabindex="0"></a><div><a href="sklad.html" tabindex="0">Складские стеллажи</a></div></div>
								</div>
								
							</div>

							<!-- Product Item -->
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(250,214,255,1) 65%);">
							
								 <a href="pallet.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/pallet.png" alt=""></div>
								</a><div class="product_content"><a href="pallet.html" tabindex="0">
									
									</a><div class="product_name1"><a href="pallet.html" tabindex="0"></a><div><a href="pallet.html" tabindex="0">Паллетные стеллажи</a></div></div>
								</div>
								
							</div>

							<!-- Product Item -->
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(255,222,175,1) 36%);">
							
								 <a href="vitrina.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/vit.png" alt=""></div>
								</a><div class="product_content"><a href="vitrina.html" tabindex="0">
									
									</a><div class="product_name1"><a href="vitrina.html" tabindex="0"></a><div><a href="vitrina.html" tabindex="0">Витрины</a></div></div>
								</div>
								
							</div>

							<!-- Product Item -->
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(252,233,193,1) 36%);">
							
								 <a href="apteka.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/pharmacy.png" alt=""></div>
								</a><div class="product_content"><a href="apteka.html" tabindex="0">
									
									</a><div class="product_name1"><a href="apteka.html" tabindex="0"></a><div><a href="apteka.html" tabindex="0">Мебель для бутика и аптеки</a></div></div>
								</div>
								
							</div>
<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(221,240,255,1) 36%);"> 
							
								 <a href="obor.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/1.png" alt=""></div>
								</a><div class="product_content"><a href="obor.html" tabindex="0">
									
									</a><div class="product_name1"><a href="obor.html" tabindex="0"></a><div><a href="obor.html" tabindex="0">Торговое оборудование</a></div></div>
								</div>
								
							</div>
							<!-- Product Item -->
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(214,217,255,1) 48%);"> 
							
								 <a href="holod.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/12.png" alt=""></div>
								</a><div class="product_content"><a href="holod.html" tabindex="0">
									
									</a><div class="product_name1"><a href="holod.html" tabindex="0"></a><div><a href="holod.html" tabindex="0">Холодильное оборудование</a></div></div>
								</div>
								
							</div>
							
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(216,253,220,1) 48%);"> 
							
								 <a href="neutral.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/neutral.png" alt=""></div>
								</a><div class="product_content"><a href="neutral.html" tabindex="0">
									
									</a><div class="product_name1"><a href="neutral.html" tabindex="0"></a><div><a href="neutral.html" tabindex="0">Нейтральное оборудование</a></div></div>
								</div>
								
							</div>
						
						<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(227,227,227,1) 48%);"> 
							
								 <a href="pos_obor.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/poss.png" alt=""></div>
								</a><div class="product_content"><a href="pos_obor.html" tabindex="0">
									
									</a><div class="product_name1"><a href="pos_obor.html" tabindex="0"></a><div><a href="pos_obor.html" tabindex="0">POS оборудование</a></div></div>
								</div>
								
							</div>
							
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(235,252,193,1) 48%);"> 
							
								 <a href="kassovyie_boksyi.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/kas.png" alt=""></div>
								</a><div class="product_content"><a href="kassovyie_boksyi.html" tabindex="0">
									
									</a><div class="product_name1"><a href="kassovyie_boksyi.html" tabindex="0"></a><div><a href="kassovyie_boksyi.html" tabindex="0">Кассовые боксы</a></div></div>
								</div>
								
							</div>
							
							<div class="product_item1" style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(239,218,255,1) 48%);"> 
							
								 <a href="shkaf_doc.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/7.png" alt=""></div>
								</a><div class="product_content"><a href="shkaf_doc.html" tabindex="0">
									
									</a><div class="product_name1"><a href="shkaf_doc.html" tabindex="0"></a><div><a href="shkaf_doc.html" tabindex="0">Металлические шкафы</a></div></div>
								</div>
								
							</div>
							
							<div class="product_item1" style="background: linear-gradient(150deg, rgba(255,255,255,1) 0%, rgba(255,231,231,1) 100%);"> 
							
								 <a href="verstak.html" tabindex="0">
								<div class="product_image d-flex flex-column align-items-center justify-content-center"><img src="/images/9.png" alt=""></div>
								</a><div class="product_content"><a href="verstak.html" tabindex="0">
									
									</a><div class="product_name1"><a href="verstak.html" tabindex="0"></a><div><a href="verstak.html" tabindex="0">Верстаки и аксессуары</a></div></div>
								</div>
								
							</div>
							
				</div>
			 <div style="width:98%; margin: 0 auto;">
		<div class="ll_cl"><p>НАШИ КЛИЕНТЫ</p></div></div>
  <section class="variable slider">
  <div ><img src="/images/logo/tech.png"></div>
  <div ><img src="/images/logo/bee.jpg"></div>
  <div ><img src="/images/logo/kaz.png"></div>
  <div ><img src="/images/logo/sin.jpg"></div>
  <div ><img src="/images/logo/bip.jpg"></div>
  <div ><img src="/images/logo/for.png"></div>
  <div ><img src="/images/logo/alt.jpg"></div>
  <div ><img src="/images/logo/cha.jpg"></div>
   <div ><img src="/images/logo/kot.jpg"></div>
  <div ><img src="/images/logo/mag.jpg"></div>
  <div ><img src="/images/logo/mel.jpg"></div>
  <div ><img src="/images/logo/hyu.png"></div>
  <div ><img src="/images/logo/arz.png"></div>
   <div ><img src="/images/logo/kul.png"></div>
  <div ><img src="/images/logo/meg.png"></div>
  <div ><img src="/images/logo/pra.jpg"></div>
  <div ><img src="/images/logo/hel.png"></div>
  <div ><img src="/images/logo/naz.png"></div>
  <div ><img src="/images/logo/cen.png"></div>
   <div ><img src="/images/logo/ecc.jpg"></div>
  </section>
	<div id="sidebar">
		<div class="side">
  <dl>
    <dd><a  href="index.html">Главная</a></dd><dd><a href="about.html">О нас</a></dd><dd><a  href="contact.html">Контакты</a></dd> <dd><a  href="des.html">3D Дизайн</a></dd>  
  </dl>
  <dl>
  <dd><a href="products.html">Товары</a></dd><dd><a href="services.html">Доставка и оплата</a></dd><dd><a href="news.html">Новости</a></dd><dd><a href="otzovik.php">Отзывы</b></a></dd>	
  </dl>
  <dl>
    <dd style="margin:0"><img src="/images/logo1.png"/></dd>
  </dl>
  <dl>
   <dd><a href="contact.html"><b>Телефон:</b><br>  8 (727) 344-99-00<br>8 (7172) 77-90-88 <br>+7 (701) 101-83-88<br>+7 (701) 266-77-00</a></dd><br>	
  </dl>
  <dl>
   <dd><a href="contact.html"><b>Адрес:</b><br>ул. Мынбаева 43 <br>(уг.ул. Манаса), 1-этаж, <br>   Казахстан, Алматы, 050008</a></dd></dl><div id="socialMedia" class="span3 pull-right"><a href="https://www.youtube.com/channel/UCNDMIviMuZOhhCP7xoxGYAA/videos"><img width="40" height="40" src="/images/youtube.png" title="youtube" alt="youtube"></a><a href="https://www.instagram.com/idiamarket/" style="margin-left:5px"><img width="40" height="40" src="/images/insta.png" title="instagram" alt="instagram"></a></div><div class="footer_divider"></div>
  <p class="footer_text">© 2010-2022  MetalGroup. Все права защищены.</p>
  </div>
  
</div>
		</div>
	</div>


</body>
<script src="js/main.js"></script>
  <!-- Other sliders -->
  <script src="https://code.jquery.com/jquery-2.2.0.min.js" type="text/javascript"></script>
  <script src="/js/slick.js" type="text/javascript" charset="utf-8"></script>
  <script type="text/javascript">
    $(document).on('ready', function() {
        $(".center").slick({
            dots: true,
            infinite: true,
            slidesToShow:4,
            autoplaySpeed: 4500,
            slidesToScroll: 4,
            responsive: [{
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 720,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            }
            ]
        });
      $(".lazy").slick({
        lazyLoad: 'ondemand', // ondemand progressive anticipated
        infinite: true,
		 slidesToShow: 1,
		  autoplaySpeed: 2500,
		arrows: false,
        slidesToScroll: 1
      });
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
            $('[data-behaviour="toggle-menu-icon"]').on('click', toggleMenuIcon);
            $('[data-behaviour="toggle-menu-close"]').on('click', toggleMenuClose);
            $('[data-behaviour="toggle-menu-bg"]').on('click', toggleMenuBg);
        };

        function toggleMenuIcon() {
            $('[data-element="toggle-nav"]').toggleClass('nav--active');
            $('[data-element="toggle-nav-bg"]').addClass('menu-icon--open');
            $('body').toggleClass('no-scroll');
        };

        function toggleMenuClose() {
            $(this).removeClass('menu-icon--open');
            $('[data-element="toggle-nav"]').toggleClass('nav--active');
            $('[data-element="toggle-nav-bg"]').removeClass('menu-icon--open');
            $('body').toggleClass('no-scroll');
        };

        function toggleMenuBg() {
            $(this).removeClass('menu-icon--open');
            $('[data-element="toggle-nav"]').removeClass('nav--active');
            $('body').toggleClass('no-scroll');
        };

      
        init();

        $(add).on('click', function() {
            $(tab).prop('checked', true);
        })


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

    $("#performanceRadioBtns").find("#IndividualPD").prop("checked", true);

</script>
	
</html>