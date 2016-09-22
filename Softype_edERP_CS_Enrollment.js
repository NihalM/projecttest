/* **************************************************************************************  
 ** Copyright (c) 1998-2014 Softype, Inc.                                 
 ** Morvi House, 30 Goa Street, Ballard Estate, Mumbai 400 001, India
 ** All Rights Reserved.                                                    
 **                                                                         
 ** This software is the confidential and proprietary information of          
 ** Softype, Inc. ("Confidential Information"). You shall not               
 ** disclose such Confidential Information and shall use it only in          
 ** accordance with the terms of the license agreement you entered into    
 ** with Softype.                       
 ** @author:  Sarah Akid monisha
 ** @version: 1.0
 ** Description: Client Side Script for Enrollment
 ************************************************************************************** */
var Schedules = {} , coursename, idCourse;
function sortDays(myList){
	//nlapiLogExecution('EMERGENCY','myList',myList);
	var myDays = [];
	$('.days').each(function(){
		myDays.push($(this).text());
	});

	if(myList)
	{
		myList = myList.split(',');
		/*var myDays= [];
		for(var d=0; d<arrDay.length; d++)
		{
			myDays.push(arrDay[d].name);
		}*/
		//nlapiLogExecution('EMERGENCY','myDays',myDays);
		myList.sort(function(a,b){
			var compA = myDays.indexOf(a);
			var compB = myDays.indexOf(b);
			return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
		});
		return myList;
	}
	return [];
}
function calcTime(offset) {

	// create Date object for current location
	d = new Date();

	// convert to msec
	// add local time zone offset
	// get UTC time in msec
	utc = d.getTime() + (d.getTimezoneOffset() * 60000);

	// create new Date object for different city
	// using supplied offset
	nd = new Date(utc + (3600000 * offset));

	// return time as a string
	return nd;

}
function checkStorage()
{
	var currentDate = calcTime('+8');
	var allowedTime = 30; //(30mins)
	if(localStorage.getItem("entry") !== null)
	{
		var entryDate = localStorage.getItem("entry");
		entryDate = new Date(entryDate);

		var elapsed = (currentDate - entryDate) / (1000 * 60);

		if(elapsed >= allowedTime)
		{
			alert('Sorry. You have exhausted the session time in edERP.');
			window.location.href="https://system.netsuite.com/pages/nllogoutnoback.jsp";
		}
		else
		{
			$('.ns-search').text('Time remaining: '+ parseInt(allowedTime-elapsed)+'mins.');
		}
	}
	else
		localStorage.setItem("entry", currentDate);
}
function toCurrencyFormat(rate)
{
	return rate.toFixed(2).replace(/./g, function(c, i, a) {
		return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
	});
}
var colorBg=$('#ns_navigation').css('backgroundColor');

function hideDisplayBody(e)
{
	$(e).parent().siblings().slideToggle(200);
	var idImg = $(e).attr('id');
	if(idImg.indexOf('down')>=0)
	{
		$(e).attr('id','icon_up');
		$(e).css('content','url('+$('#uppng').text()+')');
	}

	else
	{
		$(e).attr('id','icon_down');
		$(e).css('content','url('+$('#downpng').text()+')');
	}
}

$(document).ready(function(){
	$('.btnAP').css('background',colorBg);
	checkStorage();
	if($('#batchList') && $('#batchList').val())
	{
		viewCourses();
	}

	else if($('#allstudentdetails').length>0)
	{
		var details = JSON.parse($('#allstudentdetails').text());
		if($('#batchList').length > 0)
		{
			var selectedBatch = details.exisitngB;
			$('#batchList').val(selectedBatch);
			viewCourses();	
		}
	}

	var Cross_jsons=$('#all_dataofJson').text();
	if(Cross_jsons && Cross_jsons!= '' && Cross_jsons!= 'null' )
	{
		var backCrossdata= JSON.parse(Cross_jsons);
		//alert('Cross_jsons = '+Cross_jsons+'@@'+'backCrossdata = '+backCrossdata);
		addToCalendar('',backCrossdata);
	}
	else if($('#allexistingenr') && $('#allexistingenr').text()) {
		var details = JSON.parse($('#allexistingenr').text());
		var model = JSON.parse($('#allbatchdetails').text());
		loadSchedule(details,model);
	}

	$('#batchList').on('change',function() {
		$('.btnAP').css('background',colorBg);
		viewCourses();
	});

	$('#validate').on('click',function(){
		validateItems();
	});

	$('#onsubmit').on('click',function(){
		$('.btnAP').css('background','#e5e5e5');
		$('.btnAP').prop("disabled",true);
		enroll();
	});

	//$('#onback').on('click',function(){
	//	goBack();
	//});

	$('#oncancel').on('click',function(){
		onCancel();
	});

	var backbatchid= $('#backbatchid').val();
	if(backbatchid)
	{
		viewCourses(backbatchid);
	}





});

function goBack()
{
	var studentmodel = JSON.parse($('#enrollmentdetails').text());
	var acadTerm = studentmodel.term;
	var acadYear = studentmodel.year;
	var enrollmentType = studentmodel.type;


	var enrollMethod = enrollmentType;
//	alert('enrollment type' +enrollmentType);
	var type = enrollmentType.indexOf('preenroll') >= 0? true:false;

	var event = type;
	var acadYearName = studentmodel.acadYearName;//'AY 2015-2016';
	var acadTermName = studentmodel.acadTermName;//'Second Semester';
	var batch = studentmodel.batch;
	var Cross_data = $('#Cross_data').text();

	var selectedCreditAmount = $('#selected_creditamounts').text();

	var linkUrl = getNetsuiteURL();
	var compId = nlapiGetContext().getCompany();

//	var URL1 = nlapiResolveURL('SUITELET', 'customscript_ederp_enroll_eligibility', 'customdeploy_ederp_enroll_elligibility');
//	URL1+='&compid='+compId;
	var URL = '';
	if(enrollmentType == 'adjustment') {
		URL = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_adjust_enroll', 'customdeploy_softype_ederp_adjust_enroll');
	}

	else {

		//Pre-Enrollment
		if(type == true) {

			if(enrollmentType == 'freecoursepreenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_freecourse', 'customdeploy_ederp_st_enr_freecourse');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1';
			}
			else if(enrollmentType == 'selectedbatchpreenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_selectbatch', 'customdeploy_ederp_st_enr_selectbatch');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=559&deploy=1';
			}
			else if(enrollmentType == 'fixedbatchpreenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_fixedbatch', 'customdeploy_ederp_st_enr_fixedbatch');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=541&deploy=1';
			}
//			URL = 'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=552&deploy=1&compid=3339763&whence=';
		}
		//Enrollment
		else {
			if(enrollmentType == 'freecourseenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_freecourse', 'customdeploy_ederp_st_enr_freecourse');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1';
			}
			else if(enrollmentType == 'selectedbatchenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_selectbatch', 'customdeploy_ederp_st_enr_selectbatch');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=559&deploy=1';
			}
			else if(enrollmentType == 'fixedbatchenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_fixedbatch', 'customdeploy_ederp_st_enr_fixedbatch');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=541&deploy=1';
			}
			else if(enrollmentType == 'crosssuppenroll') {
				URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_crossnsuppl', 'customdeploy_ederp_st_enr_crossnsuppl');//'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=560&deploy=1';
			}
//			URL = 'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=556&deploy=1&compid=3339763&whence=';//linkUrl+URL1;//
		}
	}
	URL+='&compid='+compId;
	URL+='&selectedcreditamount='+selectedCreditAmount;
	URL+='&batchid='+batch;

//	alert('URL : '+URL);
//	var params = {action:'sendData',acadYear:acadYear.toString(),acadTerm:acadTerm.toString(),event:event.toString(),enrollMethod:enrollMethod.toString(),acadYearName:acadYearName.toString(),acadTermName:acadTermName.toString()};
//	var redirectURL = linkUrl+URL;//+params
//	alert('Redirect URL : '+redirectURL);
//	document.location.href=redirectURL;
	openCS('POST', URL, {action:'onback',acadYear:acadYear.toString(),acadTerm:acadTerm.toString(),event:event.toString(),enrollMethod:enrollMethod.toString(),acadYearName:acadYearName.toString(),acadTermName:acadTermName.toString(),Cross_data:Cross_data.toString()});
//	window.history.back();
}

