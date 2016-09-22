/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Apr 2016     AMAR
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {

}
function validate()
{
	var pwdone= $('#pwdone').val();
	var pwdtwo= $('#pwdtwo').val();
	//alert('pwdone  '+pwdone+'   pwdtwo  '+pwdtwo);
	/*if(pwdtwo=="" || pwdone==''|| pwdtwo==null || pwdone==null)
	{
		alert("Please Enter the Password and Re-Password.");
		return;
	}
	else if(pwdtwo != pwdone)
	{
		alert("Password and Re-Password did not match.");
		return;
	}
	*/
	
	
	if(pwdone==''|| pwdone==null || pwdone==null)
	{
		alert("Please Enter the Password and Re-Password.");
		return;
	}
	if(pwdone.length<6 || pwdone.length>32)
	{
		alert("Please Enter minimum 6 and maximum 32 digit password.");
		return;
	}
	if(pwdtwo==''|| pwdtwo==null || pwdtwo==null)
	{
		alert("Please Re-Enter the Password.");
		return;
	}
	if(pwdtwo.length<6 || pwdtwo.length>32)
	{
		alert("Please Re-Enter minimum 6 and maximum 32 digit password.");
		return;
	}
	if(pwdtwo != pwdone)
	{
		alert("Password and Re-Password did not match.");
		return;
	}
	
	
	var userId = nlapiGetUser();
	var MAINurl = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_sl_resetpass', 'customdeploy_softype_ederp_sl_resetpass');
	var URL = MAINurl;
	URL +=  '&'+base64_encode('action')+'='+base64_encode('resetpass');
	URL += '&'+base64_encode('pwdone')+'='+base64_encode(pwdone);
	URL += '&'+base64_encode('userId')+'='+base64_encode(userId);
	
	$.ajax({
		url: URL,
		async: false
	})
	.done(function( data ){
		console.log(data);
		if (data == 'success') {
			var URL = MAINurl;
			URL +=  '&'+base64_encode('action')+'='+base64_encode('success');
			//alert('success');
			window.ischanged = false;  
			window.open(URL,'_self');
		}else{
			var URL = MAINurl;
			URL +=  '&'+base64_encode('action')+'='+base64_encode('fail');
			//alert('fail');
			window.ischanged = false;  
			window.open(URL,'_self');
		}

	});	


}
function onReset()
{
	window.location.reload();
}