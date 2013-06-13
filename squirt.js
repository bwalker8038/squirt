/*
  Squirt JS Template Handler
  2013, Brian Vaughn [@morningtoast]
  
  This is a simple wrapper for JS template compilation and insertion.
  
  Supports Handlerbars and Mustache engines. Fork to add your own.
  Does NOT require jQuery or other framework libraries.
  
  How it works:
  Use squirt.setup() to register your template engine and define
  for your templates. Use the key "inline" for inline template and
  use "url" for external (AJAX) templates.
  
  After your templates have been registered, use the squirt.into()
  to compile your templates with a data object and then insert that
  markup into the defined container.
  
  Example:
  		squirt.setup({
				engine: "mustache", 
				templates: {
					alpha: { inline: "#template1" },
					beta: { url: "ajaxtemplate.html" }
				}
			});
      
      ...
      ...
      
      squirt.into("#boy","alpha",{name:"Jack"});
      squirt.into("#girl","beta",{name:"jill"});

*/
var squirt = (function () {

    var data = {
        engine: "mustache",
        map: {},
        templates: {},
        viewData: false,
        tid: false,
        containerId: false,
        debug: false
    }

    localdebug = function(s) {
        if (data.debug) { 
            s = "[Squirt] "+s;
            console.log(s); 
        }
    }    

    // Local variables
    var methods = {
        setup: function(config) {
            localdebug("setup()");

            data.engine = config.engine;
            data.map    = config.templates;

            if (config.debug) {
                data.debug = config.debug;
            }


            return;
        },

        into: function(containerId, tid, viewData, renew) {
            methods.render(tid, viewData, containerId, renew);
            return;
        },

        render: function(tid, viewData, containerId, renew) {
            localdebug("render()");

            data.tid         = tid;
            data.viewData    = viewData;

            if (containerId &&  containerId.length > 0) {
                data.containerId = containerId.replace("#","");
            } else {
                data.contrainerId = false;
            }

            if (!data.templates[tid] || renew) {
                localdebug(". getting new template");

                var tmpl   = data.map[tid];
                data.renew = false;

                if (tmpl.inline) {
                    // Inline grab
                    localdebug(". getting inline template found at "+tmpl.inline);
                    methods.compile(document.getElementById(tmpl.inline.replace("#","")).innerHTML);
                } else {
                    // Ajax grab
                    localdebug(". template is external");
                    methods.getTemplate(tmpl.url, methods.compile);
                }
            } else {
                localdebug(". template already generated, retrieving cached version");
                methods.compile(data.templates[tid], true);
            }

            return;
        },

        compile: function(html, doNotSave) {
            localdebug("compile()");

            if (!doNotSave) {
                methods.saveTemplate(data.tid, html);
            }

            var render     = methods.uselib(html, data.viewData);

            if (data.containerId) {
                localdebug(". updating element #"+data.containerId+" with rendered markup");
                document.getElementById(data.containerId).innerHTML = render;
            } else {
                data.html[data.tid] = render;
            }

            methods.clear();
            return;     
        },

        recall: function(tid) {
            localdebug("recall()");

            if (data.templates[tid]) {
                return(data.templates[tid]);
            } else {
                return(false);
            }
        },

        clear: function() {
            localdebug("clear()");

            data.viewData    = false;
            data.tid         = false;
            data.containerId = false;
            return;
        },

        getTemplate: function(path, callback) {
            localdebug("getTemplate()");
            localdebug(". getting template found at "+path);

            var xhr = new XMLHttpRequest();
           
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    callback(xhr.responseText);
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
            return;
        },

        saveTemplate: function(tid, html) {
            localdebug("saveTemplate()");
            data.templates[tid] = html;
            return;
        },

        uselib: function(templateHtml, viewData) {
            localdebug("uselib()");
            
            var render = "<em>Could not render template</em>";
            
            if (templateHtml.length > 0) {

                // Add your own template engines into the switch() block
                switch (data.engine) {
                    default:
                        localdebug("! template engine undefined");
                        break;

                    case "mustache":
                        localdebug(". using Mustache template engine");
                        render = Mustache.render(templateHtml, viewData);
                        break;

                    case "handlebars":
                        localdebug(". using Handlebars template engine");
                        var template = Handlebars.compile(templateHtml);
                        render       = template(viewData);
                        break;
                }

                
            }
            
            return(render);
        }
    };


    //  Public methods
    return {
        setup: methods.setup,
        render: methods.render,
        into: methods.into,
        recall: methods.recall
    };

}());
