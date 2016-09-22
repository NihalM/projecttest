/*
 **************************************************************************************  
 ** Copyright (c) 1998-2012 Softype, Inc.                                 
 ** Morvi House, 30 Goa Street, Ballard Estate, Mumbai 400 001, India
 ** All Rights Reserved.                                                    
 **                                                                         
 ** This software is the confidential and proprietary information of          
 ** Softype, Inc. ("Confidential Information"). You shall not               
 ** disclose such Confidential Information and shall use it only in          
 ** accordance with the terms of the license agreement you entered into    
 ** with Softype.                  
 ** Description:  Suitelet to increase Amount expensed and decrease budgeted amount
 **                       
 ** @author:  Neha
 ** @dated:   4/03/2013
 ** @version: Revised version
 **************************************************************************************
 */

function sl_vendorbill(request, response)
{
	var stloggerTitle = 'Vendor Bill';

	try 
	{
		nlapiLogExecution('DEBUG', stloggerTitle, '-------------- Start Execution ----------------' + 'Request');
		var intCount = request.getLineItemCount('custpage_pay_sublist');

		var parm_vendor = request.getParameter('custpage_vendor');
		nlapiLogExecution('Debug', stloggerTitle, 'parm_vendor :' + parm_vendor);

		//START CREATING THE FORM HERE
		var form = nlapiCreateForm('Approve Bills', false);
		form.setScript('customscript_cs_vendorbill');

		//ADD TAB TO THE FORM
		var rptTab = form.addTab('custpage_report_tab', 'Vendor Bill');

		// CREATING A FILTER TAB AND INCLUDING FIELD VENDOR IN IT 
		var fldGrpMain = form.addFieldGroup('custpage_main_filters', 'Set Filters', 'custpage_report_tab');
		var stvendor = form.addField('custpage_vendor', 'select', 'Vendor', 'vendor', 'custpage_main_filters');


		// CREATING A STATISTIC TAB 
		var fldGrpstat = form.addFieldGroup('custpage_main_statistic', 'Statistics', 'custpage_report_tab');

		// FIELDS INSIDE STATISTIC TAB (RECORDS SELECTED, UPDATE STATUS AND RECORDS UPDATED)
		var CA_RecSelect = form.addField('custpage_recordselect','text','Records selected  : ',null,'custpage_main_statistic').setDisplayType('inline');
		var CA_UpdStatus = form.addField('custpage_recprocess','text','Update Status  : ',null,'custpage_main_statistic').setDisplayType('inline');
		var CA_RecUpdated = form.addField('custpage_recupdated','text','Records Updated  : ',null,'custpage_main_statistic').setDisplayType('inline');
		var stamount = form.addField('custpage_amount', 'text', 'Amount  : ', '', 'custpage_main_statistic');		
		stamount.setDisplayType('inline');

		var fldGrpDetails = form.addFieldGroup('custpage_details', 'Details', 'custpage_report_tab');



		// CREATE A BUTTON NAMED FILTER
		var butn = form.addSubmitButton('Filter');

		// CREATE A BUTTON NAMED APPROVE
		form.addButton('_approve', 'Approve', 'ApproveVendorBills()');

		// CREATE A BUTTON NAMED REJECT
		form.addButton('_reject', 'Reject', 'RejectVendorBills()');

		// CREATE A TAB NAMED AS REPORT IN SUBLIST
		var stPlanlist = form.addSubList('custpage_pay_sublist', 'list', 'Report', 'custpage_report_tab');

		//stPlanlist.addMarkAllButtons();	

		// ADD THE "MARKALL AND UNMARK ALL BUTTONS"
		var objmarkall = stPlanlist.addButton('custpage_mark_all', 'Mark All', 'markall()');
		var objunmarkall = stPlanlist.addButton('custpage_unmark_all', 'UnMark All', 'unmarkall()');


		//SETTING VALUES IN FIELD
		stPlanlist.addField('custpage_select', 'checkbox', 'Select').setDefaultValue('F'); //SET DEFAULT VALUE AS FALSE
		stPlanlist.addField("custpage_recordview", "url", "View").setLinkText("View"); 
		stPlanlist.addField('custpage_date', 'text', 'Date');                                //Date
		stPlanlist.addField('custpage_id', 'text', 'Internal id').setDisplayType('hidden');
		stPlanlist.addField('custpage_apno', 'text', 'AP No.')
		stPlanlist.addField('custpage_invoice', 'text', 'Invoice no.');                          //Invoice No
		stPlanlist.addField('custpage_vendor', 'text', 'Vendor');                            //Vendor
		stPlanlist.addField('custpage_memo', 'text', 'Memo');                                //Memo
		stPlanlist.addField('custpage_account', 'text', 'Account').setDisplayType('hidden');  //Account
		stPlanlist.addField('custpage_amt', 'text', 'Net Amt.');                          //Amount
		stPlanlist.addField('custpage_currency', 'text', 'Currency').setDisplayType('hidden'); //Currency		
		//stPlanlist.addField('custpage_status', 'text', 'Status');
		stPlanlist.addField('custpage_update', 'checkbox', 'Updated').setDisplayType('disabled');
		stPlanlist.addField('custpage_status', 'text', 'Status').setDisplayType('hidden');
		

		var filters = new Array();		        				
		filters[0] = new nlobjSearchFilter('mainline', null, 'is', 'T');

		if(parm_vendor == null || parm_vendor == '')
		{
			//do nothing
		}
		else
		{
			filters.push(new nlobjSearchFilter('entity', null, 'is', parm_vendor));
			nlapiLogExecution('Debug', stloggerTitle, 'Inside  Vendor');
		}		 

		if (parm_vendor != null || parm_vendor != '')
		{
			stvendor.setDefaultValue(parm_vendor);
		}

		// SEARCHING FOR VENDOR BILL RECORD FOR SAVE SEARCH NAMED VendorBill(Do not Delete)
		var venbill_search = nlapiSearchRecord('vendorbill', 'customsearch_vendorbill_pendingapproval', filters, null);
		var total_rec = numRows(venbill_search);
		nlapiLogExecution('Debug', stloggerTitle, 'Expense Record Length :' + total_rec);

		var r=1;
		for (var i = 0; i < total_rec; i++) 
		{
			var columns = venbill_search[i].getAllColumns();	
			var venbill_id = venbill_search[i].getId(); 			

			var column = columns[0];				
			var date = venbill_search[i].getValue(column);				
			nlapiLogExecution('Debug', stloggerTitle, 'date :' + date);

			var column = columns[1];			
			var InvoiceNo = venbill_search[i].getValue(column);			

			var column = columns[2];			
			var Vendor = venbill_search[i].getText(column);		

			var column = columns[3];
			var memo = venbill_search[i].getValue(column);

			var column = columns[4];
			var Amount = venbill_search[i].getValue(column);

			var column = columns[5];
			var Currency = venbill_search[i].getValue(column);

			var column = columns[6];
			var Account = venbill_search[i].getText(column);

			var column = columns[7];
			var Status = venbill_search[i].getText(column);

			var column = columns[8];
			var Ap_no = venbill_search[i].getValue(column);

			nlapiLogExecution('Debug', stloggerTitle, 'columns[8] :' + Ap_no);

			var recordView = ('https://system.netsuite.com/app/accounting/transactions/vendbill.nl?id='+venbill_id);


			
			stPlanlist.setLineItemValue('custpage_date', r, date);				
			stPlanlist.setLineItemValue('custpage_invoice', r, InvoiceNo);					
			stPlanlist.setLineItemValue('custpage_vendor', r, Vendor);								
			stPlanlist.setLineItemValue('custpage_memo', r, memo);
			stPlanlist.setLineItemValue('custpage_amt', r, Amount);
			stPlanlist.setLineItemValue('custpage_currency', r, Currency);
			stPlanlist.setLineItemValue('custpage_id', r, venbill_id);
			stPlanlist.setLineItemValue('custpage_account', r, Account);
			stPlanlist.setLineItemValue('custpage_status', r, Status);
			stPlanlist.setLineItemValue('custpage_apno', r, Ap_no);
			stPlanlist.setLineItemValue('custpage_recordview', r, recordView);
			r++;					

		}

		var CaseUpdated=0;
		var totalPross = CaseUpdated +'/'+ CaseUpdated ;

		CA_RecUpdated.setDefaultValue(totalPross);

		CA_RecSelect.setDefaultValue(parseFloat(CaseUpdated).toFixed(0));

		response.writePage(form);

		nlapiLogExecution('DEBUG', stloggerTitle, '-------------- End Execution ----------------' + 'Request');

	}
	catch(error)
	{
		if (error.getDetails != undefined)
		{
			nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
			throw error;
		}
		else 
		{
			nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
			throw nlapiCreateError('99999', error.toString());
		}
	}	
}

function numRows(obj)
{
	var ctr = 0;
	for (var k in obj) 
	{
		if (obj.hasOwnProperty(k)) 
		{
			ctr++;
		}
	}
	return ctr;
}
