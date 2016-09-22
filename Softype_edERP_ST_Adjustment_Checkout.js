/* **************************************************************************************  
 ** Copyright (c) 1998-2015 Softype, Inc.                                 
 ** Morvi House, 30 Goa Street, Ballard Estate, Mumbai 400 001, India
 ** All Rights Reserved.                                                    
 **                                                                         
 ** This software is the confidential and proprietary information of          
 ** Softype, Inc. ("Confidential Information"). You shall not               
 ** disclose such Confidential Information and shall use it only in          
 ** accordance with the terms of the license agreement you entered into    
 ** with Softype.                       
 ** @author: Sarah Akid
 ** @version: 1.0
 ** Description:This is suitelet script for Enrollment Request.
 ************************************************************************************** */
//var colorBg=$('#ns_navigation').css('backgroundColor');#607799 
var SIBLING_REQUEST=23;
var ENTITY_On_Leave_Student=18;
var htmlvar='';
var Softype_EdERP_all_Request='';
var Softype_EdERP_jBox='';
var Softype_EdERP_jBox_js ='';
var message = '';
var SuiteletPageName = '';	
var subsidiary,setup,enrollmentType;
var arrDay=[],arrTimes=[];
var All_Data_of_JSON='';
var selectedCredit=0;
var selectedAmount=0.00;
var ENROLLMENT_ADJUSTMENT_CALENDER = 5;

var headerRibbon = '';

function Enrollment(request, response)
{

	try
	{
		var action = request.getParameter('action'); 
		var	htmlvar = '';

		nlapiLogExecution('Debug','action',action);

		if(action == 'refresh')
		{
			var acadTerm = request.getParameter('acadTerm');
			var acadYear = request.getParameter('acadYear');
			var sections = request.getParameter('sections');
			nlapiLogExecution('Debug','action',sections+':'+acadTerm+':'+acadYear);
			var JSONvar = refreshValues(sections,acadTerm,acadYear);
			response.write(JSONvar);
			return;
		}
		if(action == 'submission')
		{
			var enrollmentType = request.getParameter('enrollmentType');
			var acadTerm = request.getParameter('acadTerm');
			var acadYear = request.getParameter('acadYear');
			var courses = request.getParameter('details');
			var batch = request.getParameter('batch');
			var homepgurl = request.getParameter('homepgurl');
			nlapiLogExecution('Debug','action',enrollmentType+':'+acadTerm+':'+acadYear+':'+courses+':'+batch);
			htmlvar = submitEnrollment(enrollmentType,acadTerm,acadYear,courses,batch,homepgurl);
			response.write(htmlvar.toString());
			return;
		}
		if(action == 'summary')
		{
			var student = nlapiGetUser();//372024;
			var courses = request.getParameter('courses'); // will be used to get additional
			var acadTerm = request.getParameter('acadTerm');
			var acadYear = request.getParameter('acadYear');
			var enrollmentType = request.getParameter('enrollmentType');
			nlapiLogExecution('DEBUG', 'enrollmentTypeParam in submission action', enrollmentType);
			var selectedCredits = request.getParameter('selectedCredits');
			var rate = request.getParameter('rate');
			var enrOrLate = request.getParameter('enrorlate');
			var arrCourses = request.getParameter('arrCourses');
			var batch = request.getParameter('batch');
			var amount = request.getParameter('amount');
			var acadTermName = request.getParameter('acadTermName');
			var acadYearName = request.getParameter('acadYearName');
			All_Data_of_JSON = request.getParameter('All_Data_of_JSON');

			selectedCredit = selectedCredits;
			selectedAmount = amount;

			nlapiLogExecution('Debug','summary param',acadTerm+':'+acadYear+':'+rate+':'+student+':'+courses+':'+enrollmentType+':'+selectedCredits+':'+enrOrLate+':'+batch+':'+acadTermName+':'+acadYearName);

			nlapiLogExecution('DEBUG', 'All_Data_of_JSON = ', All_Data_of_JSON);

			selectedCreditAmount = selectedCredit+'@@@'+selectedAmount;
			nlapiLogExecution('DEBUG', 'selectedCredit = ',selectedCredit+'@@'+'selectedAmount = '+selectedAmount+'@@'+'total='+selectedCreditAmount);


			var context = nlapiGetContext();
			var alreadySubmitted = context.getSessionObject('submitted');

			SuiteletPageName = enrollmentType.indexOf('preenroll') < 0 ? SuiteletPageName : 'Pre-Enrollment Summary';
			if(alreadySubmitted && alreadySubmitted == 'true')
			{
//				htmlvar = '<table><tr><td><span>';
				htmlvar = '<p style="color: black; font-size: 30px;font-family: serif;font-style: bold;font-weight: bold;" align="center">Your enrollment cart is emtpy. Please go back and select courses.</p>';
//				htmlvar = '</span></td></tr></table>';
			}
			else
				htmlvar = getSummary(acadTerm,acadYear,rate,student,courses,enrollmentType,selectedCredits,enrOrLate,arrCourses,batch,amount,acadTermName,acadYearName);

		}
		var ENR_FORM = nlapiCreateForm(SuiteletPageName, false);
		ENR_FORM.setScript('customscript_ederp_cs_enrollment');
		var fldHtmlHeader = ENR_FORM.addField('custpage_header','inlinehtml','');		
		fldHtmlHeader.setDefaultValue(htmlvar);
		response.writePage(ENR_FORM);
	}
	catch(error)
	{
		var error_msg = [];
		var triggered_by = ['Error triggered by user:  ', nlapiGetContext().getName()].join('');			
		if ( error instanceof nlobjError )
		{
			error_msg = ['System Error', '<br/>', error.getCode(), '<br/>', error.getDetails(), '<br/>', triggered_by].join('');
		}else
		{
			error_msg = ['Unexpected Error', '<br/>', error.toString(), '<br/>', triggered_by].join('');
		}
		throw nlapiCreateError('Enrollment', error_msg,true);
	}
}

