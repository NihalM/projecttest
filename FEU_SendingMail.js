function FEU_wf_Sendmail_cust(){

var id=nlapiGetRecordId();
var owner=nlapiGetFieldValue('owner');
var cust=nlapiGetFieldValue('custrecord_approver_budget1');
var rec=nlapiLoadRecord('customer',cust);
var emp=rec.getFieldValue('custentity_feu_cust_employee');
nlapiSendEmail(emp, owner,'Budget Approved by Budget Director' ,'Hi ,<br>  Your Budget  has been approved by me. Further to be Approved by CFO.  <Br> <a href="https://system.netsuite.com/app/common/custom/custrecordentry.nl?rectype=74&id='+id+'"> view Record</a>');





}