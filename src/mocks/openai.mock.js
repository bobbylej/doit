export const messageWithTwoRequests = `
  Thanks for providing the details. Here is the request to create an issue in JIRA:

\`\`\`request
[{
  "name": "Create Issue to generate server",
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
      "summary": "Generate server"
    }
  }
},{
  "name": "Create Issue to add documentation for server",
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
      "summary": "Create documentation for server"
    }
  }
}]
\`\`\` 

Please note that I have assumed the issue type to be "Task" based on the provided information. If you need to change it to any other issue type, please let me know.
\`\`\`request
{
  "name": "Create Issue to integrate with JIRA",
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
}
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

export const messageToCreateAttribute = "Here is the request to create a custom field of type \"Select List (single choice)\" with options \"Red\", \"Yellow\" and \"Green\" in the DOIT project:\n\n```request\n[{\n  url: '/rest/api/3/field',\n  method: 'POST',\n  body: {\n    \"name\": \"Color\",\n    \"description\": \"Color attribute\",\n    \"type\": \"com.atlassian.jira.plugin.system.customfieldtypes:select\",\n    \"searcherKey\": \"com.atlassian.jira.plugin.system.customfieldtypes:selectsearcher\",\n    \"options\": [\n      {\n        \"value\": \"Red\"\n      },\n      {\n        \"value\": \"Yellow\"\n      },\n      {\n        \"value\": \"Green\"\n      }\n    ]\n  }\n}]```\n\nPlease note that you need to have the necessary permissions to create custom fields in the DOIT project.";

export const messageToCreateColorField = "Here is the request to create a custom field called \"Color\":\n```request\n[{\n\"name\": \"Create custom field called 'Color'\",\n\"url\": \"/rest/api/3/field\",\n\"method\": \"POST\",\n\"body\": {\n\"name\": \"Color\",\n\"description\": \"Color field with options red, yellow, and green\",\n\"type\": \"com.atlassian.jira.plugin.system.customfieldtypes:select\",\n\"searcherKey\": \"com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher\"\n}\n}]\n```\nHere is the request to assign this field to PROJECT_KEY project:\n```request\n[{\n\"name\": \"Assign custom field 'Color' to PROJECT_KEY project\",\n\"url\": \"/rest/api/3/field/{FIELD_ID}/context\",\n\"method\": \"POST\",\n\"body\": {\n\"name\": \"PROJECT_KEY project context\",\n\"projectIds\": [\"PROJECT_ID\"],\n}\n}]\n```\nNote: Replace FIELD_ID with actual ID of the Color field and PROJECT_ID with actual ID of the project. You can take FIELD_ID from the response for request to create the Color field or by this request:\n```request\n[{\n\"name\": \"Get ID of custom field called 'Color'\",\n\"url\": \"/rest/api/3/field\",\n\"method\": \"GET\"\n}]\n```\nThis request will return a list of all fields in the JIRA instance, including custom fields. You can search for the \"Color\" field in the response and find its ID. The ID will be a string of letters and numbers, such as \"customfield_10000\".\nYou can find the ID of your project by running the following request:\n```request\n[{\n\"name\": \"Get ID of 'PROJECT_KEY' project\",\n\"url\": \"/rest/api/3/project\",\n\"method\": \"GET\"\n}]\n```\nTo add options to this field you have to run this request:\n```request\n[{\n\"name\": \"Add options to 'Color' field\",\n\"url\": \"/rest/api/3/field/{FIELD_ID}/context/{CONTEXT_ID}/option\",\n\"method\": \"POST\",\n\"body\": {\n\"options\": [\n{\n\"value\": \"red\"\n},\n{\n\"value\": \"yellow\"\n},\n{\n\"value\": \"green\"\n}\n],\n}\n}]\n```\nNote: You have to replace FIELD_ID and CONTEXT_ID with actual IDs. You can take CONTEXT_ID from the response for the request to create context for Color field in project or by this request:\n```request\n[{\n\"name\": \"Get list of context for 'Color' field\",\n\"url\": \"/rest/api/3/field/{FIELD_ID}/context\",\n\"method\": \"GET\"\n}]\n```\nThis requests will help you create a new custom field called \"Color\" with the options \"red\", \"yellow\", and \"green\" in PROJECT_KEY context.";

export const messageToAddFilter = "Here is the request to get tasks with \"TODO\" label in the PROJECT_KEY project:\n```request\n[{\n\"name\": \"Get tasks with TODO label\",\n\"url\": \"/rest/api/3/search\",\n\"method\": \"GET\",\n\"query\": {\n\"jql\": \"project=PROJECT_KEY AND labels=TODO\"\n}\n}]\n```";

export const messageToCreateLabelField = "Here is the request to create a label field in a project for all issues:\n```request\n[{\n\"name\": \"Create label field for all issues\",\n\"url\": \"/rest/api/3/field\",\n\"method\": \"POST\",\n\"body\": {\n\"name\": \"Labels\",\n\"description\": \"Labels for categorizing issues\",\n\"type\": \"com.atlassian.jira.plugin.system.customfieldtypes:labels\",\n\"searcherKey\": \"com.atlassian.jira.plugin.system.customfieldtypes:labelsearcher\",\n}\n}]\n```\nPlease replace `PROJECT_KEY` with the actual key of your project.";

export const messageToCreate3Tasks = "Here is the request to create a task to implement changes in footer for adjusting colors and paddings to designs:\n```request\n[{\n\"name\": \"Create task to adjust colors and paddings to designs in footer\",\n\"url\": \"/rest/api/3/issue\",\n\"method\": \"POST\",\n\"body\": {\n\"fields\": {\n\"project\": {\n\"key\": \"PROJECT_KEY\"\n},\n\"summary\": \"Adjust colors and paddings to designs in footer\",\n\"description\": {\n\"type\": \"doc\",\n\"version\": 1,\n\"content\": [\n{\n\"type\": \"paragraph\",\n\"content\": [\n{\n\"type\": \"text\",\n\"text\": \"Task to adjust colors and paddings to designs in footer\"\n}\n]\n}\n]\n},\n\"issuetype\": {\n\"name\": \"Task\"\n}\n}\n}\n}]\n```\nHere is the request to create a task to implement changes in footer for adding common links:\n```request\n[{\n\"name\": \"Create task to add common links in footer\",\n\"url\": \"/rest/api/3/issue\",\n\"method\": \"POST\",\n\"body\": {\n\"fields\": {\n\"project\": {\n\"key\": \"PROJECT_KEY\"\n},\n\"summary\": \"Add common links in footer\",\n\"description\": {\n\"type\": \"doc\",\n\"version\": 1,\n\"content\": [\n{\n\"type\": \"paragraph\",\n\"content\": [\n{\n\"type\": \"text\",\n\"text\": \"Task to add common links in footer\"\n}\n]\n}\n]\n},\n\"issuetype\": {\n\"name\": \"Task\"\n}\n}\n}\n}]\n```\nHere is the request to create a task to implement changes in footer for adding newsletter form:\n```request\n[{\n\"name\": \"Create task to add newsletter form in footer\",\n\"url\": \"/rest/api/3/issue\",\n\"method\": \"POST\",\n\"body\": {\n\"fields\": {\n\"project\": {\n\"key\": \"PROJECT_KEY\"\n},\n\"summary\": \"Add newsletter form in footer\",\n\"description\": {\n\"type\": \"doc\",\n\"version\": 1,\n\"content\": [\n{\n\"type\": \"paragraph\",\n\"content\": [\n{\n\"type\": \"text\",\n\"text\": \"Task to add newsletter form in footer\"\n}\n]\n}\n]\n},\n\"issuetype\": {\n\"name\": \"Task\"\n}\n}\n}\n}]\n```\nReplace `PROJECT_KEY` with the actual key of your project. These requests will create three tasks in the specified project for implementing changes in the footer.";
