(function(){var _ = Package.underscore._,
    package_name = "project",
    namespace = "project";

if (package_name != "project") {
    namespace = TAPi18n.packages[package_name].namespace;
}
TAPi18n._enable({"helper_name":"_","supported_languages":null,"i18n_files_route":"/tap-i18n","cdn_path":null});
TAPi18n.languages_names["en"] = ["English","English"];
// integrate the fallback language translations 
translations = {};
translations[namespace] = {"app":{"loading":"Loading...","offline":"Can't connect are you offline?","logginIn":"Logging in..."},"error":{"insufficientRights":"You don't have enough rights for this action."},"buttons":{"ok":"OK","cancel":"Cancel","save":"Save","edit":"edit","tryToReconnect":"Try to reconnect"},"commonWords":{"you":"You","send":"Send","or":"or","with":"with","and":"and","on":"on"}};
TAPi18n._loadLangFileObject("en", translations);

})();
