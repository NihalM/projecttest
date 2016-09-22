/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Apr 2016     AMAR
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var stLoggerTitle = 'RESET PASSWORD PAGE';
function SL_reset_pass_EXT(request, response)
{

	var action = base64_decode(request.getParameter(base64_encode('action')));
	var user_id = base64_decode(request.getParameter(base64_encode('userid')));

	var startdate = base64_decode(request.getParameter(('senddate')));
	var today_date = nlapiDateToString(new Date());


	
	var d1 = new Date(startdate);
	var d2 = new Date(today_date);
	nlapiLogExecution('DEBUG', 'd1 is '+d1, 'd2 is '+d2);
	var one_day = 1000*60*60*24;
	var date1_ms = d1.getTime();
	var date2_ms = d2.getTime();
	var difference_ms = date2_ms - date1_ms;
	var diff = Math.round(difference_ms/one_day);

	//nlapiLogExecution('DEBUG', 'action is '+action+'  diff is '+diff +'  startdate '+startdate, 'user_id is '+user_id);
/*	
	if (diff >1 || startdate == '') {
	//	throw nlapiCreateError('ERROR','The resetLink is expire/invalid.');
	}*/
	
	//nlapiLogExecution('DEBUG', diff +'  startdate '+startdate, 'today_date is '+today_date);

	var form= nlapiCreateForm('', false);
	form.setScript('customscriptsoftype_ederp_cs_resetpass_e');
	var idfld = form.addField('custpage_studid','text','Student ID').setDisplayType('hidden');
	idfld.setDefaultValue(user_id);
	var fldHtmlHeader = form.addField('custpage_header','inlinehtml','');
	var htmlvar = '';

	if (action == 'resetpass')
	{
		var user = user_id;
		var pass = base64_decode(request.getParameter(base64_encode('pwdone')));
		/*var pass = base64_decode(request.getParameter('pwdone'));*/

		nlapiLogExecution('DEBUG', 'user '+user, 'pass is '+pass);
		var results = '';
		var fieldarr = new Array();
		var valarr = new Array();
		fieldarr.push('custentity_ederp_password');
		valarr.push(pass);
		fieldarr.push('password');
		valarr.push(pass);
		fieldarr.push('password2');
		valarr.push(pass);
		try{
			nlapiSubmitField('customer', user, fieldarr,valarr);
			results = 'success';
			response.write(results.toString());
			results = '';
			return;		
		}catch(e){
			results = 'fail';
			response.write(results.toString());
			results = '';
			return;		
		}


	}else if(action=='success')
	{
		htmlvar+='<div class="uir-alert-box confirmation session_confirmation_alert" width="100%" role="status">';
		htmlvar+='	<div class="icon confirmation"></div>';
		htmlvar+='<div class="content"><div class="title">Confirmation</div>';
		htmlvar+='<div class="descr">>Your Password is successfully Updated.</div>';
		htmlvar+='</div></div> <br><br><br>';

		/*	fldHtmlHeader.setDefaultValue(htmlvar);
		response.writePage(form);
		return;*/
	}
	else if(action=='fail')
	{

		htmlvar+='<div id="div__alert">';
		htmlvar+='	<div class="uir-alert-box warning invalidemaildomid" width="undefined" role="status">';
		htmlvar+='<div class="icon warning"></div>';
		htmlvar+='<div class="content">';
		htmlvar+='<div class="title">Warning</div>';
		htmlvar+='<div class="descr"><span style="padding-left:10px; font-weight:bolder"</span>Your Password Update is failed please try again.</div>';
		htmlvar+='</div></div></div><br><br><br>';
	}
	/*	var userType = (nlapiLookupField('entity', user_id, 'type')).toLowerCase();

	if (userType != 'custjob' && userType != 'CUSTJOB')
	{
		throw nlapiCreateError('ERROR','The Page is only available for Student Center.');
		return;
	}*/
	var searchResults = nlapiSearchRecord(null,'customsearch_ederp_documentsearch',null, null);
	nlapiLogExecution('DEBUG',searchResults,searchResults);

	if(searchResults)
	{
		for(var i=0;i<searchResults.length;i++)
		{
			var searchResult = searchResults[i];
			var columns = searchResults[i].getAllColumns();
			var name = searchResult.getValue(columns[0]);

			var folderName = searchResult.getText(columns[1]);
			if(folderName == 'FORGOT/RESET PASS')
			{
				if(name == 'feu_banner.jpg')
					feu_banner = searchResult.getValue(columns[3]);			
			}
		}
	}
	htmlvar+='<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">';
	htmlvar+='<html>';
	htmlvar+='<head>';
	htmlvar+='<title>edERP Reset Password</title>';
	htmlvar+='<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>';
    htmlvar +='<script>';
    htmlvar +="$(document).ready(function(){$('.table_fields').css('width','100%');});";
    htmlvar +='</script>';
	htmlvar+='</head>';
	
	

	htmlvar+='<body style="box-shadow: 0 4px 6px 1px rgba(50, 50, 50, 0.14); background: white; width: 70%; margin-left: auto; margin-right: auto; margin-top: 100px; height: 500px;">';
	
	htmlvar+='<div style="margin: 50px;padding-top: 10px;text-align: center;">';
	htmlvar+='<img src="'+feu_banner+'">';
	htmlvar+='</div>';
	
	htmlvar +='<div style="padding-top: 8px; padding-left: 15px; text-align: center; font-size: large; padding-bottom: 4px;"><h3> Forgot Password </h3></div>';
	
	htmlvar+='	<div style="border: 1px solid;margin-left: auto;margin-right: auto;width:500px;">';
	htmlvar+='<div style="height: 35px;background-color: #2E5845;border-color: #2E5845;color: white;">';
	htmlvar+='	<div style="padding-top: 8px;    padding-left: 15px;"> Reset Password </div>';
	htmlvar+='</div>';

	htmlvar+='<div id="test" style="margin: 10px;">';

	htmlvar+='<div align="left"id="testone">Enter New Password</div>';
	htmlvar+='<div style=" font-size: 22px;" id="testtwo"><input type="password" id="pwdone" style="margin-bottom: 10px;width: 470px;padding-left: 5px;height: 30px;margin-top: 8px;"></div>';

	htmlvar+='<div align="left"id="testone">Re-Enter Password</div>';
	htmlvar+='<div style=" font-size: 22px;" id="testtwo"><input type="password" id="pwdtwo" style="width: 470px;padding-left: 5px;height: 30px;margin-top: 8px;"></div>';

	htmlvar+='<div style="font-size: 22px;" id="testthree"><input type="button" onclick="validate();" value="Submit" style="width: 470px;height: 35px;margin-top: 10px;;font-size: white;background-color: orange;color: white;"/></div>';

	htmlvar+='</div></div>';

	htmlvar+='</body>';
	htmlvar+='</html>';

	fldHtmlHeader.setDefaultValue(htmlvar);
	response.writePage(form);
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