openCS= function(verb, url, data, target) {
	var form = document.createElement("form");
	form.action = url;
	form.method = verb;
	form.target = target || "_self";
	if (data) {
		for (var key in data) {
			var input = document.createElement("textarea");
			input.name = key;
			input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
			form.appendChild(input);
		}
	}
	form.style.display = 'none';
	document.body.appendChild(form);
	form.submit();
};

//enrollmentdetails
function goBack1()
{
	var studentmodel = $('#enrollmentdetails').text();
	var acadTerm = studentmodel.term;
	var acadYear = studentmodel.year;
	var enrollmentType = studentmodel.type;
	var batch = studentmodel.batch;


	var URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_freecourse', 'customdeploy_ederp_st_enr_freecourse');
//	url+='&action=submission';
//	url+='&acadTerm='+acadTerm;
//	url+='&acadYear='+acadYear;
//	url+='&enrollmentType='+enrollmentType;
//	url+='&batch='+batch;

	openCS('POST', URL, {action:'sendData',acadYear:acadYear,acadTerm:acadTerm,enrollMethod:enrollmentType,batch:batch,event:'2',acadYearName:'AY 2015-2016',acadTermName:'Second Semester'});

//	window.open(url,'_self');
//	if(window.history.back()==undefined)
//	window.location.reload();
}

openCS= function(verb, url, data, target) {
	var form = document.createElement("form");
	form.action = url;
	form.method = verb;
	form.target = target || "_self";
	if (data) {
		for (var key in data) {
			var input = document.createElement("textarea");
			input.name = key;
			input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
			form.appendChild(input);
		}
	}
	form.style.display = 'none';
	document.body.appendChild(form);
	form.submit();
};

function onCancel()
{
	var resp=confirm('You enrollment will be lost. Are you sure you want to leave this page?');
	if(resp){

		var studentmodel = JSON.parse($('#enrollmentdetails').text());
		var enrollmentType = studentmodel.type;
		var type = enrollmentType.indexOf('preenroll') >= 0? true:false;
		var URL = '';

		/*
		if(type == true) {
			URL = 'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=552&deploy=1&compid=3339763&whence=';
		}
		else {
			URL = 'https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=556&deploy=1&compid=3339763&whence=';//linkUrl+URL1;//
		}
		 */

		if(type == true) {

			/** Pre Enrollment Eligibility **/
			URL = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_pre_enroll', 'customdeploy_softype_ederp_st_pre_enroll');
		}
		else {

			/** Enrollment Eligibility **/
			URL = nlapiResolveURL('SUITELET', 'customscript_ederp_enroll_eligibility', 'customdeploy_ederp_enroll_elligibility');
		}

		document.location.href=URL;

	}
//	if(window.history.back()==undefined)
//	window.location.reload();
}

function enroll()
{
	$("body").css("cursor", "wait");

//	$('.btnAP1').show();	
//	$('.btnAP').hide();
	var details = JSON.parse($('#scheduledetails').text());
	var studentmodel = JSON.parse($('#enrollmentdetails').text());
	var acadTerm = studentmodel.term;
	var acadYear = studentmodel.year;
	var batch = studentmodel.batch;
	var linkUrl = getNetsuiteURL();

	var enrollmentType = studentmodel.type;
	var type = enrollmentType.indexOf('preenroll') >= 0? true:false;
	var homepgurl1 = '';

	if(enrollmentType == 'adjustment') {
		homepgurl1 = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_adjust_eli', 'customdeploy_softype_ederp_st_adjust_eli');
	}

	else if(enrollmentType != 'adjustment') {
		if(type) {
			homepgurl1 = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_st_pre_enroll', 'customdeploy_softype_ederp_st_pre_enroll');
		}
		else {
			homepgurl1 = nlapiResolveURL('SUITELET', 'customscript_ederp_enroll_eligibility', 'customdeploy_ederp_enroll_elligibility');
		}
	}

	var compId = nlapiGetContext().getCompany();
	var homepgurl = linkUrl+homepgurl1+'&compid='+compId;

	var parameters={
			acadTerm:acadTerm,
			acadYear:acadYear,
			details:details,
			enrollmentType:enrollmentType,
			batch:batch,
			homepgurl:homepgurl
	};

//	var parameters={
//	acadTerm:acadTerm,
//	acadYear:acadYear,
//	details:details,
//	enrollmentType:enrollmentType,
//	batch:batch
//	};

	var url = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_checkout', 'customdeploy_ederp_st_enr_checkout');
	url+= '&action=submission';

	$.ajax({
		url: url,
		type:'POST',
		data:parameters
	}).complete(function( data ){
		if(data)
		{
			var message= data.responseText ;
			if(message.indexOf('successfully submitted!') >= 0)
			{
				//remove buttons
				$('#summarytable').empty();
				$('.btnAP').remove();
				$("body").css("cursor", "initial");
			}
			else
			{
				$('.btnAP').removeAttr('disabled');
				$('.btnAP').css('background', colorBg);
				$("body").css("cursor", "default");
			}
			$('#summarytable').prepend(message);	

		}
	});
}

/**GENERIC: NS DOMAIN**/
function getNetsuiteURL()
{
	var linkUrl;
	switch (nlapiGetContext().getEnvironment()) 
	{
	case "PRODUCTION":
		linkUrl = 'https://system.netsuite.com';
		break;

	case "SANDBOX":
		linkUrl = 'https://system.sandbox.netsuite.com';
		break;

	case "BETA":
		linkUrl = 'https://system.beta.netsuite.com';
		break;
	}

	return linkUrl;
}

function alphanum(a, b) 
{
	function chunkify(t) {
		var tz = [], x = 0, y = -1, n = 0, i, j;

		while (i = (j = t.charAt(x++)).charCodeAt(0)) {
			var m = (i == 46 || (i >=48 && i <= 57));
			if (m !== n) {
				tz[++y] = "";
				n = m;
			}
			tz[y] += j;
		}
		return tz;
	}

	var aa = chunkify(a.SectionName);
	var bb = chunkify(b.SectionName);

	for (var x = 0; aa[x] && bb[x]; x++) {
		if (aa[x] !== bb[x]) {
			var c = Number(aa[x]), d = Number(bb[x]);
			if (c == aa[x] && d == bb[x]) {
				return c - d;
			} else return (aa[x] > bb[x]) ? 1 : -1;
		}
	}
	return aa.length - bb.length;
}

$.expr[':'].contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase()
	.indexOf(m[3].toUpperCase()) >= 0;
};

function SearchByKeyWord(table, word)
{
	$('#'+table+' table tbody tr').find('td:nth-child(2):not(:contains("'+word+'"))').closest('tr').css('display','none');

}



/**GENERIC: OPENS POPUP**/
function messagePopup(msg)
{
	msg+='<div style="margin-left:200px; margin-top:20px;"><input id="btn_OK" class="btn btn-primary btnAP" type="button" value="OK" onClick="jbox_close(this);"/></div>';

	var options = {
			width:500,
			content: msg,
			title:'Alert',
			ignoreDelay: true,
			closeButton:false,
			draggable:'title',
			blockScroll:false,
			closeOnClick:false,
			onCloseComplete: function() 
			{ 
				this.destroy();
			}
	};

	var M=new jBox('Modal',options);
	M.open();
	$('#btn_OK').css('background-color',colorBg);
	$('.jBox-title').css('background-color',colorBg);

}

//todo
function refreshValues(idCourse)
{
	$('#refreshBtn').attr('disabled','disabled');
	$("body").css("cursor", "wait");

	var acadTerm = $('[id^="acadTerm_"]').attr('id').split('_')[1];
	var acadYear = $('[id^="acadYr_"]').attr('id').split('_')[1];
	var sections = [];
	$('.jBox-content input[type="checkbox"]').each(function()
			{
		sections.push($(this).attr('id'));
			});
	var parameters = '&acadTerm='+acadTerm+'&acadYear='+acadYear+'&sections='+sections.toString();

	var url = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_checkout', 'customdeploy_ederp_st_enr_checkout');
	url+= '&action=refresh';
	url+= parameters;

	$.ajax({
		url: url,
		type: 'POST'
	}).complete(function( data ) {
		if(data)
		{
			var sectionObj = JSON.parse(data.responseText);
			popupWindow(idCourse,sectionObj);
			$("body").css("cursor", "initial");
		}
	});

}

function isTimeExists(startTime,endTime,arrayTimings)
{
	for(var i=0; i<arrayTimings.length; i++)
	{
		if((arrayTimings[i][1]==startTime) && (arrayTimings[i][2]==endTime))
			return i;
	}
	return -1;
}