function refreshValues(sections,acadTerm,acadYear)
{
	var JSONvar = [];
	sections = sections.split(',');

	var filter = new Array();
	filter[0] = new nlobjSearchFilter('custrecord_ederp_schedule_section', null, 'anyof',sections);
	filter[1] = new nlobjSearchFilter('custrecord_ederp_schedule_acadterm', null, 'is', parseInt(acadTerm));
	filter[2] = new nlobjSearchFilter('custrecord_ederp_schedule_acadyear', null, 'is', parseInt(acadYear));
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_ederp_schedule_availslots');
	columns[1] = new nlobjSearchColumn('custrecord_ederp_schedule_section');

	var srchResults = nlapiSearchRecord('customrecord_ederp_schedule', null, filter, columns);
	if(srchResults)
	{
		for(var s=0; s<srchResults.length; s++)
		{
			var r = srchResults[s].getValue('custrecord_ederp_schedule_section');
			var t = srchResults[s].getValue('custrecord_ederp_schedule_availslots');
			JSONvar.push({Section: r , AvailableSlot: t});
		}
	}

	nlapiLogExecution('DEBUG',' JSON.stringify(JSONvar)',JSON.stringify(JSONvar));
	return JSON.stringify(JSONvar);
}

function submitEnrollment(enrollmentType,academicTerm,academicYr,courses,batch,homepgurl)
{
	var context = nlapiGetContext();
	var alreadySubmitted = context.getSessionObject('submitted');
	nlapiLogExecution('DEBUG', 'alreadySubmitted', alreadySubmitted);	
	if(alreadySubmitted && alreadySubmitted == 'true')
	{
		return '<p style="color:red; font-size:15px;" align="center">Your enrollment cart is emtpy. Please go back and select courses.</p>';
	}	

	var errorSchedTxt = [];
	submitEnrollment_adjustment(enrollmentType,academicTerm,academicYr,courses,batch,homepgurl);
	context.setSessionObject('submitted','true');


	if(errorSchedTxt.length>0)
		return '<p style="color:red; font-size:15px;" align="center">'+errorSchedTxt.toString()+' is no longer available. Go back to select another section.</p>';
	else
		return getConfirmationHTML(enrollmentType,homepgurl);
}

function getConfirmationHTML(enrollmentType,homepgurl)
{

	nlapiLogExecution('Debug', 'enrollmentType ', enrollmentType+' homepgurl '+homepgurl);

	var isPreEnroll;
	var html='';
	html+='<div class="div__alert">';   



	html+='<div id="div__alert">';
	html+='<div class="uir-alert-box confirmation" width="100%" role="status">';
	html+='<div class="icon confirmation"></div>';
	html+='<div class="content">';
	html+='<div class="title">Enrollment Adjustment successfully submitted!</div>';
	//html+='<div class="descr">We will be processing your enrollment transaction.</div>';
	html+='<div class="descr">We will be processing your enrollment adjustment transaction. Please also allow us one (1) business day to process your adjustment.</div>';


	//html+='<div class="descr">The policies, regulations, procedures, and fees in this assessment  are subject to change without prior notice, if necessary, to keep University policies in compliance with CHED. The University reserves the right to change curricula, rules, fees, and other requirements, of whatever kind, affecting students based on updated policies.</div>';

	//new line updated
	html+='<div class="descr">The policies, regulations, procedures, and fees in this assessment are subject to change without prior notice, if necessary, to keep University policies in compliance with CHED. The University reserves the right to change curricula, rules, fees and other requirements, of whatever kind, affecting students based on updated policies.</div>';

	//here url to Overview tab to be added
	html+='<div class="descr"><a class="btn btn-success" href="'+homepgurl+'">Home Page</a></div>';
	html+='</div>';
	html+='</div>';
	html+='</div>';
	html+='</div>';

	return html;
}

function getSetup() {
	var filters = new Array();
	if(!isEmpty(subsidiary)) {
		filters.push(new nlobjSearchFilter('custrecord_ederp_setup_subsidiary',null,'anyof',subsidiary));
	}
	filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_ederp_setup_creditfee'));//
	columns.push(new nlobjSearchColumn('custrecord_ederp_setup_creditrate'));//
	columns.push(new nlobjSearchColumn('custrecord_ederp_setup_termfee'));
	columns.push(new nlobjSearchColumn('custrecord_ederp_setup_coursenotappintl'));
	columns.push(new nlobjSearchColumn('custrecord_ederp_setup_onlineprice'));
	var setup = nlapiSearchRecord('customrecord_ederp_setup', null, filters, columns);
	if(setup==null || setup=='')
		Application.sendError(methodNotAllowedError);

	return setup;
}

