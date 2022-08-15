import fs from 'fs'
import path from 'path'
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import PDLJS from 'peopledatalabs';
import 'dotenv/config'
import * as csvwriter from 'csv-writer';


const total = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./companies.json"), 'utf-8')
);
let result = total.companies;

const filteredResult = result.filter(ele => {
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
// console.log(companyNames)


const PDLJSClient = new PDLJS({apiKey: `${process.env.PDLAPIKey}`})

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




// const seniority_levels = [
//  "cxo",
//  "director",
//  "manager",
//  "partner",
//  "vp",
//  "owner"]
 
//  const seniority_criteria = {terms: {experience_title_levels: seniority_levels}}
 
 const esQuery2 = {
  query: {
    bool: {
      must:[
        {term: {job_company_id: "buzzfeed"}}, 
        {term: {location_country: "united states"}},
        {term: {job_title: "software engineer"}}, 
        // {exists: {field: "work_email"}},
        {exists: {field: "job_start_date"}}, 
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
        list.push(record)
        list.sort((a, b) => {
          return new Date (b.job_start_date) - new Date (a.job_start_date)
        })
        }
        
    for (let person of list){
      console.log(
        person["job_title"],
        person["full_name"],
        person["linkedin_url"],
        person["job_last_updated"]
      )
    }
    let csvHeaderFields = [
      {id: "work_email", title: "Work Email"},
      {id: "full_name", title: "Full Name"}, 
      {id: "linkedin_url", title: "LinkedIn"},
      {id: "job_title", title: "Title"},
      {id: "job_company_name", title: "Comapny"},
      {id: "job_start_date", title: "Job Start Date"}
    ]
    let csvFilename = "BuzzFeed Top 10 Prospects"
    saveProfilesToCSV(list, csvFilename, csvHeaderFields)
    console.log(list)
    console.log(`successfully grabbed ${data.data.length} records from pdl`);
    console.log(`${data["total"]} total pdl records exist matching this query`)
}).catch((error) => {
    // console.log("NOTE. The eager beaver was not so eager. See error and try again.")
    console.log(error);
});

function saveProfilesToCSV(profiles, filename, fields) {
   // Create CSV file
    const createCsvWriter = csvwriter.createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: filename,
        header: fields
    });
    let data = [];
    // Iterate through records array
    for (let i = 0; i < profiles.length; i++) {
        let record = profiles[i];
        data[i] = {};
        // Store requested fields
        for (let field in fields) {
            data[i][fields[field].id] = record[fields[field].id];    
        }
     }

    // Write data to CSV file
    csvWriter
        .writeRecords(data)
        .then(()=> console.log('The CSV file was written successfully'));

}