export const messageWithTwoRequests = `
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

export const messageWithoutRequest = `
To add a color attribute to issues in the DOIT project, you can use the JIRA REST API to update the issue fields. Here is an example request that you can use:

\`\`\`
POST /rest/api/3/issue/{issueIdOrKey}/properties

{
"key": "color",
"value": "blue"
}
\`\`\`

Replace \`{issueIdOrKey}\` with the ID or key of the issue you want to update, and set the \`value\` field to the desired color. You can also use other HTTP methods like PUT or PATCH to update the issue fields.

Note that you will need to authenticate your requests with a JIRA user account that has the necessary permissions to update issues in the DOIT project.
`;
