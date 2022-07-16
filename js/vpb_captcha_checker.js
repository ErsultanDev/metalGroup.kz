/********************************************************************************************************************
* This script is brought to you by Vasplus Programming Blog by whom all copyrights are reserved.
* Website: www.vasplus.info
* Email: info@vasplus.info
* Please, do not remove this information from the top of this page.
*********************************************************************************************************************/


//This function refreshes the security or captcha code when clicked on the refresh link
function vpb_refresh_aptcha()
{
	return $("#vpb_captcha_code").val('').focus(),document.images['captchaimg'].src = document.images['captchaimg'].src.substring(0,document.images['captchaimg'].src.lastIndexOf("?"))+"?rand="+Math.random()*1000;
}



//This function checks to see if the code provided is correct or wrong and displays the appropriate result on the screen to the user
function vpb_submit_captcha()
{
	var vpb_captcha_code = $("#vpb_captcha_code").val();
	
	if(vpb_captcha_code == "")
	{
		$("#captchaResponse").html('<div class="vpb_info" align="left">Please enter the captcha code in the box provided. Thanks.</div>');
		$("#vpb_captcha_code").focus();
	}
	else
	{
		var dataString = 'vpb_captcha_code='+ vpb_captcha_code;
		$.ajax({
			type: "POST",
			url: "captcha_checker.php",
			data: dataString,
			cache: false,
			beforeSend: function() 
			{
				$("#captchaResponse").html('<div style="padding-left:100px;margin-bottom:30px;"><font style="font-family:Verdana, Geneva, sans-serif; font-size:12px; color:black;">Please wait</font> <img src="load.gif" align="absmiddle" /></div>');
			},
			success: function(response)
			{
				vpb_refresh_aptcha(); //Refresh the Captcha Image on success or on wrong security submitted
				$("#vpb_captcha_code").val('');
				$("#captchaResponse").hide().fadeIn('slow').html(response);
			}
		});
	}
}