function submitItems(scheduledCourses)
{
	var model = JSON.parse($('#allbatchdetails').text());
	var selectedCredits = model.totalCredits;
	var selectedAmount = model.totalAmount;
	var studentmodel = JSON.parse($('#allstudentdetails').text());
	var maxCredits = studentmodel.maxcredit;
	var minCredits = studentmodel.mincredit;
	var enrollmentType = $('#enrtype').text();
	var enrorlate =  $('#enrorlate').text();
	var All_Data_of_JSON =  $('#all_dataofJson').text();
	var rate = 	model.rate;
	var batch =  $('#batchList').val();

	var freeCourseCalendData = $('#all_dataofJson').text();

	//check min credit reached
	if(parseInt(selectedCredits) < parseInt(minCredits))
	{
		messagePopup('The total credits selected is less than the minimum requirement for this academic term.');
		return false;
	}
	//check max credit reached
	if(parseInt(selectedCredits) > parseInt(maxCredits))
	{
		messagePopup('The total credits selected is more than the maximum requirement for this academic term.');
		return false;
	}	

	//If all good then set values of items to be added to cart in multi
	//Ajax call to get Additional fees
	var sections = [];
	for(var c = 0; c<scheduledCourses.length; c++)
	{
		var sec = [];
		$('[id^="canvas_'+scheduledCourses[c]+'"]').each(function(){
			var id = $(this).attr('id').split('_');
			if(sec.indexOf(id[2])<0)
				sec.push(id[2]);
		});
		sections.push({course:scheduledCourses[c], sections:sec.toString()});
	}

	var acadTerm=$('[id^="acadTerm"]').attr('id').split('_')[1];
	var acadYear=$('[id^="acadYr"]').attr('id').split('_')[1];
	var acadTermName = $('[id^="acadTerm"]').text();
	var acadYearName = $('[id^="acadYr"]').text();

//	alert('Term Name : '+acadTermName);
	var parameters={
			courses:sections,	
			acadTerm:acadTerm,
			acadYear:acadYear,
			selectedCredits:selectedCredits,
			enrollmentType:enrollmentType,
			rate:rate,
			amount:selectedAmount,
			enrorlate:enrorlate,	
			arrCourses:scheduledCourses.toString(),
			batch:batch,
			acadTermName:acadTermName.toString(),
			acadYearName:acadYearName.toString(),
			All_Data_of_JSON:All_Data_of_JSON.toString(),
	};

	var url;
	if(enrollmentType == 'adjustment')
	{
		url = nlapiResolveURL('SUITELET', 'customscript_softype_ederp_adj_checkout', 'customdeploy_softype_ederp_adj_checkout');
	}
	else
	{
		url = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_checkout', 'customdeploy_ederp_st_enr_checkout');		
	}

	url+= '&action=summary';
	openCS('POST', url, parameters);
}

function checkSelectedComp(obj)
{	
//	$("#btn_submit").prop("disabled",false);
//	$('#btn_submit').css('background-color',colorBg);
	var model = JSON.parse($('#allbatchdetails').text());
	var listCredits = model.courseSchedules.listCourseCredits;
	var course_credits = $.map(listCredits, function(obj) {if(obj.id == idCourse)return obj.credit;});
	course_credits = course_credits?course_credits[0]:0;

	var selectedCredits = model.totalCredits;
	var studentmodel = JSON.parse($('#allstudentdetails').text());
	var maxCredits = studentmodel.maxcredit;
//	alert(maxCredits);
	var current_credits = parseInt(selectedCredits)+parseInt(course_credits);
//	alert(current_credits);
	var existingCanvas = $('[id^="canvas_'+idCourse+'"]').length>0?true:false;

	if(current_credits>parseInt(maxCredits) && $(obj).is(':checked') && !existingCanvas)
	{
		messagePopup('By selecting this course your credit limit will be exceeded.');
		$(obj).attr('checked',false);
	}
	else
	{
		//detect whether it is by group or component
		var numberOfColumns = $(obj).closest('table.courses.sections').find('thead td').length;
		if(numberOfColumns == 10) // per component
		{
			if($(obj).is(':checked'))
			{
				$(obj).closest('table.courses.sections').find('input:not(:checked)').attr('disabled','disabled');
			}
			else
			{
				$(obj).closest('table.courses.sections').find('input[onclick="checkSelectedComp(this);"]').removeAttr('disabled');
			}
		}
		else if(numberOfColumns == 11) // per group
		{
			var selectedComponent = $(obj).closest('tr').find('td:eq(2)').text().trim();
			if($(obj).is(':checked'))
			{
				$(obj).closest('table.courses.sections').find('td:contains("'+selectedComponent+'")').closest('tr').find('input:not(:checked)').attr('disabled','disabled');
				//disable all inputs in other groups
				$('table.courses.sections').not($(obj).closest('table.courses.sections')).find('input:not(:checked)').attr('disabled','disabled');
			}
			else
			{
				$(obj).closest('table.courses.sections').find('td:contains("'+selectedComponent+'")').closest('tr').find('input[onclick="checkSelectedComp(this);"]').removeAttr('disabled');
				//if nothing is checked here anymore, enable other groups
				var remainingChk = $(obj).closest('table.courses.sections').find('input:checked').length;
				if(remainingChk==0)
				{
					$('table.courses.sections').not($(obj).closest('table.courses.sections')).find('input[onclick="checkSelectedComp(this);"]').removeAttr('disabled');
				}
			}
		}
	}
}

function save_sections(obj)
{
	var groupOrcomponent = $('.jBox-content').find('table.courses.sections:eq(0) thead td').length;
	groupOrcomponent = groupOrcomponent==10?'component':'group';

	var numberOfComponent;
	if(groupOrcomponent=='component')
		numberOfComponent = $('.jBox-content').find('table.courses.sections').length;
	else
	{
		var group = $('.jBox-content').find('input[type="checkbox"]:checked').closest('table.courses.sections');
		var grpname='' , numberOfComponent=0;
		group.find('tbody tr').each(function(){
			var currentComp = $(this).find('td:eq(2)').text();
			if( currentComp != grpname)
			{
				grpname = $(this).find('td:eq(2)').text();
				numberOfComponent++;
			}
		});
	}

	var numberOfChecked = $('.jBox-content').find('table.courses.sections input[type="checkbox"]:checked').length;

	if(numberOfChecked==0)
	{
		if($('[id^="canvas_'+idCourse+'"]').length>0)
		{
			$('[id^="canvas_'+idCourse+'"]').remove();
			$('#ViewSchedule_'+idCourse).closest('tr').css('background-color','');

			var model = JSON.parse($('#allbatchdetails').text());
			var selectedCredits = model.totalCredits;
			var listCredits = model.courseSchedules.listCourseCredits;
			var course_credits = $.map(listCredits, function(obj) {if(obj.id == idCourse)return obj.credit;});
			var current_credits = parseInt(selectedCredits)-parseInt(course_credits);
			$('#selectedCrd').text(current_credits);
			model.totalCredits = parseInt(current_credits);

			var course_amount = $('#ViewSchedule_'+idCourse).closest('tr').find('td:eq(3)').text().replace(',','');
			var current_amount = parseFloat(model.totalAmount)-parseFloat(course_amount);
			model.totalAmount = Number(current_amount);
			$('#allbatchdetails').text(JSON.stringify(model));
			$('#selectedAmnt').text(toCurrencyFormat(current_amount));

			removeStatus(idCourse);
			//check if no courses at all to disable button
			if($('[id^="canvas_"]').length==0)
			{
				$('#validate').attr('disabled','disabled');
				$('#submit-items').attr('disabled','disabled');
			}
		}

		box_close();
	}
	else if(numberOfChecked==numberOfComponent)
	{
		var JSONarray = {};
		JSONarray.courseName= $('#ViewSchedule_'+idCourse).closest('tr').find('td:eq(0)').text().trim();
		JSONarray.course=idCourse;
		var timings=[];

		var sectionsSelected = [];
		for(var i=0; i<numberOfChecked; i++)
			sectionsSelected.push($('.jBox-content').find('input[type="checkbox"]:checked').eq(i).attr('id'));

		for (var i=0; i<Schedules.length; i++)
		{
			for(var j=0; j<Schedules[i].details.length; j++)
			{
				if(sectionsSelected.indexOf(Schedules[i].details[j].Section)>=0)
				{
					var days = Schedules[i].details[j].day.split(',');
					var start=Schedules[i].details[j].startTime.split(',');
					var end=Schedules[i].details[j].endTime.split(',');
					for(var d=0; d<days.length; d++)
					{
						var f = Schedules[i].details[j].Faculty;
						if($('#selectFaculty').length>0)
							f = $('#selectFaculty option[id="'+Schedules[i].details[j].Faculty+'"]').text().trim();
						timings.push({
							classroom:Schedules[i].details[j].RoomName,
							component:Schedules[i].Component,
							day:days[d],
							startTime:start[d],
							endTime:end[d],
							faculty:f,
							section: Schedules[i].details[j].Section,
							sectionName: Schedules[i].details[j].SectionName
						});
					}

				}

			}

		}
		var validTimings = validateTimings(timings);
		if(validTimings)
		{
			var checkOverlappCourses = validateCoursesTimings(timings);
			if(checkOverlappCourses)
			{
				messagePopup('The timings of the selected sections are overlapping with your current schedule.');
				$('.jBox-content').find('table.courses.sections input[type="checkbox"]:checked').trigger('click');
			}
			else
			{
				var isAlreadyinCalendar = $('[id^="canvas_'+idCourse+'"]').length>0?true:false;
				JSONarray.timings=timings;

				addToCalendar(JSONarray);
				$('#ViewSchedule_'+idCourse).closest('tr').css('background-color','#fefeee');


				var model = JSON.parse($('#allbatchdetails').text());
				var selectedCredits = model.totalCredits;
				var listCredits = model.courseSchedules.listCourseCredits;
				var course_credits = $.map(listCredits, function(obj) {if(obj.id == idCourse)return obj.credit;});
				course_credits = course_credits?course_credits[0]:0;

				var current_credits = parseInt(selectedCredits)+parseInt(course_credits);
				var course_amount = $('#ViewSchedule_'+idCourse).closest('tr').find('td:eq(3)').text().replace(',','');
				var current_amount = parseFloat(model.totalAmount)+parseFloat(course_amount);

				if(!isAlreadyinCalendar)
				{
					$('#selectedCrd').text(current_credits);
					$('#selectedAmnt').text(toCurrencyFormat(current_amount));
					model.totalCredits = parseInt(current_credits);
					model.totalAmount = parseInt(current_amount);
					$('#allbatchdetails').text(JSON.stringify(model));
				}
				box_close();

				if($('#validate').attr('disabled')=='disabled')
					$('#validate').removeAttr('disabled');
				$('#validate').css('background-color', colorBg);
			}
		}
		else
		{
			messagePopup('The timings of the selected sections are overlapping with each other.');
			$('.jBox-content').find('table.courses.sections input[type="checkbox"]:checked').trigger('click');
		}
	}
	else
		messagePopup('Please select a section for every course component.');

}