function getSummary(acadTerm,acadYear,rate,student,courses,enrollmentType,selectedCredits,enrollmentOrLate,arrCourses,batch,amount,acadTermName,acadYearName)
{
	nlapiLogExecution('Debug', 'Enter   enrollmentType get summary  ', enrollmentType);
	nlapiLogExecution('Debug', 'get all values'+enrollmentType,acadTerm+acadYear+rate+student+courses+enrollmentType+selectedCredits+enrollmentOrLate+arrCourses+batch);

	var searchResults = nlapiSearchRecord(null,'customsearch_ederp_documentsearch',null, null);
	if(searchResults)
	{
		for(var i=0;i<searchResults.length;i++)
		{
			var searchResult = searchResults[i];
			var columns = searchResults[i].getAllColumns();
			var name = searchResult.getValue(columns[0]);

			var folderName = searchResult.getText(columns[1]);
			if(folderName == 'Images')
			{
				if(name == 'ajax-loader.gif')
					ajaxloader = searchResult.getValue(columns[3]);
				else if(name == 'Open_Icon.png')
					openPNG = searchResult.getValue(columns[3]);
				else if(name == 'Closed_Icon.png')
					closePNG = searchResult.getValue(columns[3]);
				else if(name == 'icon_msgbox_error.png')
					errorPNG = searchResult.getValue(columns[3]);
				else if(name == 'under-heading.png')
					headerRibbon = searchResult.getValue(columns[3]);
			}
			else if(folderName=='CSS')
			{
				if(name=='Softype_edERP_Common.css')
					AllRequestCommonCSS = searchResult.getValue(columns[3]);
				else if(name == 'Softype_edERP_Website_Calendar.css')
					EnrollmentCSS = searchResult.getValue(columns[3]);
				else if(name == 'Softype_EdERP_jBox.css')
					jBoxCSS = searchResult.getValue(columns[3]);
			}
			else if(folderName == 'Library')
			{
				if(name == 'Softype_EdERP_jBox.min.js')
					jBoxLib = searchResult.getValue(columns[3]);
				else if(name == 'Softype_edERP_jquery.min.1.9.1.js')
					jqueryLib = searchResult.getValue(columns[3]);
			}
		}
	}
	var htmltemp = '<!DOCTYPE html><html> <head> <meta charset="UTF-8">';
	htmltemp += '<link href="https://fonts.googleapis.com/css?family=Open+Sans:300" rel="stylesheet" type="text/css"/>';
	htmltemp += '<link href='+AllRequestCommonCSS+' rel="stylesheet" type="text/css"/>';
	htmltemp += '<link href='+EnrollmentCSS+' rel="stylesheet" type="text/css"/>';
	htmltemp += '<link href='+jBoxCSS+' rel="stylesheet" type="text/css"/>';
	htmltemp += '<script src='+jqueryLib+' type="text/javascript"></script>';
	htmltemp += '<script src='+jBoxLib+' type="text/javascript"></script>';
	htmltemp += '</head>';
	htmltemp += "<body>";

	var tempAmount = Number(amount);
	amount = toCurrencyFormat(tempAmount);
//	htmltemp +='<div id="summarytable">';
//	htmltemp +='<table>';
//	htmltemp +='<caption>Basic Fee</caption>';
//	htmltemp +='<tr><td>Total</td><td>'+amount+'</td></tr>';
//	htmltemp +='</table>';

	//Generic Fees 
	var studentOBJ = nlapiLookupField('customer',nlapiGetUser(),
			['subsidiary','custentity_ederp_program','custentity_ederp_currprogyear','custentity_ederp_gradfee','custentity_ederp_credearned','custentity_ederp_international','custentity_ederp_studentnumber']);
	var prog = studentOBJ.custentity_ederp_program;
	var progYr = studentOBJ.custentity_ederp_currprogyear;
	var hasGradFee = studentOBJ.custentity_ederp_gradfee;
	var earnedCredits = studentOBJ.custentity_ederp_credearned;
	var isInternational = studentOBJ.custentity_ederp_international;
	var isFirstTimeEnrollee = studentOBJ.custentity_ederp_studentnumber;
	isFirstTimeEnrollee = isFirstTimeEnrollee=='T'?'F':'T';
	subsidiary = studentOBJ.subsidiary;	
	var setup = getSetup();
	setup = setup[0].getId();

	//Check if graduation fee is applicable
	var applyGradFee = false;
	var arrF=new Array();
	arrF[0]= new nlobjSearchFilter('custrecord_ederp_progcourse_proglink', null, 'is',prog);
	var arrC =new Array();
	arrC[0] = new nlobjSearchColumn('custrecord_ederp_progcourse_year', null, 'group').setSort(true);
	arrC[1] = new nlobjSearchColumn('custrecord_ederp_prog_credgrad', 'custrecord_ederp_progcourse_proglink', 'min');
	var srchResultsProgCourse = nlapiSearchRecord('customrecord_ederp_progcourse', null, arrF, arrC);
	if(srchResultsProgCourse)
	{
		var t = srchResultsProgCourse [0].getValue('custrecord_ederp_progcourse_year', null, 'group');
		if(parseInt(progYr) == parseInt(t))
		{
			// is in last year
			if(hasGradFee == 'F')
			{
				// get all passed credits
				earnedCredits = earnedCredits? parseInt(earnedCredits) : 0;
				var requiredCredit = srchResultsProgCourse[0].getValue('custrecord_ederp_prog_credgrad', 'custrecord_ederp_progcourse_proglink', 'min');
				requiredCredit = requiredCredit? parseInt(requiredCredit) : 0;
				nlapiLogExecution('Debug','earned',earnedCredits +','+ selectedCredits+','+ requiredCredit);

				if(parseInt(requiredCredit) <= earnedCredits + parseInt(selectedCredits))
					applyGradFee = true;
			}
		}
	}

	var additionaAmount = 0;
	isInternational = isInternational == 'T'? 2 : 1;
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_ederp_fees_comp'));
	columns.push(new nlobjSearchColumn('custitem_ederp_graduate','custrecord_ederp_fees_comp'));
	columns.push(new nlobjSearchColumn('onlineprice','custrecord_ederp_fees_comp'));
	var filter=new Array();
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	filter.push(new nlobjSearchFilter('custrecord_ederp_fees_setup',null,'is',setup));
	filter.push(new nlobjSearchFilter('custrecord_ederp_fees_term',null,'anyof',acadTerm));
	filter.push(new nlobjSearchFilter('custrecord_ederp_fees_progyear',null,'anyof',progYr));
	filter.push(new nlobjSearchFilter('custrecord_ederp_fees_prog',null,'anyof',prog));
	filter.push(new nlobjSearchFilter('custrecord_ederp_fees_applicable',null,'anyof',enrollmentOrLate));//applicable to enroll
	filter.push(new nlobjSearchFilter('custrecord_ederp_fees_studenttype',null,'anyof',isInternational));
	if(!applyGradFee)
		filter.push(new nlobjSearchFilter('custitem_ederp_graduate','custrecord_ederp_fees_comp','is','F'));
	if(isFirstTimeEnrollee=='F')
		filter.push(new nlobjSearchFilter('custitem_ederp_incomingfee','custrecord_ederp_fees_comp','is','F'));

	var srchTuitionFee = nlapiSearchRecord('customrecord_ederp_fees', null, filter, columns);
	if(srchTuitionFee)
	{
		for(var s=0; s<srchTuitionFee.length; s++)
		{
			additionaAmount+= Number(srchTuitionFee[s].getValue('onlineprice','custrecord_ederp_fees_comp'));
			if(srchTuitionFee[s].getValue('custitem_ederp_graduate','custrecord_ederp_fees_comp') == 'T')
				applyGradFee='T';
		}
	}
	nlapiLogExecution('Debug','additionaAmount',additionaAmount);
	nlapiLogExecution('Debug','arrCourses length',arrCourses.length+';'+arrCourses);
	arrCourses=arrCourses.split(',');
	nlapiLogExecution('Debug','arrCourses length',arrCourses.length);
	//Extra fees per Course
	var columns = new Array();
	columns.push(new nlobjSearchColumn('onlineprice','custrecord_ederp_coursefees_comp'));
	var filter=new Array();
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	filter.push(new nlobjSearchFilter('custrecord_ederp_coursefees_course',null,'anyof',arrCourses));
	var srchCrseTuitionFee = nlapiSearchRecord('customrecord_ederp_coursefees', null, filter, columns);
	if(srchCrseTuitionFee)
	{
		for(var s=0; s<srchCrseTuitionFee.length; s++)
		{
			additionaAmount+= Number(srchCrseTuitionFee[s].getValue('onlineprice','custrecord_ederp_coursefees_comp'));

		}
	}
	nlapiLogExecution('Debug','additionaAmount',additionaAmount);

	var tempAdditionalAmt = additionaAmount;
	additionaAmount = toCurrencyFormat(additionaAmount);
//	htmltemp +='<table>';
//	htmltemp +='<caption>Additional Fee</caption>';
//	htmltemp +='<tr><td>Total</td><td>'+additionaAmount+'</td></tr>';
//	htmltemp +='</table>';
//	htmltemp +='</div>';

	var totalAmount = Number(tempAmount) + Number(tempAdditionalAmt);
	totalAmount = toCurrencyFormat(totalAmount);

	//hiden//
	batch = batch=="undefined"?'':batch;
	htmltemp+='<label id="scheduledetails" style="display:none">'+JSON.stringify(courses)+'</label> <label id="Cross_data" style="display:none">'+All_Data_of_JSON+'</label>';


	nlapiLogExecution('Debug', '717 selectedCreditAmount = ', selectedCreditAmount);
	htmltemp+='<label id="selected_creditamounts" style="display:none">'+selectedCreditAmount+'</label>';

	htmltemp+='<label id="enrollmentdetails" style="display:none">'+JSON.stringify({year:acadYear,term:acadTerm,type:enrollmentType,batch:batch,acadTermName:acadTermName,acadYearName:acadYearName})+'</label>';

	//New HTML Solution
	htmltemp+='<div id="summarytable">';
	htmltemp+='<div>';
	htmltemp+='<table id="studentdata" style="width: 80%;" align="center">';//#607799
	htmltemp+='<tr><td align="center"><img src="'+headerRibbon+'"></td></tr>';
	htmltemp+='</table>';
	htmltemp+='</div>';
	htmltemp+='<table id="studentdata" class = "common_table" style="width: 80%;">';
	htmltemp+='<caption> Basic Tuition Fees </caption>';
	htmltemp+='<thead><tr>';
	htmltemp+='<th style="text-align:center"></th>';
	htmltemp+='<th style="text-align:center"></th>';
	htmltemp+='<th style="text-align:center"></th>';
	htmltemp+='<th style="text-align:center">PRICE</th>';
	htmltemp+='</tr></thead><tbody id="mandatoryBody">';
	htmltemp+='<tr>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;"></td>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;"></td>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;">SUBTOTAL</td>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;">PHP '+amount+'</td>';
	htmltemp+='</tr>';
	htmltemp+='</tbody>';
	htmltemp+='</table>';
	htmltemp+='<table id="studentdata" class = "common_table" style="width: 80%;">';
	htmltemp+='<caption> Additional Fees</caption>';
	htmltemp+='<thead><tr>';
	htmltemp+='<th style="text-align:center"></th>';
	htmltemp+='<th style="text-align:center"></th>';
	htmltemp+='<th style="text-align:center"></th>';
	htmltemp+='<th style="text-align:center">PRICE</th>';
	htmltemp+='</tr></thead><tbody id="mandatoryBody">';
	htmltemp+='<tr>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;"></td>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;"></td>';
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;">SUBTOTAL</td>';//<span style="color:orange"></span>
	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;">PHP '+additionaAmount+'</td>';//<span style="color:orange"></span>
	htmltemp+='</tr>';
	htmltemp+='</tbody>';
	htmltemp+='</table>';
//	htmltemp+='</div>';
//	htmltemp+='<div>';
	htmltemp+='<table style="width: 80%;" align="center"><tbody id="mandatoryBody">';
	htmltemp+='<tr>';
//	htmltemp+='<td style="text-align:center; padding-left:80%;"></td>';//
//	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px;"></td>';//padding-bottom:5px; 
	htmltemp+='<td style="text-align:center; padding-top:0.5px; font-size:15px; float:right;"><span style="color:#4d5e7a;">TOTAL'+'&nbsp;&nbsp;&nbsp;&nbsp;'+'PHP '+totalAmount+'</span></td>';
//	htmltemp+='<td style="text-align:center; padding-bottom:5px; padding-top:0.5px; font-size:14px; font-family:bold; float:right;"><span style="color:#A9A9A9">PHP '+totalAmount+'</span></td>';
	htmltemp+='</tr>';
	htmltemp+='</tbody></table>';
	var labelSubmit = '';
	if(enrollmentType == 'adjustment') {
		labelSubmit = 'Adjust';
	}
	else if(enrollmentType != 'adjustment') {
		labelSubmit = enrollmentType.indexOf('preenroll') >= 0?'Pre-Enroll':'Enroll';
	}	

	htmltemp+='<table align="center" style="width: 80%; padding-bottom: 50px;padding-top: 20px;"><tbody><tr>';
//	htmltemp+='<td style="padding-left:70%;"></td>';style="padding-left:2%;"
//	onClick="goBack(enrollmentdetails);"
	htmltemp+='<td style="float:right"><input type="button" class="btnAP" value="'+labelSubmit+'" id="onsubmit" style="background-color:#607799;">'+'&nbsp;&nbsp;&nbsp;&nbsp;'+'<input type="button" class="btnAP" value="Back" onClick="goBack();" id="onback" style="background-color:#607799;">'+'&nbsp;&nbsp;&nbsp;&nbsp;'+'<input type="button" class="btnAP" value="Cancel" id="oncancel" style="background-color:#607799;"></td>';
//	htmltemp+='<td style="padding-left:2%;"><input type="button" class="btnAP" value="Back" id="onback" style="background-color:#607799"></td>';
//	htmltemp+='<td style="padding-left:2%;"><input type="button" class="btnAP" value="Cancel" id="oncancel" style="background-color:#607799"></td>';	

	htmltemp+='</tr></tbody></table>';

	htmltemp+='</div>';
	htmltemp+='</body></html>';

	return htmltemp;
}
function toCurrencyFormat(rate)
{
	return rate.toFixed(2).replace(/./g, function(c, i, a) {
		return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
	});
}
function isCourseExists(jsonArray, value)
{
	for(var i=0; i<jsonArray.length; i++)
		if(jsonArray[i].course == value)
			return true;

	return false;
}

