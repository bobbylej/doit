export const SLACK_TEXT_MAX_LENGTH = 3000;

export const SLACK_ACTION_PROVIDE_API_KEYS = "provide-api-keys";
export const SLACK_ACTION_SUBMIT_REQUESTS = "submit-requests";
export const SLACK_ACTION_GENERATE_REQUESTS = "generate-requests";

export const SLACK_ACTION_DONE_TEXTS = [
  "🎉 Ta-da! All done! 🎉",
  "✅ Mission accomplished! ✅",
  "🙌 That's all, folks! 🙌",
  "🎊 Voila! Finished! 🎊",
  "🎈 Hooray! We made it! 🎈",
  "🎁 And that's a wrap! 🎁",
  "🥳 Time to celebrate, we're done! 🥳",
  "🎉 Another one bites the dust! 🎉",
  "🎊 We did it! Party time! 🎊",
  "🎈 That's it, we're finished! 🎈",
];

export const SLACK_ACTION_ERROR_TEXTS = [
  "🚫 Oops, something went wrong! 🚫",
  "❌ Uh-oh, we hit a snag. ❌",
  "🤔 That's not supposed to happen... 🤔",
  "⚠️ Warning: Error detected! ⚠️",
  "🙁 We're sorry, an error occurred. 🙁",
  "💻 Houston, we have a problem. 💻",
  "🆘 Help! Error message alert! 🆘",
  "🤯 This wasn't supposed to happen! 🤯",
  "🙀 Catastrophic failure detected! 🙀",
  "😱 Oh no, the system is down! 😱",
];

export const SLACK_ACTION_PARTLY_ERROR_TEXTS = [
  "⚠️ Some actions completed, but a few encountered errors along the way. ⚠️",
  "🔍 Progress made, but errors stumbled upon a few actions. 🔍",
  "🚧 Incomplete mission! Some actions finished, but a few got tangled in errors. 🚧",
  "❗ Mixed results! Few actions completed, but errors disrupted the rest. ❗",
  "⚡️ Partial success with a sprinkle of errors! Some actions triumphed, some stumbled. ⚡️",
  "💥 Partial completion with a few unexpected errors. We'll regroup and try again. 💥",
  "🌩️ Thunderstorm of errors hit a few actions, but others made it through. 🌩️",
  "🛑 Hiccup alert! Some actions finished, but errors tripped up a few. 🛑",
  "🔧 Some actions assembled successfully, but errors played spoilsport with the rest. 🔧",
  "🚦 Mixed bag! Part of the actions cleared, but errors stopped the rest at a red light. 🚦",
];

export const SLACK_ACTION_IN_PROGRESS_TEXTS = [
  "⌛️ Hang tight, we're working on it... ⌛️",
  "🔧 Just a moment, we're tinkering away... 🔧",
  "⚙️ Processing... Please wait... ⚙️",
  "🕒 Patience, we're making progress... 🕒",
  "🔄 Working hard to get it done... 🔄",
  "🔨 Building... Almost there... 🔨",
  "⏳ It's a work in progress... ⏳",
  "🔆 Keep calm, the process is underway... 🔆",
  "⚡️ Working our magic, hold on... ⚡️",
  "📊 Crunching the numbers... Hang on tight... 📊",
];

export const SLACK_ACTION_NOTHING_TO_DO_TEXTS = [
  "🤷‍♂️ Nothing to see here, folks! 🤷‍♂️",
  "🙅‍♀️ Sorry, there's nothing to do at the moment. 🙅‍♀️",
  "🌞 Enjoy the free time, no tasks on the horizon! 🌞",
  "😴 Sit back, relax, and enjoy the emptiness. 😴",
  "🌴 Time to kick back and do nothing! 🌴",
  "⛱️ Ahh... the blissful emptiness! ⛱️",
  "🐌 Taking it slow, no tasks to tackle. 🐌",
  "🔇 Shhh... Silence, because there's nothing to do. 🔇",
  "💤 Enjoy the tranquility of no tasks. 💤",
  "🧘‍♂️ Embrace the Zen of nothingness. 🧘‍♂️",
];

export const SLACK_ACTION_PICK_ACTIONS_TEXTS = [
  "🤔 Time to pick and choose some actions to run! 🤔",
  "🔍 Seeking actions to run... Take your pick! 🔍",
  "🎯 Ready, set, pick your actions to run! 🎯",
  "⚡️ It's action time! Choose and run your tasks! ⚡️",
  "🔢 Select actions and let the running begin! 🔢",
  "💪 Get ready to flex your action-picking muscles! 💪",
  "🌟 Time to shine! Handpick actions to run like a star! 🌟",
  "🔥 Ignite your productivity by selecting actions to run! 🔥",
  "🎮 Level up! Choose your actions and start running! 🎮",
  "🔧 Ready to roll? Pick your actions and run with it! 🔧",
];

export const SLACK_ACTION_API_KEYS_REQUIRED_TEXTS = [
  "🔑 Attention! API keys required for OpenAI and JIRA. Please provide them. 🔑",
  "🔒 Unlock the power! We need API keys for OpenAI and JIRA. Can you provide them? 🔒",
  "🔐 Access denied! We need API keys for OpenAI and JIRA. Kindly provide them. 🔐",
  "⚙️ Missing API keys! Help us connect to OpenAI and JIRA by providing the required keys. ⚙️",
  "🔑 Time to authenticate! Please provide the necessary API keys for OpenAI and JIRA. 🔑",
  "🔐 Secure the connection! We're in need of API keys for OpenAI and JIRA. 🔐",
  "🔑 Key me in! API keys are needed for OpenAI and JIRA. Can you share them with us? 🔑",
  "⚡️ Power up! We require API keys for OpenAI and JIRA. Please provide them to continue. ⚡️",
  "🔒 Protect the access! API keys for OpenAI and JIRA are missing. Can you supply them? 🔒",
  "🔑 API keys alert! OpenAI and JIRA require your attention. Please provide the necessary keys. 🔑",
];

export const SLACK_ACTION_WHAT_TO_DO_TEXTS = [
  "🤔 How may I be of service to you? Let me know! 🤔",
  "🎯 Your wish is my command! What can I do for you today? 🎯",
  "🌟 Ready and at your service! How can I assist you? 🌟",
  "🔮 Just say the word! What can I do to help you today? 🔮",
  "💬 Speak up! I'm here to listen and fulfill your requests. 💬",
  "🤝 Let's collaborate! How can I support you? 🤝",
  "🙌 Ready to help! Tell me what you need, and I'll do my best! 🙌",
  "💡 How can I illuminate your path today? Let me know! 💡",
  "🔧 How can I be of assistance? Feel free to share your requests! 🔧",
  "⚡️ I'm all ears! What task or information are you looking for? ⚡️",
];