function removeStatus(course)
{
	var search = $('td[id$="_'+course+'"]').length>0? '#ViewSchedule_'+course : '#courses #'+course;
	var isMandatory = $('td[id$="_'+course+'"]').length==0?true:($('#currentCoursesMandTab #ViewSchedule_'+course).length>0?true:false);
	if(($(search).closest('tr').attr('class') == 'n'|| 
			($(search).closest('tr').attr('class') == 'r' && SC.CUSTOM.enrollmentType.indexOf('freecourse')>=0)) 
			&& isMandatory )
		$(search).closest('tr').attr('class','ignore');
	else
		$(search).closest('tr').removeAttr('class');
	var tt=$('#all_dataofJson').text();

	if(tt !="" && tt != undefined && tt != null && tt!= "null" &&  tt!= 'undefined' )
	{
		temp=JSON.parse($('#all_dataofJson').text());
		for(var o=0;o<temp.length;o++)
		{

			if(temp[o].course == course)
			{
				temp.splice(o,1);
			}			   
		}
		if(temp.length == 0) 
			temp="";
		else
			temp=JSON.stringify(temp);
		$('#all_dataofJson').text(temp);
	}
}

open = function(verb, url, data, target) {
	var form = document.createElement("form");
	form.action = url;
	form.method = verb;
	form.target = target || "_self";
	if (data) {
		for (var key in data) {
			var input = document.createElement("textarea");
			input.name = key;
			input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
			form.appendChild(input);
		}
	}
	form.style.display = 'none';
	document.body.appendChild(form);
	form.submit();
};

/**GENERIC: FIRST LETTER CAP**/
function capitaliseFirstLetter(string)
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}
function validateCoursesTimings(timings)
{

	//get canvas
	var arrCanvas = [];
	$('[id^="canvas_"]').each(function(){
		var id=$( this ).attr('id');
		id = id.split('_');
		if(idCourse!=parseInt(id[1]))
		{
			id[3] =$('.days:contains("'+capitaliseFirstLetter(id[3])+'")').attr('id'); 
			arrCanvas.push([id[3],id[4],id[5]]);
		}
	});
	if(arrCanvas.length==0)
		return false;

	for(var i=0; i<timings.length; i++)
	{
		var day=$('.days:contains("'+timings[i].day+'")').attr('id');
		var stime = timings[i].startTime;
		stime = stime.substring(0,2)+stime.substring(3,5);
		var endtime= timings[i].endTime;
		endtime = endtime.substring(0,2)+endtime.substring(3,5);
		if(!searchSimilarSched(arrCanvas,day,stime,endtime))
		{
			return true;
		}
	}

	return false;
}
function validateTimings(timings)
{
	var arrTimes = [];
	for(var i=0; i<timings.length; i++)
	{
		var day=$('.days:contains("'+timings[i].day+'")').attr('id');
		var stime = timings[i].startTime;
		stime = stime.substring(0,2)+stime.substring(3,5);
		var endtime= timings[i].endTime;
		endtime = endtime.substring(0,2)+endtime.substring(3,5);
		arrTimes.push([day,stime,endtime]);
	}
	var len = arrTimes.length-1;
	for(var i=0; i<len; i++)
	{
		var valday = arrTimes[i][0];
		var valstime = arrTimes[i][1];
		var valetime = arrTimes[i][2];
		arrTimes.splice(i,1);
		len--;
		if(!searchSimilarSched(arrTimes,valday,valstime,valetime))
			return false;
	}
	return true;
}
/**IN TIMINGS: CHECKS OVERLAPPED TIMINGS IN THE LIST OF POPUP WHEN DAY IS SAME**/
function searchSimilarSched(myArray,day,stime,etime)
{

	for(var i = 0; i < myArray.length; i++) 
	{
		var dayGet=parseInt(myArray[i][0]);
		var stimeGet=parseInt(myArray[i][1]);
		var etimeGet=parseInt(myArray[i][2]);
		if(dayGet == parseInt(day) && ((stimeGet<=parseInt(stime) && parseInt(stime)<etimeGet) || (parseInt(stime)<stimeGet && parseInt(etime)>stimeGet) )) 
		{
			return false;
		}
	}

	return true;
}