function getRatePrice_value(progYr,prog,acadYr,subsidiary)
{
	var JArray=[];
	var rate = 0;
	var educ_level = nlapiLookupField('customrecord_ederp_prog',prog,'custrecord_ederp_prog_edulevel');
	var filter = new Array();
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	filter.push(new nlobjSearchFilter('custrecord_ederp_pricing_progyear',null,'is',progYr));
	filter.push(new nlobjSearchFilter('custrecord_ederp_pricing_acadyear',null,'anyof',acadYr));
	if(educ_level)
		filter.push(new nlobjSearchFilter('custrecord_ederp_pricing_edulevel',null,'is',educ_level));
	filter.push(new nlobjSearchFilter('custrecord_ederp_setup_subsidiary','custrecord_ederp_pricing_setup','is',subsidiary));
	var col = new Array();
	col.push(new nlobjSearchColumn('custrecord_ederp_pricing_creditrate'));
	var pricing_master = nlapiSearchRecord('customrecord_ederp_pricing',null,filter,col);
	if(pricing_master)
	{
		rate = pricing_master[0].getValue('custrecord_ederp_pricing_creditrate');
	}

	return rate;
}
function getOnlinePriceCourses(subsidiary)
{
	var setup_object = getSetup(subsidiary);
	var courses = setup_object[0].getValue('custrecord_ederp_setup_onlineprice');
	if (courses) {
		courses = courses.split(',');
		return courses;
	}
	return [];
}
function chk_adjustmentCalender(idProgram,subsidiary){
	var filt = new Array();
	filt.push(new nlobjSearchFilter('custrecord_ederp_setup_subsidiary','custrecord_ederp_calendar_setup','is',subsidiary));
	filt.push(new nlobjSearchFilter('custrecord_ederp_calendar_event',null,'anyof',ENROLLMENT_ADJUSTMENT_CALENDER));
	filt.push(new nlobjSearchFilter('custrecord_ederp_calendar_startdate',null,'onorbefore','today'));//today
	filt.push(new nlobjSearchFilter('custrecord_ederp_calendar_enddate',null,'onorafter','today'));
	filt.push(new nlobjSearchFilter('custrecord_ederp_calendar_prog',null,'anyof',idProgram));
	filt.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	var cols= new Array();

	cols[0] = new nlobjSearchColumn('custrecord_ederp_calendar_acadyear');
	cols[1] = new nlobjSearchColumn('custrecord_ederp_calendar_term');

	var search_cal = nlapiSearchRecord('customrecord_ederp_calendar',null,filt,cols);
	if (search_cal) {
		return true;
	}else{
		return false;
	}	
}
function submitEnrollment_adjustment(enrollmentType,academicTerm,academicYr,courses,batch,homepgurl)
{
	var ADD_COURSE = 10;
	var SWAP_SECTION = 8;
	var DROP_ADJ = 11;
	var context = nlapiGetContext();
	var alreadySubmitted = context.getSessionObject('submitted');

	nlapiLogExecution('DEBUG', 'alreadySubmitted', alreadySubmitted);	
	var idStudent = nlapiGetUser().toString();//to avoid .0 and used in increment/decrement records

	var stud_data = nlapiLookupField('customer', idStudent, ['entityid','subsidiary','custentity_ederp_program']);
	var std_prog =  stud_data.custentity_ederp_program;
	var subsidiary = stud_data.subsidiary;
	//var stud_data = nlapiLookupField('customer', idStudent, ['entityid','custentity_ederp_program','custentity_ederp_currprogyear','subsidiary']);
	/*var idProgram = stud_data.custentity_ederp_program;
	var progranyear = stud_data.custentity_ederp_currprogyear;*/
	//var base_price = getRatePrice_value(progranyear,idProgram,academicYr,subsidiary);
	//var onlinprice_coursearr_setup = [];
	//onlinprice_coursearr_setup = getOnlinePriceCourses(subsidiary);

	if(alreadySubmitted && alreadySubmitted == 'true')
	{
		return '<p style="color:red; font-size:15px;" align="center">Your enrollment cart is emtpy. Please go back and select courses.</p>';
	}

	context.setSessionObject('submitted','true');
	var errorSchedTxt = [];
	//GET ALREADY SAVED ENROLLMENT MASTERS AND REMOVE THEIR SECTIONS FROM SELECTED SECTIONS == NEW SECTIONS

	var studentCode = stud_data.entityid;// nlapiLookupField('customer',idStudent,'entityid');
	var all_sections = [];
	courses = JSON.parse(courses);
	nlapiLogExecution('DEBUG', 'courses length', courses.length);	

	for(var s = 0; s<courses.length;s++)
	{
		var sections = courses[s].sections.split(',');
		courses[s].sections = sections;
		all_sections = all_sections.concat(sections);
	}
	//nlapiLogExecution('DEBUG', 'all_sections', all_sections);	

	var filter = new Array();
	filter[0] = new nlobjSearchFilter('custrecord_ederp_enroll_student', null, 'is',idStudent);
	filter[1] = new nlobjSearchFilter('custrecord_ederp_enroll_acadyear',null,'is',parseInt(academicYr));
	filter[2] = new nlobjSearchFilter('custrecord_ederp_enroll_acadterm', null, 'is',parseInt(academicTerm));
	filter[3] = new nlobjSearchFilter('isinactive',null,'is','F');
	filter[4] = new nlobjSearchFilter('custrecord_master_drop_master',null,'is','F');
	var column = new Array();
	column[0] = new nlobjSearchColumn('custrecord_ederp_enroll_course');
	column[1] = new nlobjSearchColumn('custrecord_ederp_enroll_schedule');
	column[2] = new nlobjSearchColumn('onlineprice','custrecord_ederp_enroll_course');
	column[3] = new nlobjSearchColumn('custitem_ederp_creditfortbcalculation','custrecord_ederp_enroll_course')
	var searchStudentEnrolledMaster = nlapiSearchRecord('customrecord_ederp_enroll', null, filter, column);
	if(searchStudentEnrolledMaster)
	{
		for(var sec=0; sec<searchStudentEnrolledMaster.length; sec++)
		{
			if(isCourseExists(courses, searchStudentEnrolledMaster[sec].getValue('custrecord_ederp_enroll_course')))
			{
				var coursesSch = searchStudentEnrolledMaster[sec].getValue('custrecord_ederp_enroll_schedule');
				coursesSch = coursesSch? coursesSch.split(','):[];
				for(var csc=0; csc<coursesSch.length; csc++)
				{
					var section_enrolled = nlapiLookupField('customrecord_ederp_schedule',coursesSch[csc],'custrecord_ederp_schedule_section');
					if(all_sections.indexOf(section_enrolled)>=0)
						all_sections.splice(all_sections.indexOf(section_enrolled),1);
				}	
			}	
		}
	}
	var chk_adjustmentperiod = chk_adjustmentCalender(std_prog,subsidiary);
	//nlapiLogExecution('DEBUG', 'after all_sections', all_sections);	
	var previousCourses = [] , previousEnrollments = [], inactiveEnrollments = [];
	//Delete all enrollment masters that have been created before
	if(searchStudentEnrolledMaster)
	{
		for(var sec = 0 ; sec < searchStudentEnrolledMaster.length ; sec++)
		{
			if(isCourseExists(courses, searchStudentEnrolledMaster[sec].getValue('custrecord_ederp_enroll_course')))
			{
				nlapiLogExecution('Debug', 'exists enroll', searchStudentEnrolledMaster[sec].getText('custrecord_ederp_enroll_course'));
				previousCourses.push(searchStudentEnrolledMaster[sec].getValue('custrecord_ederp_enroll_course'));
				previousEnrollments.push(searchStudentEnrolledMaster[sec].getId());	
			}	
			else
			{
				//doesn t exist anymore, put as inactive and increment back by 1			
				inactiveEnrollments.push(searchStudentEnrolledMaster[sec].getId());
				var coursesSch = searchStudentEnrolledMaster[sec].getValue('custrecord_ederp_enroll_schedule');
				coursesSch = coursesSch? coursesSch.split(','):[];

				if (chk_adjustmentperiod)
				{
					for(var csc=0; csc<coursesSch.length; csc++)
					{
						nlapiLogExecution('Debug', 'Create Increament/Decrement record inside for 6');
						var recDecInc= nlapiCreateRecord('customrecord_ederp_crsescheddec');
						recDecInc.setFieldValue('custrecord_ederp_crsescheddec_link',coursesSch[csc]);
						recDecInc.setFieldValue('custrecord_ederp_crsescheddec_student',idStudent);
						recDecInc.setFieldValue('custrecord_ederp_crsescheddec_action','T');
						nlapiSubmitRecord(recDecInc, true);
						nlapiLogExecution('Debug', 'Submit Increament/Decrement record inside for 6');
						nlapiSubmitField('customrecord_ederp_schedule',coursesSch[csc],'custrecord_ederp_schedule_acadyear',academicYr);
						nlapiLogExecution('Debug', 'Submit Course Schedule record inside for 6');
					}			
					//DROPPING RECORD CREATION FOR ADJUSTMENT TRANSACTION
					var price = 1;
					var cour = searchStudentEnrolledMaster[sec].getValue('custrecord_ederp_enroll_course');
					var cour_credit = searchStudentEnrolledMaster[sec].getValue('custitem_ederp_creditfortbcalculation','custrecord_ederp_enroll_course');

					//GETTING NEGATIVE IMPACT BEFORE POSTING CREDIT MEMO
					//	var impactamt =( Number(price) * Number(cour_credit)) * -1;
					var rec_obj = nlapiCreateRecord('customrecord_ederp_enroll_adjust_convert');
					rec_obj.setFieldValue('custrecord_ederp_adjust_convert_stud', idStudent);	
					//TRANSACTION IMPACT AMOUNT
					//rec_obj.setFieldValue('custrecord_ederp_adjust_convert_amount', impactamt);	
					rec_obj.setFieldValue('custrecord_ederp_adjust_convert_adj_type', DROP_ADJ);
					rec_obj.setFieldValue('custrecord_ederp_adjust_convert_master', searchStudentEnrolledMaster[sec].getId())	;
					var conversion_id = nlapiSubmitRecord(rec_obj);	
					//nlapiSubmitField('customrecord_ederp_enroll',searchStudentEnrolledMaster[sec].getId(),'isinactive','T');	
					//MARKING DROPPED MASTER AS TRUE ,AS IF WE INACTIVATE THE MATER WE CAN NOT ADD IT IN ENROLLMENT TRANSACTION
					//AS LIST OF ENROLLMENT MASTER ON LINE ITEM OF ENR DOES NOT GIVE INACTIVE MASTER FOR SELECTION
					nlapiSubmitField('customrecord_ederp_enroll',searchStudentEnrolledMaster[sec].getId(),'custrecord_master_drop_master','T');	
				}
			}
		}
	}
	/*nlapiLogExecution('Debug', 'previousCourses', previousCourses);
	nlapiLogExecution('Debug', 'previousEnrollments', previousEnrollments);*/

	//use all sections
	//create other enrollment masters and so if exists
	var arrStudEnrolled = [];
	if(enrollmentType && !isEmpty(enrollmentType))
	{
		var errorSched = false;
		var arrCourseSchedIDs=new Array();
		var item_schedules = [];
		for (var line=0; line < courses.length; line++ )
		{
			nlapiLogExecution('Debug', 'line ', line);		
			//Create one record for course schedules
			var course_sched = [];
			var itemId = courses[line].course;
			var item='';
			var errorItem = false;
			for(var l=0; l< courses[line].sections.length; l++)
			{
				var filter=new Array();
				filter[0]= new nlobjSearchFilter('isinactive',null,'is','F');
				filter[1]= new nlobjSearchFilter('custrecord_ederp_schedule_section', null, 'is', parseInt(courses[line].sections[l]));
				filter[2]= new nlobjSearchFilter('custrecord_ederp_schedule_acadyear', null, 'is', parseInt(academicYr));
				filter[3]= new nlobjSearchFilter('custrecord_ederp_schedule_acadterm', null, 'is', parseInt(academicTerm));
				filter[4]= new nlobjSearchFilter('custrecord_ederp_schedule_course', null, 'is', itemId);
				var column = new Array();
				column[0] = new nlobjSearchColumn('custrecord_ederp_schedule_course');
				column[1] = new nlobjSearchColumn('custrecord_ederp_schedule_availslots');
				column[2] = new nlobjSearchColumn('custrecord_ederp_schedule_section');
				var srchResults = nlapiSearchRecord('customrecord_ederp_schedule', null, filter, column);
				if(srchResults)
				{
					item = srchResults[0].getText('custrecord_ederp_schedule_course');
					for(var s=0;s<srchResults.length;s++ )
					{
						//Do not decrement increment if already saved
						if(all_sections.indexOf( courses[line].sections[l])>=0)
						{
							//swap section logic 
							nlapiLogExecution('Debug', 'Create Increament/Decrement record inside for 7');
							var recDecInc= nlapiCreateRecord('customrecord_ederp_crsescheddec');
							recDecInc.setFieldValue('custrecord_ederp_crsescheddec_link',srchResults[s].getId());
							recDecInc.setFieldValue('custrecord_ederp_crsescheddec_student',idStudent);
							recDecInc.setFieldValue('custrecord_ederp_crsescheddec_crseind',line);
							nlapiSubmitRecord(recDecInc, true);
							nlapiLogExecution('Debug', 'Submit Increament/Decrement record inside for 7');
							try{
								nlapiSubmitField('customrecord_ederp_schedule',srchResults[s].getId(),'custrecord_ederp_schedule_acadyear',academicYr);
								arrCourseSchedIDs.push(srchResults[s].getId());
								course_sched.push(srchResults[s].getId());	
							}
							catch(e)
							{
								nlapiLogExecution('Debug', 'in error', e.toString());
								errorSchedTxt.push(srchResults[s].getText('custrecord_ederp_schedule_section'));
								var indexDeletion = 0;
								if(!isEmpty(batch))
								{
									errorSched = true;
								}
								else
								{
									errorItem = true;
									indexDeletion = arrCourseSchedIDs.length - course_sched.length;	
								}


								//give slot back to all other schedules
								for(var schd_ind = indexDeletion; schd_ind < arrCourseSchedIDs.length ; schd_ind++)
								{
									nlapiLogExecution('Debug', 'Create Increament/Decrement record inside for 8');
									var recDecInc= nlapiCreateRecord('customrecord_ederp_crsescheddec');
									recDecInc.setFieldValue('custrecord_ederp_crsescheddec_link',arrCourseSchedIDs[schd_ind]);
									recDecInc.setFieldValue('custrecord_ederp_crsescheddec_action','T');
									recDecInc.setFieldValue('custrecord_ederp_crsescheddec_student',idStudent);
									nlapiSubmitRecord(recDecInc, true);
									nlapiLogExecution('Debug', 'Submit Increament/Decrement record inside for 8');
									nlapiSubmitField('customrecord_ederp_schedule',arrCourseSchedIDs[schd_ind],'custrecord_ederp_schedule_acadyear',academicYr);
									nlapiLogExecution('Debug', 'Submit Course Schedule record inside for 8');
								}
								s=srchResults.length; // no more schedules
								l=courses[line].sections.length; // no more sections											
							}
						}
						else
							course_sched.push(srchResults[s].getId());		
					}
				}
			}
			if(!errorItem)
				item_schedules.push({itemId:itemId,item:item,schedules:course_sched});

			if(errorSched)
				line=courses.length; //no more courses
		}
		if(errorSched)
		{
			for (var inac = 0; inac < inactiveEnrollments.length; inac++)
			{
				nlapiSubmitField('customrecord_ederp_enroll',inactiveEnrollments[inac],'isinactive','F');	
				var coursesSch = nlapiLookupField('customrecord_ederp_enroll',inactiveEnrollments[inac],'custrecord_ederp_enroll_schedule');
				coursesSch = coursesSch? coursesSch.split(','):[];
				for(var csc=0; csc<coursesSch.length; csc++)
				{
					nlapiLogExecution('Debug', 'Create Increament/Decrement record inside for 9');
					var recDecInc= nlapiCreateRecord('customrecord_ederp_crsescheddec');
					recDecInc.setFieldValue('custrecord_ederp_crsescheddec_link',coursesSch[csc]);
					recDecInc.setFieldValue('custrecord_ederp_crsescheddec_student',idStudent);
					nlapiSubmitRecord(recDecInc, true);
					nlapiLogExecution('Debug', 'Submit Increament/Decrement record inside for 9');
					nlapiSubmitField('customrecord_ederp_schedule',coursesSch[csc],'custrecord_ederp_schedule_acadyear',academicYr);
					nlapiLogExecution('Debug', 'Submit Course Schedule record inside for 9');
				}	
			}
			var closed_section = errorSchedTxt.toString();
			errorClosed.message = closed_section+errorClosed.message;
		}
		else
		{
			nlapiLogExecution('Debug', 'item_schedules', item_schedules.length);
			// all decrement hppened properly, and creation of
			for(var i = 0; i<item_schedules.length; i++)
			{
				var itemId = item_schedules[i].itemId;
				var item_sections = item_schedules[i].schedules;

				nlapiLogExecution('Debug', 'previousCourses.indexOf(itemId)', previousCourses.indexOf(itemId));
				if(previousCourses.indexOf(itemId)>=0)
				{
					idENR = previousEnrollments[previousCourses.indexOf(itemId)];
					// give back your previous seats
					nlapiLogExecution('Debug', 'idENR', idENR);
					var prevCrseSched = nlapiLookupField('customrecord_ederp_enroll',idENR, 'custrecord_ederp_enroll_schedule');
					prevCrseSched = prevCrseSched.split(',');
					var swap_sec = true;;

					for(var p = 0 ; p<prevCrseSched.length; p++)
					{
						if(item_sections.indexOf(prevCrseSched[p])<0)
						{
							if (swap_sec) {
								//CREATING CONVERSION RECORD WILL BE PROCESSED BY OTHER SCRIPT
								var rec_obj = nlapiCreateRecord('customrecord_ederp_enroll_adjust_convert')
								rec_obj.setFieldValue('custrecord_ederp_adjust_convert_stud', idStudent);	
								rec_obj.setFieldValue('custrecord_ederp_adjust_convert_adj_type', SWAP_SECTION);
								rec_obj.setFieldValue('custrecord_ederp_adjust_convert_master', idENR)	;
								var conversion_id = nlapiSubmitRecord(rec_obj);
								nlapiLogExecution('Emergency','conversion_id  ',conversion_id);	
								swap_sec = false;;
							}	
							nlapiLogExecution('Debug', 'Create Increament/Decrement record inside for 10');
							var recDecInc= nlapiCreateRecord('customrecord_ederp_crsescheddec');
							recDecInc.setFieldValue('custrecord_ederp_crsescheddec_link',prevCrseSched[p]);
							recDecInc.setFieldValue('custrecord_ederp_crsescheddec_action','T');
							recDecInc.setFieldValue('custrecord_ederp_crsescheddec_student',idStudent);
							nlapiSubmitRecord(recDecInc, true);
							nlapiLogExecution('Debug', 'Submit Increament/Decrement record inside for 10');
							nlapiSubmitField('customrecord_ederp_schedule',prevCrseSched[p],'custrecord_ederp_schedule_acadyear',academicYr);
							nlapiLogExecution('Debug', 'Submit Course Schedule record inside for 10');
						}
					}
					nlapiLogExecution('Debug', 'item_sections', item_sections);
					var fieldArray = new Array();
					fieldArray.push('custrecord_ederp_enroll_schedule');
					var fieldValueArray = new Array();
					fieldValueArray.push(item_sections);
					/*if(enrollmentType.indexOf('preenroll')<0) {
						fieldArray.push('custrecord_ederp_enroll_isenroll');
						fieldValueArray.push('T');
					}
					if(!isEmpty(batch)){
						fieldArray.push('custrecord_ederp_enroll_batch');
						fieldValueArray.push(batch);
					}*/
					fieldArray.push('custrecord_ederp_enroll_batch');
					fieldValueArray.push('');

					//This way only one nlapiSubmitField api is executed
					nlapiSubmitField('customrecord_ederp_enroll',idENR,fieldArray,fieldValueArray); 
				}
				else
				{
					var item = item_schedules[i].item;
					var recordeENR = nlapiCreateRecord('customrecord_ederp_enroll');
					recordeENR.setFieldValue( 'name',studentCode+'-'+item);
					recordeENR.setFieldValue( 'custrecord_ederp_enroll_course',itemId);
					recordeENR.setFieldValue( 'custrecord_ederp_enroll_student',idStudent);
					recordeENR.setFieldValue( 'custrecord_ederp_enroll_acadterm',parseInt(academicTerm));
					recordeENR.setFieldValue( 'custrecord_ederp_enroll_acadyear', parseInt(academicYr));
					recordeENR.setFieldValues( 'custrecord_ederp_enroll_schedule',item_sections);
					if(!isEmpty(batch))
						recordeENR.setFieldValue('custrecord_ederp_enroll_batch',batch);
					/*if(enrollmentType.indexOf('preenroll')<0)
						recordeENR.setFieldValue('custrecord_ederp_enroll_isenroll', 'T');*/
					idENR = nlapiSubmitRecord(recordeENR, true);

					//add new course CONSIDERING ADJUSTMENT
					//CREATING CONVERSION RECORD WILL BE PROCESSED BY OTHER SCRIPT
					var price = 1;
					/*var cour_data = nlapiLookupField('serviceitem', item, ['custitem_ederp_creditfortbcalculation','onlineprice']);
					var cour_credit = cour_data.custitem_ederp_creditfortbcalculation;	
					if (onlinprice_coursearr_setup.indexOf(item) != -1)
					{
						price = cour_data.onlineprice;
					}else{
						price = base_price;
					}*/
					//GETTING NEGATIVE IMPACT BEFORE POSTING CREDIT MEMO
					//var impactamt =( Number(price) * Number(cour_credit)) * -1;

					var rec_obj = nlapiCreateRecord('customrecord_ederp_enroll_adjust_convert')
					rec_obj.setFieldValue('custrecord_ederp_adjust_convert_stud', idStudent);
					//TRANSACTION IMPACT AMOUNT
					//rec_obj.setFieldValue('custrecord_ederp_adjust_convert_amount', impactamt);
					rec_obj.setFieldValue('custrecord_ederp_adjust_convert_adj_type', ADD_COURSE);
					rec_obj.setFieldValue('custrecord_ederp_adjust_convert_master', idENR)	;
					var conversion_id = nlapiSubmitRecord(rec_obj);
					nlapiLogExecution('Emergency','conversion_id  ',conversion_id);	
				}
				arrStudEnrolled.push(idENR);
			}
		}
	}
	if(errorSchedTxt.length>0)
		return '<p style="color:red; font-size:15px;" align="center">'+errorSchedTxt.toString()+' is no longer available. Go back to select another section.</p>';
	else
		return getConfirmationHTML(enrollmentType,homepgurl);
}