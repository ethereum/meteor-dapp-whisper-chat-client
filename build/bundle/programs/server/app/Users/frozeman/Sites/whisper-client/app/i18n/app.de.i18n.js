(function(){var _ = Package.underscore._,
    package_name = "project",
    namespace = "project";

if (package_name != "project") {
    namespace = TAPi18n.packages[package_name].namespace;
}
TAPi18n.languages_names["de"] = ["German","Deutsch"];
TAPi18n._enable({"helper_name":"_","supported_languages":null,"i18n_files_route":"/tap-i18n","cdn_path":null});
TAPi18n.languages_names["en"] = ["English","English"];
if(_.isUndefined(TAPi18n.translations["de"])) {
  TAPi18n.translations["de"] = {};
}

if(_.isUndefined(TAPi18n.translations["de"][namespace])) {
  TAPi18n.translations["de"][namespace] = {};
}

_.extend(TAPi18n.translations["de"][namespace], {"app":{"loading":"Lade...","offline":"Kann mich nicht verbinden, bist du offline?","logginIn":"beim anmelden..."},"error":{"insufficientRights":"Du hast leider nicht genügend Rechte um diese Aktion auszuführen."},"buttons":{"save":"Speichern","tryToReconnect":"Wieder verbinden"},"commonWords":{"you":"Du","send":"Gesendet","or":"oder","with":"mit","and":"und"}});

})();