function checkSelected(obj){
	checkSelectedComp(obj);
}
function popupWindow(id,sections)
{
	if($('div[id^="jBox"]').length>0)//means : i m clicking on refresh button
	{
		var currentJSON = JSON.parse($('#allbatchdetails').text());
		for (var comp=0; comp<sections.length; comp++)
		{
			var section = sections[comp].Section;
			var availability = parseInt(sections[comp].AvailableSlot);
			var groupOrcomp = $('td#section'+section).closest('tr').find('td').length -2 ;
			if($('td#section'+section).length>0)
			{
				var displayedSectionAv = parseInt($('td#section'+section).closest('tr').find('td:eq('+(groupOrcomp-1)+')').text());
				if(availability!=displayedSectionAv)
				{
					$('td#section'+section).closest('tr').find('td:eq('+(groupOrcomp-1)+')').text(availability);
					if(availability>displayedSectionAv && displayedSectionAv<=0)
					{
						var src = $('#openpng').text();
						$('td#section'+section).closest('tr').find('td:eq('+groupOrcomp+') img').attr('src',src);
						$('td#section'+section).closest('tr').find('td:eq(0) input').removeAttr('disabled');
					}
					else if(availability<displayedSectionAv && availability<=0)
					{
						var src = $('#closepng').text();
						$('td#section'+section).closest('tr').find('td:eq('+groupOrcomp+') img').attr('src',src);
						$('td#section'+section).closest('tr').find('td:eq(0) input').attr('disabled','disabled');
						$('td#section'+section).closest('tr').find('td:eq(0) input').removeAttr('checked');
					}
				}
			}

			$.map(currentJSON.courseSchedules.schedules, function(obj) {
				if(obj.CourseId == id)
				{
					for(var i=0; i<obj.details.length; i++)
					{
						if(obj.details[i].Section == section)
							obj.details[i].AvailableSlot = availability;
					}
				}});
		}

		$('#allbatchdetails').text(JSON.stringify(currentJSON));
		$('#refreshBtn').removeAttr('disabled');
		$('#refreshBtn').blur();
	}
	else
	{

		Schedules = sections;
		idCourse = id;
		coursename = $('#ViewSchedule_'+idCourse).closest('tr').find('td:eq(0)').text().trim();
		var isExisting = $('[id^="canvas_'+id+'"]').length==0?'':'disabled="disabled"';
		var buttonDiv = '<div class="saveSection"><table><tr>';
		buttonDiv += '<td><button type="submit" id="btn_submit" class="btnAP" onClick="save_sections(this);">OK</button></td>';
		buttonDiv += '<td><button type="submit" id="refreshBtn" class="btnAP" onClick="refreshValues(\''+ idCourse +'\');">Refresh</button></td>';
		buttonDiv += '<td><button type="submit" id="btn_cancel" class="btnAP" onClick="box_close(this);">Cancel</button></td>';
		buttonDiv += '</tr></table></div>';

		var table='';
		if(sections[0].method=='Group')
			table += '<div id="messageInfo">Select sections of every course component from a particular section group.';
		else
			table += '<div id="messageInfo">Select a section of every course component.';

		table += '<div id="iconsmsgInfo">';
		table += '<img style="margin:0;" src="'+$('#openpng').text()+'"/> Open';
		table += '<img style="margin:0;margin-left: 30px;" src="'+$('#closepng').text()+'"/> Closed';
		table += '</div></div>';

		for (var comp=0; comp<sections.length; comp++)
		{
			table += '<div>'+sections[comp].Component+'</div>';
			table += '<table style="width: 100%;" class="courses sections commonPopup"><thead><tr>';
			table += '<td>Select</td><td>Section</td>';
			table += sections[comp].method=='Group'?'<td>Component</td>':'';
			table += '<td>Days</td><td>Time</td><td style="width:200px">Building</td><td>Room</td><td>Faculty</td><td>Available</td><td>Status</td>';
			table += '<td>Batch</td>';
			table += '</tr></thead><tbody>';

			for(var j=0; j<sections[comp].details.length; j++)
			{
				//sort details by section name
				sections[comp].details.sort(alphanum);

				var arrayTimings = new Array();
				var arrDays = sections[comp].details[j].day.split(',');
				var arrSTime = sections[comp].details[j].startTime.split(',');
				var arrETime = sections[comp].details[j].endTime.split(',');
				for(var d=0; d<arrDays.length; d++)
				{
					if(arrayTimings.length==0)
					{
						arrayTimings.push([arrDays[d],
						                   arrSTime[d],
						                   arrETime[d]]);
					}
					else
					{
						var index = isTimeExists(arrSTime[d],arrETime[d],arrayTimings);
						if(index>=0)
						{
							arrayTimings[index][0]+=','+arrDays[d];
						}
						else
						{
							arrayTimings.push([arrDays[d],
							                   arrSTime[d],
							                   arrETime[d]]);
						}
					}
				}
				var tdDay='', tdTime='';
				for(var a=0; a<arrayTimings.length;a++)
				{
					tdDay+=sortDays(arrayTimings[a][0])+'<br/>';
					tdTime+=arrayTimings[a][1]+'-'+arrayTimings[a][2]+'<br/>';
				}
				var faculty = sections[comp].details[j].Faculty;
				if($('#selectFaculty').length>0)
					faculty = $('#selectFaculty option[id="'+faculty+'"]').text().trim();

				table +='<tr>';
				var isChecked = $('[id^="canvas_'+id+'_'+sections[comp].details[j].Section+'"]').length==0?isExisting:'checked';
				var isDisabled = isChecked == 'checked'?'onclick="checkSelected(this);"':'disabled="disabled"';
				if(sections[comp].details[j].AvailableSlot<=0)
					table +='<td><input type="checkbox"'+isDisabled+' '+isChecked+' id="'+sections[comp].details[j].Section+'"/></td>';
				else
					table +='<td><input type="checkbox" '+isChecked+' onclick="checkSelectedComp(this);" id="'+sections[comp].details[j].Section+'"/></td>';	

				table +='<td id="section'+sections[comp].details[j].Section+'">'+sections[comp].details[j].SectionName+'</td>';
				table += sections[comp].method=='Group'?'<td>'+sections[comp].details[j].Component+'</td>':'';
				table +='<td>'+tdDay+'</td>';
				table +='<td>'+tdTime+'</td>';
				table +='<td>'+sections[comp].details[j].BuildingName+'</td>';
				table +='<td>'+sections[comp].details[j].RoomName+'</td>';
				table +='<td>'+faculty+'</td>';
				table +='<td>'+sections[comp].details[j].AvailableSlot+'</td>';
				if(sections[comp].details[j].AvailableSlot<=0)
					table +='<td><img style="margin:0;" src="'+$('#closepng').text()+'"/></td>';
				else
					table +='<td><img style="margin:0;" src="'+$('#openpng').text()+'"/></td>';
				table += '<td>'+sections[comp].details[j].Batch+'</td>';
				table +='</tr>';

			}
			table += '</tbody></table>';

		}

		table += buttonDiv;	
		var options = {
				width:1000,
				content: table,
				title:'Select Sections for '+coursename,
				draggable:'title',
				blockScroll:false,
				onCloseComplete : function()
				{
					box_close();
				}
		};

		var M=new jBox('Modal',options);

		M.open();
		$('#refreshBtn').css('background-color',colorBg);
		$('#btn_cancel').css('background-color',colorBg);
		$('#btn_submit').css('background-color',colorBg);
//		$("#btn_submit").prop("disabled",true);
	}

}
function jbox_close()
{

	var obj=arguments[0];
	if($('div[id^="jBox2"]').length!=0)//if 2 jboxes: remove only secnd one else remove all including overlay
		$(obj).closest('div[id^="jBox"]').remove();
	else
		$('div[id^="jBox"]').remove();


}

function box_close()
{
	$('div[id^="jBox"]').remove();

}


function checkBatch()
{
	if(isEmpty($("#batchList").val()))
	{
		messagePopup('Please select a batch to proceed.');
		return false;
	}

	return true;
}





var searchByDepartment = function(model , department)
{
	if(arguments.length == 2)
	{
		model.get('courseSchedules').courses.each(function(course){
			if(course.Department != department)
			{
				$('#ViewSchedule_'+course.CourseId).closest('tr').css('display','none');
			}
		});
	}
	else
	{
		$('[id^="othercoursesTab"][id!="othercoursesTab'+department+'"]').css('display','none');
	}

};

var searchBySubject = function(model , subject)
{
	if(arguments.length == 2)
	{
		model.get('courseSchedules').courses.each(function(course){
			if(course.Subject != subject)
			{
				$('#ViewSchedule_'+course.CourseId).closest('tr').css('display','none');
			}
		});
	}
	else
	{
		model.get('courseSchedules').othercourses.each(function(department){
			department.details.each(function(course){
				if(course.Subject != subject)
				{
					$('#ViewSchedule_'+course.CourseId).closest('tr').css('display','none');
				}
			});
		});
	}
};

var searchByCredit = function(model, minCredit, maxCredit){
	minCredit = isEmpty(minCredit)?0:parseInt(minCredit);
	maxCredit = isEmpty(maxCredit)?10:parseInt(maxCredit);
	if(arguments.length == 3)
	{
		model.get('courseSchedules').courses.each(function(course){
			if(parseInt(course.Credits) < minCredit || parseInt(course.Credits) > maxCredit)
			{
				$('#ViewSchedule_'+course.CourseId).closest('tr').css('display','none');
			}
		});
	}
	else
	{
		model.get('courseSchedules').othercourses.each(function(department){
			department.details.each(function(course){
				if(parseInt(course.Credits) < minCredit || parseInt(course.Credits) > maxCredit)
				{
					$('#ViewSchedule_'+course.CourseId).closest('tr').css('display','none');
				}
			});
		});
	}
};



