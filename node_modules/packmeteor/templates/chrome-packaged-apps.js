    window.orgAddEventListener = window.addEventListener;
    
    window.addEventListener = function(event, listener, bool) {
     if (event !== 'unload') {
      window.orgAddEventListener(event, listener, bool);
     }
    };