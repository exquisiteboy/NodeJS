'use strict';
const sparql = require('./SparQlClass');
const sprkObj = new sparql();


class neighbors{

	constructor(){
		this.CountryF = '';
		this.CountryS = '';

	}


	buildQuery(countries){
		try{
		var cntry = countries.f;
		var cntry2 = countries.s;
	}catch(err){
		console.log(err);

	}
		var Query  = 
		`PREFIX dbp:<http://dbpedia.org/property/>
		 PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		 PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
		 select DISTINCT ?border ?border1
		 where{
		 	<http://dbpedia.org/resource/Geography_of_${cntry}> dbp:borders   ?border.
 			{
 				select *
 				where{
 					<http://dbpedia.org/resource/Geography_of_${cntry2}>  dbp:borders   ?border1.
 				}
 			}
 		}`;
 		return Query;
 	}

 	extractCountries(witObject){

 		if(typeof(witObject)=='undefined'){
 			console.log('please specify the paramter');
 			return ;
 		}

 		const{
 			location,
 			local_search_query,
 			Country,
 			isNb,
 		}=witObject.entities;
 		var frst;
 		var sec;
          try{
          	if(typeof(isNb)!=='undefined'){
          		var response  = {
          			msg:isNb[0].value
          		}
          		return response;
          	}
 			if(typeof(Country)!='undefined'){
 				//console.log('inside countrt');
 			 	frst = Country[0].value;
 			 	frst = frst.trim();
        	 	frst = frst.trimLeft();
        	 	frst = frst.charAt(0).toUpperCase() + frst.slice(1);
        	}if((typeof(Country)=='undefined') && (typeof(location)!=='undefined')){
 				//console.log('inside countrt');
 				if(typeof(frst)=='undefined'){
 					var floc = location[0].value;
 					frst = floc.charAt(0).toUpperCase()+floc.slice(1);
 				}else{
 					var sloc = location[0].value;
 					sec = sloc.charAt(0).toUpperCase()+sloc.slice(1);
 				}
 				if(typeof(location[1])!='undefined'){
 					//console.log('inside location[1]');
 					var sloc = location[1].value;
 				    sec  =  sloc.charAt(0).toUpperCase()+sloc.slice(1);
 		    	}
          	}if(typeof(Country)!='undefined' && typeof(location)!='undefined'){
 				var sloc = location[0].value;
 				sec = sloc.charAt(0).toUpperCase()+sloc.slice(1);
 			}
 			if(typeof(local_search_query)!='undefined'){
 				//console.log('inside local_search_query'+sec);
 				if(typeof(sec)=='undefined' || typeof(frst)=='undefined'){
 					var sloc =  local_search_query[0].value.split(" ");
                	sec  =  sloc[0];
                	sec  =  sec.charAt(0).toUpperCase()+sec.slice(1);
            	}
 			}
 		}catch(err){
 			console.log(err);
 		}
      	this.CountryF = frst;
      	this.CountryS = sec;
      	var countries ={
      		f :frst,
      		s:sec
      	}
      	//console.log(countries);
      	return countries;
    }

 	CheckNeigborHood(bindings){
 		return new Promise((resolve,reject)=>{
 			var arrr = [];
 			var arrr2 = [];
 			for(var i=0;i<bindings.length;i++){
 				var one = bindings[i].border.value;
 				var two = bindings[i].border1.value;
 				one = one.replace('http://dbpedia.org/resource/','').replace(/[(].+/g,'').trim();
 				one = one.replace(':','');
 				arrr[i] = one;

 				two    = two.replace('http://dbpedia.org/resource/','').replace(/[(].+/g,'').trim();
 				two   = two.replace(':','');
 				arrr2[i] = two;

 			}

 			var set = new Set(arrr);
 			var set1 = new Set(arrr2);
 			var setSize = set.size;
 			var set1Size = set1.size;
 			//console.log(setSize+set1Size);
 			if(setSize <=0 || set1Size<=0){
 				var response = {
 					msg:`i dont know the answer yet`
 				}
 				resolve(response);

 			}else{
 			if(set.size==1){
 				var mmarr = Array.from(set);
 			    mmarr =	mmarr[0].split(',');
 			    for(var i in mmarr){
 			    	mmarr[i] = mmarr[i].trim();
 			    }
 				set = new Set(mmarr);
 			}if(set1.size==1){
 				var mmarr = Array.from(set1);
 			    mmarr =	mmarr[0].split(',');
 			    for(var i in mmarr){
 			    	mmarr[i] = mmarr[i].trim();
 			    }
 				set1 = new Set(mmarr);

 			}
 			console.log('set');
 			console.log(set);
 			console.log('set1');
 			console.log(set1);
 			let tru = set1.has(this.CountryF);
 			if(tru){
 				var response ={
 					msg:`Yes ${this.CountryF} and ${this.CountryS} are neighbors`
 				}
 				resolve(response);

 			}else{
 				var response = {
 					msg:`NO ${this.CountryF} and ${this.CountryS} are not neighbors`
 				}
 				resolve(response);
 			}
 			console.log(tru);
			}
 		});	
            //console.log('orgranized'+arrr);
    }

 	parseDBpediResponse(bindings){
 		return new Promise((resolve,reject)=>{
 			if(typeof(bindings)!='undefined'){
 				this.CheckNeigborHood(bindings)
 				.then((response)=>{
 					resolve(response);
 				})
 				.catch((err)=>{console.log(err)});
 			}else{
 				resolve(`i dont know the answer yet`);
 			}
 		});
 	}



 	areNeigbors(witObject){

 		//console.log(JSON.stringify(witObject.entities));

 		return new Promise((resolve,reject)=>{
 			var resp = this.extractCountries(witObject);
 			if((typeof(resp)=='object') && (typeof(resp.f)=='undefined')){
 				resolve(resp);
 			}
 			console.log(resp);
 			var Query = this.buildQuery(resp);
 			//console.log(Query);
 			sprkObj.QueryDbPedia(Query).then((response)=>{
 				//console.log(response);
 				this.parseDBpediResponse(response)
 				.then((response)=>{
          console.log(response);
 					resolve(response);
 				})
 				.catch((err)=>{
 					console.log(err);
 					resolve(err);
 				});
 			}).catch((err)=>{
 				console.log(err);
 			});
 		});	
 	} // end of function 
}// end of class


module.exports = neighbors;