var searchSchedule = function (model, criteria, myTable)
{
	model.get('courseSchedules').schedules.each(function(course){
		if($('#'+myTable).find($('#ViewSchedule_'+course.CourseId)).length>0)
		{
			var scheduleFound = false;
			course.details.each(function(detail){
				//get faculty
				var FacultyFound=isEmpty(criteria.faculty)?true:false, 
						BuildingFound=isEmpty(criteria.building)?true:false, 
								AvailabilityFound=criteria.availability.startTime?false:true, 
										DaysFound=criteria.days.length==0?true:false;

				if(!FacultyFound && parseInt(detail.Faculty) == parseInt(criteria.faculty))
					FacultyFound = true;
				if(!BuildingFound && parseInt(detail.Building) == parseInt(criteria.building))
					BuildingFound = true;
				if(!AvailabilityFound)
				{
					var startTime = isEmpty(criteria.availability.startTime)?"0":parseInt(timeToString(criteria.availability.startTime));
					var endTime = isEmpty(criteria.availability.endTime)?"2500":(criteria.availability.endTime=="0000"?"2400":parseInt(timeToString(criteria.availability.endTime)));
					var arrST = detail.startTime.split(',');
					var arrET = detail.endTime.split(',');
					var etimeFound = true, stimeFound = true;
					for(var i=0; i<arrST.length; i++)
					{
						if(startTime>parseInt(timeToString(arrST[i])))
						{
							stimeFound = false;
							i=arrST.length;
						}

					}
					for(var i=0; i<arrET.length; i++)
					{
						if(endTime<parseInt(timeToString(arrET[i])))
						{
							etimeFound = false;
							i=arrET.length;
						}

					}
					if(etimeFound && stimeFound)
						AvailabilityFound = true;
				}

				if(!DaysFound)
				{
					var arrD = detail.day.split(',');
					for(var i=0; i<arrD.length; i++)
						arrD[i] = $('.days:contains("'+arrD[i]+'")').attr('id');
					if(_.intersection(criteria.days, arrD).length === criteria.days.length)
					{
						DaysFound = true;
					}
				}

				if(FacultyFound && BuildingFound && AvailabilityFound && DaysFound)
					scheduleFound = true;
			});

			if(!scheduleFound)
			{
				$('#ViewSchedule_'+course.CourseId).closest('tr').css('display','none');
			}
		}

	});
};



function getIndexCourseSectionGroup (model , idCourse){

	var Index = 0;
	for(var index=0; index<model.courseSchedules.listSectionGroups.length; index++)
	{
		var sectionGroup = model.courseSchedules.listSectionGroups[index];
		if(parseInt(sectionGroup.course) == idCourse)
		{
			Index = index;
		}

	}

	return Index;
}

var getScheduleSection = function(listSection,section){

	var sectionSchedule;	
	for(var i = 0; i<listSection.length; i++)
	{
		var group = listSection[i];
		if(parseInt(group.Section) == section)
		{
			sectionSchedule = group;
		}

	}	
	return sectionSchedule;
};

function getGroupName(model, group)
{
	var groupname='';		
	for(var i = 0; i<model.courseSchedules.listGroups.length; i++)
	{
		var g = model.courseSchedules.listGroups[i];
		if(parseInt(g.id) == group)
		{
			groupname = g.name;
		}

	}	
	return groupname;
};

var timeToString = function(time)
{
	return ''+time.split(':')[0]+time.split(':')[1];
};

var rainbow =  function () {
	function randomChannel(brightness){
		var r = 255-brightness;
		var n = 0|((Math.random() * r) + brightness);
		var s = n.toString(16);
		return (s.length==1) ? '0'+s : s;
	}
	return '#' + randomChannel(150) + randomChannel(150) + randomChannel(150);

};	



$.expr[':'].contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase()
	.indexOf(m[3].toUpperCase()) >= 0;
};


/////////////////////////////////////////////////////////////////////////////////////////////////////
function validateItems()
{
	var listCoursesToValid = [];
	$('[id^="canvas_"]').each(function(){
		var id=$( this ).attr('id');
		id = id.split('_');
		if(listCoursesToValid.indexOf(id[1])<0)
			listCoursesToValid.push(id[1]);
	});
	if(listCoursesToValid.length <1)
		messagePopup('Select courses to validate.');
	else
	{

		var enrollmentType = $('#enrtype').text();
		var isPreEnroll = enrollmentType.indexOf('preenroll')>= 0? true:false;
		var preReq = $('#notallowed').text().trim();
		var simult = $('#simult').text().trim();
		var holdFound = false;
		if(simult && simult!="undefined" && simult!="null")
		{
			simult = JSON.parse(simult);
		}
		if(preReq && preReq!="undefined" && enrollmentType.indexOf('cross') < 0 && !$('#adjenrtype') )// which means some course are not allowed to be taken because not meeting pre-req
		{
			var table='';
			preReq = JSON.parse($('#notallowed').text());
			var buttonDiv = '<div class="saveSection" style="text-align: center;margin-top:20px">';
			buttonDiv += '<button class="btnAP" onClick="box_close(this);" style="background: rgb(96, 119, 153) none repeat scroll 0% 0%;">Close</button>';
			buttonDiv += '</div>';



			table += '<table class="courses report"><caption>Course Holds</caption><thead><tr>';
			table += '<td>Course</td><td>Description</td><td>Status</td><td>Comment</td></tr></thead>';
			table += '<tbody>';


			for(var i=0; i<preReq.length; i++)
			{
				var course = $('[id="'+preReq[i].course+'"]').length? $('[id="'+preReq[i].course+'"]'): 
					($('[id="ViewSchedule_'+preReq[i].course+'"]').length? $('[id="ViewSchedule_'+preReq[i].course+'"]') : null);

				if(course && listCoursesToValid.indexOf(preReq[i].course) >= 0)
				{
					var allow = false;
					if(simult && simult!="undefined" && simult!="null")
					{
						for(var j = 0; j<simult.length; j++)
						{
							if(simult[j].course == preReq[i].course && listCoursesToValid.indexOf(simult[j].simult) >= 0)
								allow = true;
						}
					}
					if(!allow)
					{
						holdFound = true;
						var name= course.parent().find('td:eq(0)').text();
						var description = course.parent().find('td:eq(1)').text();
						var src = $('#errorpng').text();
						table += '<tr>';
						table += '<td>'+name+'</td>';
						table += '<td>'+description+'</td>';
						table += '<td><img style="margin:0;" src="'+src+'"/></td>';
						if(preReq[i].action)
						{
							var ul = '<ul>';
							var isBatch = $('#batchList').length>0?true:false;
							var comment = preReq[i].action;
							if(isPreEnroll && comment.indexOf('You cannot enroll for the course without enrolling')>=0)
								comment = comment.replace('You cannot enroll','You cannot pre-enroll');
							if(enrollmentType.indexOf('freecourse')>=0 && comment.indexOf('You must add the course prerequisite')<0)
								comment+= ' Remove this course from your schedule.';

							if(!isBatch)
								ul+='<li>'+comment+'</li>';
							else if(comment.indexOf('Use the Free Course Selection')>=0)
							{
								comment = isPreEnroll?comment.replace('enrollment method','pre-enrollment method'):comment;
								ul+='<li style="color:rgb(217, 65, 65);">'+comment+'</li>';
							}


							ul+='</ul>';
							table += '<td>'+ul+'</td>';
						}
						else
							table += '<td></td>';

						table += '</tr>';
					}


				}


			}
			table += '</tbody></table>';
			if(holdFound)
			{
				table += buttonDiv;
				var options = {
						width:800,
						content: table,
						title:'Status',
						draggable:'title',
						blockScroll:false,
						onCloseComplete : function()
						{
							box_close();
						}
				};

				var M=new jBox('Modal',options);
				M.open();

			}
			else
				submitItems(listCoursesToValid);
		}
		else //redirects to checkout page
		{
			submitItems(listCoursesToValid);

		}

	}
}

