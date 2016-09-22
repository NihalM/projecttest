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
var stLoggerTitle = 'FORGOT PASSWORD PAGE';
var emailsender = 368402;//edERP FEU Help Desk
function SL_Forgot_pass(request, response)
{

	var action = base64_decode(request.getParameter(base64_encode('action')));
	nlapiLogExecution('DEBUG', 'action', action);
	var htmlvar = '';
	var form= nlapiCreateForm('', false);
	form.setScript('customscript_softype_ederp_cs_forgotpass');
	var fldHtmlHeader = form.addField('custpage_header','inlinehtml','');
	if (action == 'emailchk')
	{
		var email = base64_decode(request.getParameter('email'));
		var filt = new Array();
		filt.push(new nlobjSearchFilter('email',null,'is',email));
		filt.push(new nlobjSearchFilter('isinactive',null,'is','F'));
		var colm = new Array();
		colm.push(new nlobjSearchColumn('altemail'))
		var serStud = nlapiSearchRecord('customer', null, filt, colm);
		if(serStud)
		{
			nlapiLogExecution('DEBUG', 'serStud length = ', serStud.length);
			
			var results = 'success';
			var subject = 'edERP Reset Password';		
			var e_body_st = '<p>Please click below link for password reset</p><br>';
			
			var userid = base64_encode(serStud[0].getId());
			var EXT_RST_URL = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_sl_rstpass_ex', 'customdeploy_softype_ederp_sl_rstpass_ex',true);
			EXT_RST_URL += '&'+base64_encode('userid')+'='+userid;
			//EXT_RST_URL +='&userid='+userid;
			var senddate = base64_encode(nlapiDateToString(new Date()));
			//EXT_RST_URL += '&'+base64_encode('senddate')+'='+senddate;
			EXT_RST_URL +='&senddate='+senddate;
			e_body_st += '<a href="'+EXT_RST_URL+'">Click Here</a>';
			
			var altemail = serStud[0].getValue('altemail');
			if (altemail != null && altemail != '' )
			{
				nlapiLogExecution('DEBUG', 'sending email to alternate id  '+serStud[0].getId());
				nlapiSendEmail(emailsender, altemail, subject,e_body_st);
			}else{
				nlapiLogExecution('DEBUG', 'sending email to main id  '+serStud[0].getId());
				nlapiSendEmail(emailsender, serStud[0].getId(), subject,e_body_st);
			}
			results +=  ',' + serStud[0].getId();
			response.write(results.toString());
			results = '';
			return;	
		}
		else
		{
			var results = 'fail'+',0';
			response.write(results.toString());
			results = '';
			return;	
		}

	}
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

	htmlvar +='<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">';
	htmlvar +='<html style="">';
	htmlvar +='<head><title>edERP Forgot Password</title>';
	htmlvar +='<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>';
	htmlvar +='<script>';
	htmlvar +="$(document).ready(function(){$('.table_fields').css('width','100%');});";
	htmlvar +='</script>';
	htmlvar +='</head>';

	htmlvar +='<body style="box-shadow: 0 4px 6px 1px rgba(50, 50, 50, 0.14); background: white; width: 70%; margin-left: auto; margin-right: auto; margin-top: 100px;">';
	htmlvar +='<div style="margin: 40px;padding-top: 10px; text-align: center;">';
	htmlvar+='<img src="'+feu_banner+'">';
	htmlvar +='</div>';
	
	htmlvar +='<div style="padding-top: 8px; padding-left: 15px; text-align: center; font-size: large; padding-bottom: 4px;"><h3> Forgot Password </h3></div>';
	
	htmlvar +='<div style="border: 1px solid;margin-left: auto;margin-right: auto;width:500px;">';
	htmlvar +='<div style="height: 35px;background-color: #2E5845;border-color: #2E5845;color: white;">';
	//htmlvar +='<div style="padding-top: 8px;    padding-left: 15px;"> Forgot Password </div>';
	htmlvar +='<div style="padding-top: 8px; padding-left: 15px;"> Enter the Email Address you use to log into edERP </div>';
	htmlvar +='</div>';

	htmlvar +='<div id="test" style="margin: 10px;">';

	if(action=='success')
	{
		htmlvar+='<div class="uir-alert-box confirmation session_confirmation_alert" width="100%" role="status">';
		htmlvar+='	<div class="icon confirmation"></div>';
		htmlvar+='<div class="content"><div class="title">Confirmation</div>';
		htmlvar+='<div class="descr">You will receive Confirmation email for password reset.</div>';
		htmlvar+='</div></div> <br><br><br>';
		/*fldHtmlHeader.setDefaultValue(htmlvar);
		response.writePage(form);
		return;*/
	}else{
		htmlvar +='<div align="left"id="testone">Account ID/Email:</div>';
		htmlvar +='<div style=" font-size: 22px;" id="testtwo"><input type="email" id="sendemail"name="email" style="width: 470px;padding-left: 5px;height: 30px;margin-top: 8px;"></div>';
		htmlvar +='<div style="font-size: 22px;" id="testthree"><input type="button" onclick="validate();" value="Continue" style="width: 480px;height: 35px;margin-top: 10px;;font-size: white;background-color: orange;color: white; type = "button""/></div>';
		htmlvar +='</div></div>';
	}

	htmlvar +='</body>';
	htmlvar +='	</html>';

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

