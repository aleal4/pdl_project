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
test();
// console.log(finalList)



/*
const finalList = []
const test = async () => {
  try {
    for (let i = 0; i < companyNames.length; i++) {
      const queryString = {"name":`${companyNames[i]}`}
      const res = await PDLJSClient.company.enrichment(queryString)
      finalList.push(res);
   }
  } catch (err) {
      console.log(err);
  }
}
console.log(finalList)



const finalList = []
for (let i = 0; i < companyNames.length; i++) {
  const queryString = {"name":`${companyNames[i]}`}

  
  
  // Pass the parameters object to the Company Enrichment API
  PDLJSClient.company.enrichment(queryString).then((response) => {
    // Print the API response
    
    finalList.push(response)
    console.log(respose)
  }).catch((error) => {
    console.log(error);
  });
}
console.log(finalList)















---- 
const finalList = []
for (let i = 0; i < companyNames.length; i++) {
  const queryString = {"name":`${companyNames[i]}`}
  
  // Pass the parameters object to the Company Enrichment API
  PDLJSClient.company.enrichment(queryString).then((response) => {
    // Print the API response
    
    finalList.push(response)
    console.log(response)
  }).catch((error) => {
    console.log(error);
  });
}
console.log(finalList)



*/