function viewSections(e)
{
	var details = [], array = [];
	var name = e;
	var id = name.id.split('_')[1];
	var model = JSON.parse($('#allbatchdetails').text());
	var schedules = model.courseSchedules.schedules;
	var sectionGroups =  model.courseSchedules.listSectionGroups;
	for(var s = 0; s < schedules.length; s++)
	{
		var schedule = schedules[s];
		if(schedule.CourseId == id)
		{
			var indexCourseGroup = getIndexCourseSectionGroup(model , id);
			var listSection = schedule.details;
//			alert('list of sections'+JSON.parse(schedule.details));

			var method = sectionGroups[indexCourseGroup].hasGroup=='T'?'Group':'Component';
			if(sectionGroups[indexCourseGroup].hasGroup=='T')
			{
				//sort that line of sections groups by group
				var sectionGroupsArr = sectionGroups[indexCourseGroup].details;
				sectionGroupsArr.sort(function(a,b){
					return parseInt(a.group)-parseInt(b.group);
				});

				for(var i=0; i<sectionGroupsArr.length; i++)
				{
					var group = sectionGroupsArr[i].group;
					var groupName = getGroupName(model, group);
					var scheduleSection = getScheduleSection(listSection,sectionGroupsArr[i].section);
					scheduleSection.Faculty = scheduleSection.Faculty?scheduleSection.Faculty:'';

					if(details.length == 0)
					{

						array.push(scheduleSection);
						details.push(
								{
									Component : groupName, Group:group, method: method, details : array
								});
					}
					else if(details[details.length-1].Group == group)
					{
						array.push(scheduleSection);
						details[details.length-1].details = array;
					}
					else
					{
						array = [];
						array.push(scheduleSection);
						details.push(
								{
									Component : groupName, Group:group, method: method, details : array
								});
					}
				}
			}
			else
			{
				//sort that line of sections groups by group
				listSection.sort(function(a,b){
					return (a.Component < b.Component) ? -1 : (a.Component > b.Component) ? 1 : 0;
				});

				for(var i=0; i<listSection.length; i++)
				{
					var component = listSection[i].Component;
					listSection[i].Faculty = listSection[i].Faculty?listSection[i].Faculty:'';
					if(details.length == 0)
					{
						array.push(listSection[i]);
						details.push(
								{
									Component : component , method: method, details : array
								});
					}
					else if(details[details.length-1].Component == component)
					{
						array.push(listSection[i]);
						details[details.length-1].details = array;
					}
					else
					{
						array = [];
						array.push(listSection[i]);
						details.push(
								{
									Component : component , method: method, details : array
								});
					}
				}

			}

		}			
	}

	popupWindow(id,details);
}

function loadSchedule(sections,model)
{

	var totalCredits = Number(model.totalCredits);
	var totalAmount = Number($('#selectedAmnt').text().replace(',',''));
	var courseSchedules = model.courseSchedules;
	var listCredits = model.courseSchedules.listCourseCredits;

	for(var i = 0; i<sections.length; i++ )
	{
		var section = sections[i];
		if($('#ViewSchedule_'+section.course).length>0)
		{
			var toSend={};
			var courseSections = section.sections.split(',');
			toSend.courseName = $('#ViewSchedule_'+section.course).closest('tr').find('td:eq(0)').text();
			toSend.course = section.course;
			toSend.timings = [];
			for(var s=0; s<courseSchedules.schedules.length; s++)
			{
				var schedule = courseSchedules.schedules[s];
				if(schedule.CourseId == section.course)
				{
					var section_found = false;
					for(var j = 0; j<schedule.details.length; j++)
					{
						var sec = schedule.details[j];
						if(courseSections.indexOf(sec.Section)>=0)
						{
							section_found = true;
							var days = sec.day.split(',');
							var start=sec.startTime.split(',');
							var end=sec.endTime.split(',');
							for(var d=0; d<days.length; d++)
							{
								toSend.timings.push({
									classroom:sec.RoomName,
									component:sec.Component,
									day:days[d],
									startTime:start[d],
									endTime:end[d],
									faculty:sec.Faculty,
									section: sec.Section,
									sectionName:sec.SectionName
								});
							}
						}
					}

					s = courseSchedules.schedules.length;
					if(section_found)
					{
						addToCalendar(toSend);
						var course_credits = $.map(listCredits, function(obj) {if(obj.id == section.course)return obj.credit;});
						course_credits = course_credits?course_credits[0]:0;
						totalCredits += Number(course_credits);
						totalAmount += Number($('#ViewSchedule_'+section.course).closest('tr').find('td:eq(3)').text().replace(',',''));
						$('#ViewSchedule_'+section.course).closest('tr').css('background-color','#fefeee');
					}


				}



			}
		}
	}

	model.totalCredits = Number(totalCredits);
	model.totalAmount = Number(totalAmount);
	$('#allbatchdetails').text(JSON.stringify(model));
	$('#validate').removeAttr('disabled');
	$('#validate').css('background-color', colorBg);
	$('#selectedCrd').text(totalCredits);
	$('#selectedAmnt').text(toCurrencyFormat(totalAmount));
}

function viewCourses(backbatchid)
{
	$('[id^="canvas_"]').remove();
	var batch;
	batch = $('#batchList').val();

	if(batch==''){
		batch=backbatchid;
		$('#batchList').val(backbatchid);
	}

	var courseCol = $('#courses > thead > tr:eq(0) > td').length;
	$('#courses > tbody').html('<tr> <td colspan="'+ courseCol +'"> </td> </tr>');
	$('#electives > tbody').html('<tr> <td colspan="'+ courseCol +'"> </td> </tr>');
	$('#selectedAmnt').text('0');
	$('#selectedCrd').text('0');
	$('#availSlots').text('0');
	$('#validate').attr('disabled','disabled');
	if(batch)
	{
		$('#validate').removeAttr('disabled');
		$('#validate').css('background-color', colorBg);
		var allDATA = JSON.parse($('#allstudentdetails').text());
		var acadYr=$('td[id^="acadYr"]').attr('id').split('_')[1];
		var acadTerm=$('td[id^="acadTerm"]').attr('id').split('_')[1];
		var progYr=$('td[id^="progYear"]').attr('id').split('_')[1];
		var prog=$('td[id^="prog"]').attr('id').split('_')[1];
		var URL = nlapiResolveURL('SUITELET', 'customscript_ederp_st_enr_selectbatch', 'customdeploy_ederp_st_enr_selectbatch');
		URL += '&action=getcourses&acadYr='+acadYr+'&acadTerm='+acadTerm+'&progYr='+progYr+'&prog='+prog;
		URL += '&batch='+batch+'&campus='+allDATA.campus+'&isInternational='+allDATA.isinternational;

		$('body').css('cursor','wait');
		$.ajax({
			url: URL,
			type: 'POST'
		}).complete(function( data ) {
			if(data)
			{
				var model= JSON.parse(data.responseText) ;
				var addedCourses = [];
				$('#allbatchdetails').text(data.responseText);
				$('#selectedAmnt').text(model.totalAmount);
				$('#selectedCrd').text(model.totalCredits);
				$('#availSlots').text(model.availableSlot);
				if(model.listCourses.length>0)
					$('#courses > tbody').empty();
				if(model.listElectives.length>0)
					$('#electives > tbody').empty();

				var feesPerTerm = courseCol == 3? 'T' : 'F';
				for(var l = 0; l<model.listCourses.length; l++)
				{
					var course = model.listCourses[l];
					var row = '<tr>';
					row += '<td id="'+course.courseID+'">'+course.courseName+'</td>';
					row += '<td>'+course.courseDescription+'</td>';
					row += '<td>'+course.courseCredit+'</td>';
					if(feesPerTerm == 'F')
						row += '<td>'+course.courseRateFormatted+'</td>';
					$('#courses > tbody').append(row);
				}

				for(var l = 0; l<model.listElectives.length; l++)
				{
					var course = model.listElectives[l];
					var row = '<tr>';
					row += '<td id="ViewSchedule_'+course.courseID+'" onclick="viewSections(this);">'+course.courseName+'</td>';
					row += '<td>'+course.courseDescription+'</td>';
					row += '<td>'+course.courseCredit+'</td>';
					if(feesPerTerm == 'F')
						row += '<td>'+course.courseRateFormatted+'</td>';
					$('#electives > tbody').append(row);
				}

				var temp = [];
				if(model.listTimings.length > 0)
				{
					var current_idCrse = model.listTimings[0].course;
					var current_nameCrse = model.listTimings[0].courseName;
					var lenTimings = model.listTimings.length;
					for(var index = 0; index<model.listTimings.length; index++)
					{
						var courseTimings =  model.listTimings[index];
						if(current_idCrse!=courseTimings.course)
						{
							addedCourses.push(current_idCrse);
							addToCalendar(
									{
										courseName : current_nameCrse,
										course : current_idCrse,
										timings : temp
									});
							temp=[];
							current_idCrse=courseTimings.course;
							current_nameCrse = courseTimings.courseName;
						}
						if(current_idCrse==courseTimings.course && index == lenTimings-1 )
						{
							temp.push({
								day: courseTimings.day, 
								startTime: courseTimings.startTime, 
								endTime: courseTimings.endTime, 
								component: courseTimings.courseComponent,
								classroom : courseTimings.classroom,
								faculty : courseTimings.faculty,
								section : courseTimings.section});
							addedCourses.push(current_idCrse);
							addToCalendar(
									{
										courseName : current_nameCrse,
										course : current_idCrse,
										timings : temp
									}
							);
						}
						temp.push({
							day: courseTimings.day, 
							startTime: courseTimings.startTime, 
							endTime: courseTimings.endTime, 
							component: courseTimings.courseComponent,
							classroom : courseTimings.classroom,
							faculty : courseTimings.faculty,
							section : courseTimings.section
						});
					}
				}


				// check if existing is also there
				$('body').css('cursor','initial');

				var details = JSON.parse($('#allstudentdetails').text());
				var existingSections = details.exisitngS;
				loadSchedule(existingSections,model);
			}
		});
	}
}

