(function(){var _ = Package.underscore._,
    package_name = "project",
    namespace = "project";

if (package_name != "project") {
    namespace = TAPi18n.packages[package_name].namespace;
}
// integrate the fallback language translations 
translations = {};
translations[namespace] = {"whisper":{"app":{"buttons":{"addUser":"Add People","newChat":"New Chat"}},"chat":{"placeholder":{"addTopic":"Add a Topic","writeHere":"Write your message here"},"texts":{"invitePeople1":"To add people to this chat, click the","invitePeople2":"icon or send someone this link:","invitePeople3":"To add people to this chat click a person you follow, or send someone this link:"}},"users":{"texts":{"anonymous":"This is an anonymous user. No guarantees can be made  about it’s identity, or any links between him and any other user with the same nickname here or any other platform."}}}};
TAPi18n._loadLangFileObject("en", translations);

})();
