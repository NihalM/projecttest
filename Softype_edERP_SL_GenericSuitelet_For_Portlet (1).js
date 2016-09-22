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
 ** @author:  Nihal Mulani
 ** @version: 1.0
 ** Description: This is Generic Suitelet Script for Portlet.
 ************************************************************************************** */
var entitystatus_submitted =22;
var entitystatus_register =20;
var entitystatus_saveasDraft =21;

function suitelet_service(request, response)
{
	nlapiLogExecution('debug', 'Inside suiteeeee');
	try
	{
		var data = request.getBody();
		if(data)
			request = JSON.parse(request.getBody());
		else
			request = request.getAllParameters();

		//nlapiLogExecution('debug', 'data', JSON.stringify(data));


		var stAction = request.action;	
		nlapiLogExecution('debug','stAction',stAction);

		if(stAction =='Save_Add_one')
		{
			try
			{

				var idst=request.std;
				var madd1=request.madd1;
				var madd2=request.madd2;
				var mcity=request.mcity;
				var mstate=request.mstate;
				var M_counry=request.M_counry;
				var mzip=request.mzip;
				var M_counry_code=request.M_counry_code;

				var Std_Id,admission_entitystatus;
				var Columns = [];
				var Filters = [];

				Filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
				Filters.push(new nlobjSearchFilter('custrecord_admission_entity_link', null, 'is', idst));
				Columns.push(new nlobjSearchColumn('custrecord_ederp_admission_entitystatus'));
				var Results = nlapiSearchRecord('customrecord_ederp_admission', null, Filters, Columns);
				//	nlapiLogExecution('emergency','Results',Results.length);
				if(Results)
				{

					Std_Id=Results[0].getId();
					admission_entitystatus=Results[0].getValue('custrecord_ederp_admission_entitystatus');
					if(admission_entitystatus == entitystatus_register || admission_entitystatus == entitystatus_saveasDraft || admission_entitystatus == entitystatus_submitted)
					{
						var rec_submit = nlapiSubmitField('customrecord_ederp_admission',Std_Id,['custrecord_ederp_admailadd_houseno','custrecord_ederp_admailadd_street','custrecord_ederp_admailadd_city','custrecord_ederp_admailadd_province','custrecord_ederp_admailadd_country','custrecord_ederp_admailadd_zipcode'],[madd1,madd2,mcity,mstate,M_counry,mzip]);
						response.write(rec_submit);
						return ;
					}
					else
					{
						var rec_submit = nlapiSubmitField('customrecord_ederp_admission',Std_Id,['custrecord_ederp_admailadd_houseno','custrecord_ederp_admailadd_street','custrecord_ederp_admailadd_city','custrecord_ederp_admailadd_province','custrecord_ederp_admailadd_country','custrecord_ederp_admailadd_zipcode'],[madd1,madd2,mcity,mstate,M_counry,mzip]);

						var recStudent = nlapiLoadRecord('customer', idst);
						recStudent.setLineItemValue('addressbook','addr1',1,madd1);
						recStudent.setLineItemValue('addressbook','addr2',1,madd2);
						recStudent.setLineItemValue('addressbook','city',1, mcity);
						recStudent.setLineItemValue('addressbook','state',1, mstate);
						recStudent.setLineItemValue('addressbook','country',1,M_counry_code);
						recStudent.setLineItemValue('addressbook','zip',1, mzip);
						recStudent.setLineItemValue('addressbook','defaultbilling',1, 'T');
						recStudent.setLineItemValue('addressbook','defaultshipping',1, 'T');
						var successid = nlapiSubmitRecord(recStudent, false, true);

						response.write(rec_submit);
						return ;
					}


				}
				else
				{

					var recStudent = nlapiLoadRecord('customer', idst);
					recStudent.setLineItemValue('addressbook','addr1',1,madd1);
					recStudent.setLineItemValue('addressbook','addr2',1,madd2);
					recStudent.setLineItemValue('addressbook','city',1, mcity);
					recStudent.setLineItemValue('addressbook','state',1, mstate);
					recStudent.setLineItemValue('addressbook','country',1,M_counry_code);
					recStudent.setLineItemValue('addressbook','zip',1, mzip);
					recStudent.setLineItemValue('addressbook','defaultbilling',1, 'T');
					recStudent.setLineItemValue('addressbook','defaultshipping',1, 'T');
					var successid = nlapiSubmitRecord(recStudent, false, true);

					response.write(successid);
					return ;
				}
			}
			catch(e)
			{
				var code = '400';
				var Msg =  'failed';
				nlapiLogExecution('emergency','Process Error in Action '+stAction+ ' ' +e.toString());
				var FailedValue = ({"code":code,"message":Msg});		
				FailedValue = JSON.stringify(FailedValue);
				response.write(FailedValue);
				return ;
			}	

		}else if(stAction =='Save_Add_two')
		{
			try
			{

				var idst=request.std;
				var padd1=request.padd1;
				var padd2=request.padd2;
				var pcity=request.pcity;
				var pstate=request.pstate;
				var p_counry=request.p_counry;
				var pzip=request.pzip;
				var p_counry_code=request.p_counry_code;
				var Std_Id,admission_entitystatus;
				var Columns = [];
				var Filters = [];

				Filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
				Filters.push(new nlobjSearchFilter('custrecord_admission_entity_link', null, 'is', idst));
				Columns.push(new nlobjSearchColumn('custrecord_ederp_admission_entitystatus'));
				var Results = nlapiSearchRecord('customrecord_ederp_admission', null, Filters, Columns);
				if(Results)
				{
					Std_Id=Results[0].getId();
					admission_entitystatus=Results[0].getValue('custrecord_ederp_admission_entitystatus');
					if(admission_entitystatus == entitystatus_register || admission_entitystatus == entitystatus_saveasDraft || admission_entitystatus == entitystatus_submitted)
					{
						var rec_submit = nlapiSubmitField('customrecord_ederp_admission',Std_Id,['custrecord_ederp_adperadd_houseno','custrecord_ederp_adperadd_street','custrecord_ederp_adperadd_city','custrecord_ederp_adperadd_province','custrecord_ederp_adperadd_country','custrecord_ederp_adperadd_zipcode'],[padd1,padd2,pcity,pstate,p_counry,pzip]);
						response.write(rec_submit);
						return ;

					}
					else
					{

						var rec_submit = nlapiSubmitField('customrecord_ederp_admission',Std_Id,['custrecord_ederp_adperadd_houseno','custrecord_ederp_adperadd_street','custrecord_ederp_adperadd_city','custrecord_ederp_adperadd_province','custrecord_ederp_adperadd_country','custrecord_ederp_adperadd_zipcode'],[padd1,padd2,pcity,pstate,p_counry,pzip]);

						var recStudent = nlapiLoadRecord('customer', idst);
						recStudent.setLineItemValue('addressbook','addr1',2, padd1);
						recStudent.setLineItemValue('addressbook','addr2',2, padd2);
						recStudent.setLineItemValue('addressbook','city',2, pcity);
						recStudent.setLineItemValue('addressbook','state',2, pstate);
						recStudent.setLineItemValue('addressbook','country',2, p_counry_code);
						recStudent.setLineItemValue('addressbook','zip',2, pzip);
						var successid = nlapiSubmitRecord(recStudent, false, true);

						response.write(rec_submit);
						return ;
					}


				}
				else
				{
					var recStudent = nlapiLoadRecord('customer', idst);
					recStudent.setLineItemValue('addressbook','addr1',2, padd1);
					recStudent.setLineItemValue('addressbook','addr2',2, padd2);
					recStudent.setLineItemValue('addressbook','city',2, pcity);
					recStudent.setLineItemValue('addressbook','state',2, pstate);

					recStudent.setLineItemValue('addressbook','country',2, p_counry_code);
					recStudent.setLineItemValue('addressbook','zip',2, pzip);
					var successid = nlapiSubmitRecord(recStudent, false, true);

					response.write(successid);
					return ;

				}
			}
			catch(e)
			{
				var code = '400';
				var Msg =  'failed';
				nlapiLogExecution('emergency','Process Error in Action '+stAction+ ' ' +e.toString());
				var FailedValue = ({"code":code,"message":Msg});		
				FailedValue = JSON.stringify(FailedValue);
				response.write(FailedValue);
				return ;
			}	

		}
		else if(stAction =='Profile')
		{
			try
			{
				var idst=request.std;
				var altemail=request.Email;
				var mobile=request.mobile;

				var Std_Id;
				var Columns = [];
				var Filters = [];

				Filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
				Filters.push(new nlobjSearchFilter('custrecord_admission_entity_link', null, 'is', idst));
				Columns.push(new nlobjSearchColumn('custrecord_ederp_admission_entitystatus'));
				var Results = nlapiSearchRecord('customrecord_ederp_admission', null, Filters, Columns);
				if(Results)
				{
					Std_Id=Results[0].getId();
					admission_entitystatus=Results[0].getValue('custrecord_ederp_admission_entitystatus');
					if(admission_entitystatus == entitystatus_register || admission_entitystatus == entitystatus_saveasDraft || admission_entitystatus == entitystatus_submitted)
					{
						var rec_submit = nlapiSubmitField('customrecord_ederp_admission',Std_Id,['custrecord_ederp_altemail','custrecord_ederp_admission_mobilephone'],[altemail,mobile]);
						response.write(rec_submit);
						return ;
					}
					else
					{
						var rec_submit = nlapiSubmitField('customrecord_ederp_admission',Std_Id,['custrecord_ederp_altemail','custrecord_ederp_admission_mobilephone'],[altemail,mobile]);

						var recStudent = nlapiLoadRecord('customer', idst);
						recStudent.setFieldValue('mobilephone', mobile);
						recStudent.setFieldValue('altemail', altemail);
						var successid = nlapiSubmitRecord(recStudent, false, true);
						response.write(rec_submit);
						return ;

					}

				}
				else
				{
					var recStudent = nlapiLoadRecord('customer', idst);
					recStudent.setFieldValue('mobilephone', mobile);
					recStudent.setFieldValue('altemail', altemail);
					var successid = nlapiSubmitRecord(recStudent, false, true);

					response.write(successid);
					return ;
				}


			}
			catch(e)
			{
				var code = '400';
				var Msg =  'failed';
				nlapiLogExecution('emergency','Process Error in Action '+stAction+ ' ' +e.toString());
				var FailedValue = ({"code":code,"message":Msg});		
				FailedValue = JSON.stringify(FailedValue);
				response.write(FailedValue);
				return ;
			}	

		}
		else if(stAction =='Profilek12')
		{
			try
			{
				var idst=request.std;
				var altemail=request.Email;
				var mobile=request.mobile;

				nlapiLogExecution('DEBUG', '274 idst = ',idst+'@@'+'altemail = '+altemail+'@@'+'mobile = '+mobile);
				
				var Std_Id='';
				var Columns = [];
				var Filters = [];
				
				nlapiLogExecution('DEBUG', '317 idst = ',idst+'@@'+'altemail = '+altemail);
				nlapiSubmitField('customer',idst,['altemail','phone'], [altemail,mobile]);
				response.write(successid);
				return ;
				
				/*
				Filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
				Filters.push(new nlobjSearchFilter('custrecord_ederpk12_entitylink', null, 'is', idst));
				
				Columns.push(new nlobjSearchColumn('entitystatus','custrecord_ederpk12_entitylink'));
				
				var Results = nlapiSearchRecord('customrecord_ederpk12_stud_master', null, Filters, Columns);
				if(Results)
				{
					Std_Id=Results[0].getId();
					nlapiLogExecution('DEBUG', '289 Std_Id = ',Std_Id);
					
					admission_entitystatus=Results[0].getValue('entitystatus','custrecord_ederpk12_entitylink');
					if(admission_entitystatus == entitystatus_register || admission_entitystatus == entitystatus_saveasDraft || admission_entitystatus == entitystatus_submitted)
					{
						var rec_submit = nlapiSubmitField('customrecord_ederpk12_stud_master',Std_Id,['custrecord_ederp_altemail','custrecord_ederp_admission_mobilephone'],[altemail,mobile]);
						response.write(rec_submit);
						return ;
					}
					else
					{
						var rec_submit = nlapiSubmitField('customrecord_ederpk12_stud_master',Std_Id,['custrecord_ederp_altemail','custrecord_ederp_admission_mobilephone'],[altemail,mobile]);

						var recStudent = nlapiLoadRecord('customer', idst);
						recStudent.setFieldValue('mobilephone', mobile);
						recStudent.setFieldValue('altemail', altemail);
						var successid = nlapiSubmitRecord(recStudent, false, true);
						response.write(rec_submit);
						return ;

					}
					
					nlapiSubmitField('customer',idst,'altemail', altemail);
					nlapiSubmitField('customrecord_ederpk12_stud_master',Std_Id,'custrecord_ederpk12_telephoneno',mobile);
					return;

				}
				else
				{
					nlapiLogExecution('DEBUG', '317 idst = ',idst+'@@'+'altemail = '+altemail);
					nlapiSubmitField('customer',idst,'altemail', altemail);
					response.write(successid);
					return ;
				}
				*/

			}
			catch(e)
			{
				var code = '400';
				var Msg =  'failed';
				nlapiLogExecution('emergency','Process Error in Action '+stAction+ ' ' +e.toString());
				var FailedValue = ({"code":code,"message":Msg});		
				FailedValue = JSON.stringify(FailedValue);
				response.write(FailedValue);
				return ;
			}
		}
		else if(stAction =='GetSchdules')
		{
			try
			{
				var stdStudent=request.std;
				var academicYear=request.academicYear;
				var academicTerm=request.academicTerm;
				var successid= getCourseSchedules( academicYear,academicTerm,stdStudent);
				nlapiLogExecution('DEBUG', 'All Schdule Data', JSON.stringify(successid));
				successid=JSON.stringify(successid)
				response.write(successid);
				return ;
			}
			catch(e)
			{
				var code = '400';
				var Msg =  'failed';
				nlapiLogExecution('emergency','Process Error in Action '+stAction+ ' ' +e.toString());
				var FailedValue = ({"code":code,"message":Msg});		
				FailedValue = JSON.stringify(FailedValue);
				response.write(FailedValue);
				return ;
			}	

		}



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
	return;
}
function countryISO(cont_code)
{
	//THe Function will return the iso value for an country from Country Codes   Record
	var aoi_contr_text ='';
	var search2 = nlapiSearchRecord('customrecord_ederp_countrylist', null, [new nlobjSearchFilter('custrecord_ederp_countryname', null, 'is', cont_code)],[new nlobjSearchColumn('custrecord_ederp_countrycode')]);
	if (search2) {
		aoi_contr_text = search2[0].getValue('custrecord_ederp_countrycode');
	}
	else
		aoi_contr_text = '';
	return aoi_contr_text;
}

function  getCourseSchedules( academicYear,academicTerm,stdStudent)
{
	var finalResultsCourse = [];
	var finalResultsOtherCourse = [];

	var finalResultsSchedule = [];
	var arrayDetails = [];

	var listFaculty = [] , listCourse = [] , listSubject = [], listBuilding = [], listDepartment = [], listSections =[];
	var isElective = 'F';

	var ENFil= new Array();
	var EnCol= new Array();
	var listEnrollSchedule = [];
	ENFil.push(new nlobjSearchFilter('isinactive',null, 'is', 'F'));
	 ENFil.push(new nlobjSearchFilter('custrecord_master_drop_master',null,'is','F'));
		if(academicYear)
	{
		ENFil.push(new nlobjSearchFilter('custrecord_ederp_enroll_acadyear',null, 'is', academicYear));
	}
	if(academicTerm)
	{
		ENFil.push(new nlobjSearchFilter('custrecord_ederp_enroll_acadterm', null, 'is', academicTerm));
	}
	ENFil.push(new nlobjSearchFilter('custrecord_ederp_enroll_student', null, 'is', stdStudent));

	EnCol[0] = new nlobjSearchColumn('custrecord_ederp_enroll_schedule');
	var srchEnroll= nlapiSearchRecord('customrecord_ederp_enroll', null, ENFil, EnCol);
	if(srchEnroll)
	{

		for(var jj =0; jj<srchEnroll.length; jj++)
		{
			var newval = srchEnroll[jj].getValue('custrecord_ederp_enroll_schedule');

			if (newval .indexOf(',') > -1) 
			{ var NEwString = newval.split(',')

				for(var mm = 0; mm<NEwString .length ; mm++)
				{
					listEnrollSchedule.push(NEwString [mm]);
				}
			}
			else

				listEnrollSchedule.push(newval ); 
		}
	}


	if(listEnrollSchedule.length >0)
	{
		var GenericArray= new Array();
		//get scheduled courses for that term and year and subsidiary
		var filterSchedule = new Array();
		filterSchedule[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		filterSchedule[1] = new nlobjSearchFilter('isinactive', 'custrecord_ederp_schedtime_schedlink', 'is', 'F');
		filterSchedule[2] = new nlobjSearchFilter('internalid', 'custrecord_ederp_schedtime_schedlink', 'anyof',listEnrollSchedule);//approved
		//filterSchedule[2] = new nlobjSearchFilter('custrecord_ederp_schedule_subsid', 'custrecord_ederp_schedtime_schedlink', 'is', subsidiary);
		//filterSchedule[2] = new nlobjSearchFilter('custrecord_ederp_schedule_acadyear', 'custrecord_ederp_schedtime_schedlink', 'is', academicYear);
		//filterSchedule[3] = new nlobjSearchFilter('custrecord_ederp_schedule_acadterm', 'custrecord_ederp_schedtime_schedlink', 'is', academicTerm);
		//filterSchedule[5] = new nlobjSearchFilter('custrecord_ederp_schedule_status', 'custrecord_ederp_schedtime_schedlink', 'is', 2);//approved

		var columnsSchedule = new Array();
		columnsSchedule[0] = new nlobjSearchColumn('custrecord_ederp_schedtime_day');
		columnsSchedule[1] = new nlobjSearchColumn('custrecord_ederp_schedtime_start');
		columnsSchedule[2] = new nlobjSearchColumn('custrecord_ederp_schedtime_end');
		columnsSchedule[3] = new nlobjSearchColumn('custrecord_ederp_schedule_coursecomp','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[4] = new nlobjSearchColumn('custrecord_ederp_schedule_faculty','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[5] = new nlobjSearchColumn('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[6] = new nlobjSearchColumn('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[7] = new nlobjSearchColumn('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[8] = new nlobjSearchColumn('custrecord_ederp_schedule_course','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[9] = new nlobjSearchColumn('custrecord_ederp_schedule_batch','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[10] = new nlobjSearchColumn('name','custrecord_ederp_schedtime_schedlink').setSort();
		columnsSchedule[11] = new nlobjSearchColumn('custrecord_ederp_schedule_acadyear','custrecord_ederp_schedtime_schedlink');
		columnsSchedule[12] = new nlobjSearchColumn('custrecord_ederp_schedule_acadterm','custrecord_ederp_schedtime_schedlink');
		var srchSchedules= nlapiSearchRecord('customrecord_ederp_schedtime', null, filterSchedule, columnsSchedule);
		if(srchSchedules)
		{
			nlapiLogExecution('debug', 'srchSchedules', srchSchedules.length);
			var array = [];
			for(var i=0 ; i<srchSchedules.length ; i++)
			{
				var course = srchSchedules[i].getValue('custrecord_ederp_schedule_course','custrecord_ederp_schedtime_schedlink');
				var courseName = srchSchedules[i].getText('custrecord_ederp_schedule_course','custrecord_ederp_schedtime_schedlink');
				if(!isObjectInJSONArray(listCourse,course))
					listCourse.push({id:course, name:courseName}); 

				listSections.push({course:course, section:srchSchedules[i].getValue('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink')});

				var faculty = srchSchedules[i].getValue('custrecord_ederp_schedule_faculty','custrecord_ederp_schedtime_schedlink');
				if(!isObjectInJSONArray(listFaculty,faculty) && !isEmpty(faculty))
					listFaculty.push({id:faculty, name:''}); 

				if(GenericArray.length == 0)
				{
					array.push(
							{
								CourseName : srchSchedules[i].getText('custrecord_ederp_schedule_course','custrecord_ederp_schedtime_schedlink'),
								Faculty : srchSchedules[i].getValue('custrecord_ederp_schedule_faculty','custrecord_ederp_schedtime_schedlink'),
								//Faculty : faculty,
								Batch : srchSchedules[i].getText('custrecord_ederp_schedule_batch','custrecord_ederp_schedtime_schedlink'),
								//Building :srchSchedules[i].getText('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink'),
								BuildingName : srchSchedules[i].getText('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink'),
								//Room : srchSchedules[i].getValue('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink'),
								RoomName : srchSchedules[i].getText('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink'),
								Component : srchSchedules[i].getText('custrecord_ederp_schedule_coursecomp','custrecord_ederp_schedtime_schedlink'),
								Section : srchSchedules[i].getValue('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink'),
								SectionName : srchSchedules[i].getText('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink'),
								day : srchSchedules[i].getText('custrecord_ederp_schedtime_day'),
								startTime : srchSchedules[i].getText('custrecord_ederp_schedtime_start'),
								endTime : srchSchedules[i].getText('custrecord_ederp_schedtime_end'),
								schedule_acadyear : srchSchedules[i].getValue('custrecord_ederp_schedule_acadyear','custrecord_ederp_schedtime_schedlink'),
								schedule_acadterm : srchSchedules[i].getValue('custrecord_ederp_schedule_acadterm','custrecord_ederp_schedtime_schedlink'),

							});
					GenericArray.push(
							{
								CourseId : course , details : array
							});
				}
				else if(GenericArray[GenericArray.length-1].CourseId == course)
				{
					var currentSection = srchSchedules[i].getValue('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink');
					var prevSection = GenericArray[GenericArray.length-1].details[array.length-1].Section;
					if(parseInt(currentSection)!=prevSection)
					{
						array.push(
								{
									CourseName : srchSchedules[i].getText('custrecord_ederp_schedule_course','custrecord_ederp_schedtime_schedlink'),
									Faculty : srchSchedules[i].getValue('custrecord_ederp_schedule_faculty','custrecord_ederp_schedtime_schedlink'),
									//Faculty : faculty,
									Batch : srchSchedules[i].getText('custrecord_ederp_schedule_batch','custrecord_ederp_schedtime_schedlink'),
									//Building :srchSchedules[i].getText('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink'),
									BuildingName : srchSchedules[i].getText('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink'),
									//Room : srchSchedules[i].getValue('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink'),
									RoomName : srchSchedules[i].getText('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink'),
									Component : srchSchedules[i].getText('custrecord_ederp_schedule_coursecomp','custrecord_ederp_schedtime_schedlink'),
									Section : srchSchedules[i].getValue('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink'),
									SectionName : srchSchedules[i].getText('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink'),
									day : srchSchedules[i].getText('custrecord_ederp_schedtime_day'),
									startTime : srchSchedules[i].getText('custrecord_ederp_schedtime_start'),
									endTime : srchSchedules[i].getText('custrecord_ederp_schedtime_end'),
									schedule_acadyear : srchSchedules[i].getValue('custrecord_ederp_schedule_acadyear','custrecord_ederp_schedtime_schedlink'),
									schedule_acadterm : srchSchedules[i].getValue('custrecord_ederp_schedule_acadterm','custrecord_ederp_schedtime_schedlink'),


								});

					}
					else
					{
						array[array.length-1].day+=','+srchSchedules[i].getText('custrecord_ederp_schedtime_day');
						array[array.length-1].startTime+=','+srchSchedules[i].getText('custrecord_ederp_schedtime_start');
						array[array.length-1].endTime+=','+srchSchedules[i].getText('custrecord_ederp_schedtime_end');
					}
					GenericArray[GenericArray.length-1].details = array;
				}
				else
				{
					array = [];
					array.push(
							{
								CourseName : srchSchedules[i].getText('custrecord_ederp_schedule_course','custrecord_ederp_schedtime_schedlink'),
								//Faculty : faculty,
								Batch : srchSchedules[i].getText('custrecord_ederp_schedule_batch','custrecord_ederp_schedtime_schedlink'),
								Faculty : srchSchedules[i].getValue('custrecord_ederp_schedule_faculty','custrecord_ederp_schedtime_schedlink'),
								//Building :srchSchedules[i].getText('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink'),
								BuildingName : srchSchedules[i].getText('custrecord_ederp_schedule_building','custrecord_ederp_schedtime_schedlink'),
								//Room : srchSchedules[i].getValue('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink'),
								RoomName : srchSchedules[i].getText('custrecord_ederp_schedule_room','custrecord_ederp_schedtime_schedlink'),
								Component : srchSchedules[i].getText('custrecord_ederp_schedule_coursecomp','custrecord_ederp_schedtime_schedlink'),
								Section : srchSchedules[i].getValue('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink'),
								SectionName : srchSchedules[i].getText('custrecord_ederp_schedule_section','custrecord_ederp_schedtime_schedlink'),
								day : srchSchedules[i].getText('custrecord_ederp_schedtime_day'),
								startTime : srchSchedules[i].getText('custrecord_ederp_schedtime_start'),
								endTime : srchSchedules[i].getText('custrecord_ederp_schedtime_end'),
								schedule_acadyear : srchSchedules[i].getValue('custrecord_ederp_schedule_acadyear','custrecord_ederp_schedtime_schedlink'),
								schedule_acadterm : srchSchedules[i].getValue('custrecord_ederp_schedule_acadterm','custrecord_ederp_schedtime_schedlink'),


							});
					GenericArray.push(
							{
								CourseId : course , details : array
							});
				}
			}
		}

		finalResultsSchedule = GenericArray;
		//send

		//Get Names of faculty
		listFaculty = getFacultyNames(listFaculty);
		//sort lists
		listFaculty.sort(function(a, b)
				{
			var x = a.name, y = b.name;
			return x == y ? 0 : (x < y ? -1 : 1);
				});
		return {
			schedules : finalResultsSchedule,
			listFaculty : listFaculty , 		
			listSectionGroups : listSections
		};
	}
	else
		return 'nodata';

}
function isObjectInJSONArray(JSONarray,idValue)
{
	for (var i=0; i<JSONarray.length; i++) 
		if(parseInt(JSONarray[i].id) == parseInt(idValue))
			return true;
	return false;
}
function getFacultyNames(listFaculty)
{
	
	var dateRef = new Date();
	var NSurl = nlapiResolveURL ('suitelet','customscript_softype_ederp_st_acade_requ' ,'customdeploy_softype_ederp_st_acade_requ',true);
	NSurl += '&t='+ dateRef.getTime() + Math.floor(Math.random()*9999999999999999);
//	nlapiLogExecution('Debug','NSurl',NSurl);

	var NSheaders = new Array();
	NSheaders['Content-type'] = 'application/json';
	NSheaders['User-Agent-x'] = 'SuiteScript-Call';

	var jsonObj = {'action':'getfacultyname' , 'array':JSON.stringify(listFaculty)};
	var jsonTxt = JSON.stringify(jsonObj);

	var response = nlapiRequestURL(NSurl, jsonTxt, NSheaders);

	return JSON.parse(response.body).array;
}