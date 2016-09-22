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
var stLoggerTitle = 'Change Password ';
function SL_reset_pass(request, response)
{

	var action = base64_decode(request.getParameter(base64_encode('action')));
	var user_id = nlapiGetUser();
	nlapiLogExecution('DEBUG', 'action', action);
	var form= nlapiCreateForm(stLoggerTitle, false);
	form.setScript('customscript_softype_ederp_cs_resetpass');
	var fldHtmlHeader = form.addField('custpage_header','inlinehtml','');
	var htmlvar = '';
	
	if (action == 'resetpass')
	{
		var user = base64_decode(request.getParameter(base64_encode('userId')));
		var pass = base64_decode(request.getParameter(base64_encode('pwdone')));
		
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
		//htmlvar+='<div class="descr">Your Password is successfully Updated.</div>';
		htmlvar+='<div class="descr">You have successfully updated your password.</div>';
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
	var userType = (nlapiLookupField('entity', user_id, 'type')).toLowerCase();
	
	if (userType != 'custjob' && userType != 'CUSTJOB')
	{
		throw nlapiCreateError('ERROR','The Page is only available for Student Center.');
		return;
	}
	
	htmlvar+='<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">';
	htmlvar+='<html style="background-color: #EAEAEA;">';
	htmlvar+='<head>';
	htmlvar+='<title>edERP Reset Password</title>';
	htmlvar+='<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>';
	htmlvar+='<script>  </script>';
	htmlvar+='</head>';

	htmlvar+='<body style="box-shadow: 0 4px 6px 1px rgba(50, 50, 50, 0.14); background: white; width: 70%; margin-left: auto; margin-right: auto; margin-top: 100px; height: 500px;">';

	htmlvar+='	<div style="border: 1px solid;margin-left: auto;margin-right: auto;width:500px;">';
	htmlvar+='<div style="height: 35px;background-color: #607799;border-color: #2E5845;color: white;">';
	htmlvar+='	<div style="padding-top: 8px;    padding-left: 15px;"> Reset Password </div>';
	htmlvar+='</div>';

	htmlvar+='<div id="test" style="margin: 10px;">';

	htmlvar+='<div align="left"id="testone">Enter New Password</div>';
	htmlvar+='<div style=" font-size: 22px;" id="testtwo"><input type="password" id="pwdone" style="margin-bottom: 10px;width: 470px;padding-left: 5px;height: 30px;margin-top: 8px;"></div>';

	htmlvar+='<div align="left"id="testone">Re-Enter Password</div>';
	htmlvar+='<div style=" font-size: 22px;" id="testtwo"><input type="password" id="pwdtwo" style="width: 470px;padding-left: 5px;height: 30px;margin-top: 8px;"></div>';

	htmlvar+='<div style="font-size: 22px;" id="testthree"><input type="button" onclick="validate();" value="Submit" style="width: 470px;height: 35px;margin-top: 10px;;font-size: white;background-color: #607799;color: white;"/></div>';

	htmlvar+='</div></div>';

	htmlvar+='</body>';
	htmlvar+='</html>';

	fldHtmlHeader.setDefaultValue(htmlvar);
	response.writePage(form);
}
