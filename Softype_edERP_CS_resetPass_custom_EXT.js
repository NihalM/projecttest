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
var landingpage = 'https://system.netsuite.com/core/media/media.nl?id=4871812&c=3339763&h=2ca3d1e2bb8806d3d6a6&_xt=.html';
//var Main_URL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=675&deploy=1&compid=3339763&h=a3a5450ec16216cc51d8';
var Main_URL = 'https://forms.netsuite.com/app/site/hosting/scriptlet.nl?script=661&deploy=1&compid=3339763&h=e76f8c913774a269260e';
function validate()
{
	var pwdone= $('#pwdone').val();
	var pwdtwo= $('#pwdtwo').val();
	//alert('pwdone  '+pwdone+'   pwdtwo  '+pwdtwo);
	// if(pwdtwo=="" || pwdone==''|| pwdtwo==null || pwdone==null)
	// {
		// alert("Please Enter the Password and Re-Password.");
		// return;
	// }
	
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
	
	var userId = nlapiGetFieldValue('custpage_studid');
	var URL = Main_URL;
	URL += '&'+base64_encode('action')+'='+base64_encode('resetpass');
	URL += '&'+base64_encode('pwdone')+'='+base64_encode(pwdone);
	URL += '&'+base64_encode('userid')+'='+base64_encode(userId);
	var senddate = base64_encode(nlapiDateToString(new Date()));
	//URL += '&'+base64_encode('senddate')+'='+base64_encode(senddate);
	URL +='&senddate='+senddate;
	$.ajax({
		url: URL,
		async: false
	})
	.done(function( data ){
		
		
		if (data == 'success')
		{
			var URL = landingpage;
			URL += '&ccd=2';
			//alert('success');
			window.ischanged = false;  
			window.open(URL,'_self');
		}else{
			var URL = Main_URL;
			URL += '&action='+base64_encode('fail');
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

function base64_encode(data) {
	var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	ac = 0,
	enc = '',
	tmp_arr = [];

	if (!data) {
		return data;
	}

	do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');

	var r = data.length % 3;

	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}
function base64_decode(data) {

	var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	ac = 0,
	dec = '',
	tmp_arr = [];

	if (!data) {
		return data;
	}

	data += '';

	do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	} while (i < data.length);

	dec = tmp_arr.join('');

	return dec.replace(/\0+$/, '');
}


