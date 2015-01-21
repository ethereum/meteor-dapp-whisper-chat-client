(function(){var _ = Package.underscore._,
    package_name = "project",
    namespace = "project";

if (package_name != "project") {
    namespace = TAPi18n.packages[package_name].namespace;
}
// integrate the fallback language translations 
translations = {};
translations[namespace] = {"app":{"loading":"Loading...","offline":"Can't connect are you offline?","logginIn":"Logging in..."},"error":{"insufficientRights":"You don't have enough rights for this action."},"buttons":{"save":"Save","tryToReconnect":"Try to reconnect"},"commonWords":{"you":"You","send":"Send","or":"or","with":"with","and":"and"}};
TAPi18n._loadLangFileObject("en", translations);

})();
