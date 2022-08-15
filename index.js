import fs from 'fs'
import path from 'path'
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import PDLJS from 'peopledatalabs';
import 'dotenv/config'


const total = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./companies.json"), 'utf-8')
);
let result = total.companies;
// console.log(Array.isArray(result))
// console.log(result)
const filteredResult = result.filter(ele => {
  // software /
  const arrOfTags = ['software', 'artificial', 'cloud', 'infrastructure', 'internet', 'application'];
  
  if (!ele.tags) return false;
  for (let i = 0; i < ele.tags.length; ++i) {
    const currentElement = ele.tags[i];
    for (let j = 0; j < arrOfTags.length; ++j) {
      if (currentElement.includes(arrOfTags[j])) {
        return true;
      }
    }
  }
  return false;
});
console.log(filteredResult.length);

const companyNames = []
filteredResult.forEach(el => companyNames.push(el.name))
console.log(companyNames)


const PDLJSClient = new PDLJS({apiKey: `${process.env.PDLAPIKey}`})

// const finalList = []
// for (let i = 0; i < companyNames.length; i++) {
//   const queryString = {"name":`${companyNames[i]}`}
  
//   // Pass the parameters object to the Company Enrichment API
//   PDLJSClient.company.enrichment(queryString).then((response) => {
//     // Print the API response
    
//     finalList.push(response)
//     console.log(response)
//   }).catch((error) => {
//     console.log(error);
//   });
// }
// console.log(finalList)


let finalList = []
const test = async () => {
  try {
    for (let i = 0; i < companyNames.length; i++) {
      const queryString = {"name":`${companyNames[i]}`}
      const res = await PDLJSClient.company.enrichment(queryString)
      // console.log("index: ", i, typeof res)
      finalList.push(res);
   }
   finalList = finalList.sort((a,b) => {
     return a.average_employee_tenure - b.average_employee_tenure
   }).map(a => [a.name, a.average_employee_tenure]);

  console.log(finalList)
  } catch (err) {
      console.log(err);
  }
}
// test();




const seniority_levels = [
 "cxo",
 "director",
 "manager",
 "partner",
 "vp",
 "owner"]
 
 const seniority_criteria = {terms: {experience_title_levels: seniority_levels}}
 
 const esQuery2 = {
  query: {
    bool: {
      must:[
        {term: {job_company_id: "buzzfeed"}}, 
        {term: {location_country: "united states"}},
        {term: {job_title: "software engineer"}}, 
        // {term: {job_title_level: "senior"}}, 
        {exists: {field: "linkedin_url"}}
      ], 
      must_not: [
        // {terms: {job_title: "staff"}}
      ],
    }
  }
}


var params = {
  searchQuery: esQuery2, 
  size: 20,
  scroll_token: null,
  pretty: true
}


PDLJSClient.person.search.elastic(params).then((data) => {
    var record
    const list = []
    // console.log(data.data.job_start_date)
    for (let response in data.data) {
      
        record = data.data[response]
        // console.log(record)
        list.push(record)
        list.sort((a, b) => {
          return new Date (a.job_last_updated) - new Date (b.job_last_updated)
        })
        // console.log(list.record["job_start_date"])
        // Print selected fields
        // console.log(
        //   record["job_title"],
        //   record["linkedin_url"],
        //   record["full_name"],
        //   record["job_company_name"],
        //   record["job_last_updated"]
        //   )
        }
        
    // console.log(list[2].job_start_date)
    for (let person of list){
      console.log(
        person["job_title"],
        person["full_name"],
        person["linkedin_url"],
        person["job_last_updated"]
      )
    }
    console.log(`successfully grabbed ${data.data.length} records from pdl`);
    console.log(`${data["total"]} total pdl records exist matching this query`)
}).catch((error) => {
    // console.log("NOTE. The eager beaver was not so eager. See error and try again.")
    console.log(error);
});