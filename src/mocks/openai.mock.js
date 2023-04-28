
export const message = `
  Thanks for providing the details. Here is the request to create an issue in JIRA:

\`\`\`request
[{
  "url": "/rest/api/3/issue",
  "method": "POST",
  "body": {
    "fields": {
      "project": {
        "key": "DOIT"
      },
      "issuetype": {
        "name": "Error"
      },
      "summary": "generate server"
    }
  }
}]
\`\`\` 

Please note that I have assumed the issue type to be "Task" based on the provided information. If you need to change it to any other issue type, please let me know.

\`\`\`request
[{
  "url": "/rest/api/3/issue",
  "method": "POST",
  "body": {
    "fields": {
      "project": {
        "key": "DOIT"
      },
      "issuetype": {
        "name": "Task"
      },
      "summary": "Add integration with JIRA"
    }
  }
}]
\`\`\` 
`;