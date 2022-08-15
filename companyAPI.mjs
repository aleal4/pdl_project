// See https://github.com/peopledatalabs/peopledatalabs-js
const PDLJS = require('peopledatalabs');
console.log('hello')

const PDLJSClient = new PDLJS({ apiKey: "dc036469e35bc58b61914eed7fa58e056f9a7ca8fc7d438655f33c55255c7b21" });

// Create a parameters JSON object
// const queryString = {"name":"People Data Labs"}

// Pass the parameters object to the Company Enrichment API
PDLJSClient.company.enrichment(queryString).then((response) => {
    // Print the API response
    console.log(response.average_employee_tenure);
}).catch((error) => {
    console.log(error);
});