function addToCalendar(courseTimings,backCrossdata)
{
	if(backCrossdata)
	{
		var model = JSON.parse($('#allbatchdetails').text());
		var listCredits = model.courseSchedules.listCourseCredits;
		var current_amount =0, current_credits=0;
		for(var rrrr=0;rrrr<backCrossdata.length;rrrr++)
		{

			var color;

			var course = backCrossdata[rrrr].courseName;
			var idcourse = backCrossdata[rrrr].course;
			var arrCSTime = backCrossdata[rrrr].timings;


			if($('[id^="canvas_'+idcourse+'_"]').length!=0)
			{
				color=$('[id^="canvas_'+idcourse+'_"]').css('backgroundColor');
				$('[id^="canvas_'+idcourse+'_"]').remove();
			}
			else
			{
				color=rainbow();
				$('#ViewSchedule_'+idcourse).closest('tr').css('background-color','#fefeee');

				var course_credits = $.map(listCredits, function(obj) {if(obj.id == idcourse)return obj.credit;});
				course_credits = course_credits?course_credits[0]:0;
				current_credits = parseInt(current_credits)+parseInt(course_credits);
				var course_amount = $('#ViewSchedule_'+idcourse).closest('tr').find('td:eq(3)').text().replace(',','');
				current_amount = parseFloat(current_amount)+parseFloat(course_amount);
			}


			//loop depending on days and timings
			for(var arrCS = 0; arrCS<arrCSTime.length; arrCS++)
			{
				var Time = arrCSTime[arrCS];
				var classroom = Time.classroom;
				var component = Time.component;
				var section = Time.section;
				var faculty = Time.faculty;
				faculty = faculty? faculty : '';
				$("#calendar tr td.days").each(function () {
					var day=$(this).text().toLowerCase().trim();
					if(day == Time.day.toLowerCase())
					{
						var startTime=Time.startTime;
						var endTime=Time.endTime;
						var idName="_"+section+"_"+day+"_"+startTime.split(':')[0]+startTime.split(':')[1]+"_"+endTime.split(':')[0]+endTime.split(':')[1];
						var index=0;
						$("#calendar tr td.timings").each(function () {

							var time=startTime.split(':')[0]+":00";
							if($(this).text().trim()==time)
								index=$(this).parent().index();				 
						});
						var startingMin=parseInt(startTime.split(':')[1]);
						startTime = new Date(0, 0, 0, startTime.split(':')[0], startTime.split(':')[1], 0, 0);
						endTime = new Date(0, 0, 0, endTime.split(':')[0], endTime.split(':')[1], 0, 0);
						var diff = endTime - startTime;

						var diffSeconds = diff/1000;
						var coeffH=diffSeconds/3600;
						var coeffT=0.5;

						if(startingMin==30)
							coeffT=1;
						if(startingMin==15)
							coeffT=0.75;
						if(startingMin==45)
							coeffT=1.25;	

						index++;
						var cur_index = $(this).index()+1;
						var c=$("#calendar").find("tbody > tr:nth-child("+index+") > td:nth-child("+cur_index+")");
						var d=document.createElement("canvas");
						d.width = c.innerWidth()+2;
						d.height = c.innerHeight()*coeffH + 2 +parseInt(coeffH);
						d.id="canvas_"+idcourse+idName;
						d.style.left = (c.offset().left)+"px";
						d.style.top = (c.offset().top + coeffT*c.innerHeight())+"px";
						d.style.position = "absolute";

						$('body').append(d);
						var ctx=d.getContext('2d');
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						ctx.fillStyle = '#00005C';
						ctx.textBaseline = 'top';
						ctx.font = '12px Open Sans';

						ctx.fillText(course, 2, 0.5);
						ctx.fillText(component, 2, 12);
						ctx.fillText(faculty, 2, 23);
						ctx.fillText(classroom, 2, 34);
						d.style.background = color;

					}
				});
			}
		}
		$('#selectedCrd').text(current_credits);
		$('#selectedAmnt').text(toCurrencyFormat(current_amount));
		model.totalCredits = parseInt(current_credits);
		model.totalAmount = parseInt(current_amount);
		$('#allbatchdetails').text(JSON.stringify(model));
		$('#validate').removeAttr('disabled');
	}
	else
	{
		var color;
		var totalJson=[];var temp=[];


		var tt=$('#all_dataofJson').text();
		if(tt !="" && tt != undefined && tt != null && tt!= "null" &&  tt!= 'undefined' )
		{
			temp=JSON.parse($('#all_dataofJson').text());
			for(var o=0;o<temp.length;o++)
			{
				totalJson.push(temp[o]);
				if(o==temp.length-1)
				{
					totalJson.push(courseTimings);
				}			   
			}


			$('#all_dataofJson').text(JSON.stringify(totalJson));
		}
		else
		{

			if(courseTimings)
			{
				totalJson.push(courseTimings);

				$('#all_dataofJson').text(JSON.stringify(totalJson));
			}
		}


		console.log("course = "+JSON.stringify(totalJson));

		var course = courseTimings.courseName;
		var idcourse = courseTimings.course;
		var arrCSTime = courseTimings.timings;

		if($('[id^="canvas_'+idcourse+'_"]').length!=0)
		{
			color=$('[id^="canvas_'+idcourse+'_"]').css('backgroundColor');
			$('[id^="canvas_'+idcourse+'_"]').remove();
		}
		else
			color=rainbow();

		//loop depending on days and timings
		for(var arrCS = 0; arrCS<arrCSTime.length; arrCS++)
		{
			var Time = arrCSTime[arrCS];
			var classroom = Time.classroom;
			var component = Time.component;
			var section = Time.section;
			var faculty = Time.faculty;
			faculty = faculty? faculty : '';
			$("#calendar tr td.days").each(function () {
				var day=$(this).text().toLowerCase().trim();
				if(day == Time.day.toLowerCase())
				{
					var startTime=Time.startTime;
					var endTime=Time.endTime;
					var idName="_"+section+"_"+day+"_"+startTime.split(':')[0]+startTime.split(':')[1]+"_"+endTime.split(':')[0]+endTime.split(':')[1];
					var index=0;
					$("#calendar tr td.timings").each(function () {

						var time=startTime.split(':')[0]+":00";
						if($(this).text().trim()==time)
							index=$(this).parent().index();				 
					});
					var startingMin=parseInt(startTime.split(':')[1]);
					startTime = new Date(0, 0, 0, startTime.split(':')[0], startTime.split(':')[1], 0, 0);
					endTime = new Date(0, 0, 0, endTime.split(':')[0], endTime.split(':')[1], 0, 0);
					var diff = endTime - startTime;

					var diffSeconds = diff/1000;
					var coeffH=diffSeconds/3600;
					var coeffT=0.5;

					if(startingMin==30)
						coeffT=1;
					if(startingMin==15)
						coeffT=0.75;
					if(startingMin==45)
						coeffT=1.25;	

					index++;
					var cur_index = $(this).index()+1;
					var c=$("#calendar").find("tbody > tr:nth-child("+index+") > td:nth-child("+cur_index+")");
					var d=document.createElement("canvas");
					d.width = c.innerWidth()+2;
					d.height = c.innerHeight()*coeffH + 2 +parseInt(coeffH);
					d.id="canvas_"+idcourse+idName;
					d.style.left = (c.offset().left)+"px";
					d.style.top = (c.offset().top + coeffT*c.innerHeight())+"px";
					d.style.position = "absolute";

					$('body').append(d);
					var ctx=d.getContext('2d');
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.fillStyle = '#00005C';
					ctx.textBaseline = 'top';
					ctx.font = '12px Open Sans';

					ctx.fillText(course, 2, 0.5);
					ctx.fillText(component, 2, 12);
					ctx.fillText(faculty, 2, 23);
					ctx.fillText(classroom, 2, 34);
					d.style.background = color;

				}
			});
		}
	}

}
