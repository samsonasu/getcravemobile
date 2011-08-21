//this is a better way to build these panels because if everything uses this style the js include order doesn't matter
Crave.buildSettingsPanel = function() {
  Crave.settingsPanel = new Ext.Panel({
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    height: '100%',
    scroll: 'vertical',
    dockedItems: Crave.create_titlebar({
      items:[{
        text: "Back", 
        ui: 'iback',
        handler: Crave.back_handler
      }]
    }),
    bodyStyle: 'padding: 4px;',
    items: [{
      cls: 'framePanel',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [{
        cls: 'settingItem header',
        html: '<img src="../images/fb-settings-icon@2x.png"><div class="title">Facebook</div>'
      },Crave.create_setting_item({
        text: "Post my reviews to my wall", 
        name: 'auto_post_to_facebook',
        id: 'facebookToggle'
      })]
    },{
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      cls: 'framePanel',
      id: 'foursquareLoginPanel',
      items: [{
         cls: 'settingItem header',
         html: '<img src="../images/foursquare.png"><div class="title">Foursquare</div>'
      },{
        xtype: 'panel', 
        activeItem: 1,
        items: [{
          cls: 'settingItem',
          style: 'padding-top: 6px;',
          html: "<div class='title'>Login with Foursquare<span class='chevrony'></span></div>",
          listeners: {
            render: function(c) {
              c.el.on('click', Crave.foursquareLogin);
            }
          }
        }]
      }]
    },{
      layout: {
        type: 'vbox', 
        align: 'stretch'
      },
      hidden: true,
      cls: 'framePanel', 
      id: 'foursquareSettingsPanel', 
      items: [{
         cls: 'settingItem header',
         html: '<img src="../images/foursquare.png"><div class="title">Foursquare</div>'
      },Crave.create_setting_item({
        name: 'get_foursquare_recommendations', 
        id: 'foursquareToggle', 
        text: "Get recommendations when I check in"
      }),Crave.create_setting_item({
        name: 'auto_post_to_foursquare', 
        id: 'foursquarePostToggle', 
        text: "Add my reviews as foursquare tips"
      })]
    },{
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      cls: 'framePanel',
      items: [{
         cls: 'settingItem header',
         html: "<div class='title'>Send Feedback</span><span class='chevrony'></div>",
         listeners: {
          afterrender: function(c){
            c.el.on('click', function(){
              location.href="mailto:info@getcrave.com";
            });
          }
        }
      },{
         cls: 'settingItem header borderTop',
         html: "<div class='title'>Terms Of Service</span><span class='chevrony'></div>"
      },{
         cls: 'settingItem header borderTop',
         html: "<div class='title'>Version</span><span class='version'>1.0</div>"
      }]
    },{
      xtype: 'button',
      text: "Sign out",
      style: 'margin-top: .5em; background: white;',
      height: 44,
      width: '100%',
      handler: function() {
        Crave.sign_out();
        Crave.back_stack = [];
        Crave.viewport.setActiveItem(Crave.myProfilePanel);
      }
    }], 
    listeners: {
      activate: function() {
        if (!Crave.settingsPanel.user_loaded) {
          Crave.settingsPanel.setLoading(true);
          Ext.Ajax.request({
            url: '/users/' + Crave.currentUserId() + '.json',
            method: 'GET',
            success: function(response, options) {
              var user = Ext.decode(response.responseText).user;
              Crave.settingsPanel.set_user(user);
              Crave.settingsPanel.setLoading(false);
            }
          })
        }
      }
    }
  });
  
  Crave.settingsPanel.set_user = function(user) {
    var fbValue = user.auto_post_to_facebook;
    var fbToggle = Ext.getCmp('facebookToggle');
    if (fbToggle.rendered) {
      fbToggle.suppress_change = true;
      fbToggle.setValue(fbValue);
    } else {
      fbToggle.value = fbValue;
    }
    
    //foursquare settings
    
    var fs_auth = false;

    Ext.each(user.authorizations, function(auth) {
      if (auth.provider === 'foursquare') {
        fs_auth = true;
      }
    });

    
    var fsSettings = Ext.getCmp('foursquareSettingsPanel');
    var fsLogin = Ext.getCmp('foursquareLoginPanel');
    if (fs_auth) {
      fsSettings.show();
      fsSettings.doLayout();
      fsLogin.hide();
      var fsToggle = Ext.getCmp('foursquareToggle');
      if (fsToggle.rendered) {
        fsToggle.suppress_change = true;
        fsToggle.setValue(user.get_foursquare_recommendations);
      } else {
        fsToggle.value = user.get_foursquare_recommendations;
      }
      
      fsToggle = Ext.getCmp('foursquarePostToggle');
      if (fsToggle.rendered) {
        fsToggle.suppress_change = true;
        fsToggle.setValue(user.auto_post_to_foursquare);
      } else {
        fsToggle.value = user.auto_post_to_foursquare;
      }
    } else {
      fsSettings.hide();
      fsLogin.show();      
      fsLogin.doLayout();
    }
      

    Crave.settingsPanel.user_loaded = true;
  }
  return Crave.settingsPanel;
};

/* this makes toggle fields
 * config: 
 *   text: setting text
 *   id: field id
 *   name: name of the setting on user object
 */
Crave.create_setting_item = function(config) {
  var setting_item = new Ext.Panel({
    layout: 'hbox',
    cls: 'settingItem',
    items: [{
      flex: 1.5,
      xtype: 'panel',
      html: config.text
    },{
      flex: 1,
      xtype: 'togglefield',
      id: config.id,
      value : 0,
      suppress_change: true,
      listeners: {
        change: function(slider, thumb, newValue, oldValue) {
          if (this.suppress_change) {
            this.suppress_change = false;
          } else {
            TouchBS.wait("Updating preferences");
            var user = {};
            user[config.name] = newValue;
            Ext.Ajax.request({
              url: '/users/' + Crave.currentUserId() + '.json',
              method: 'PUT',
              jsonData: {
                user: user
              },
              failure: TouchBS.handle_failure,
              success: function() {
                Crave.current_user[config.name] = newValue;
                TouchBS.stop_waiting();
              }
            });
          }
        }
      }
    }],
    suppress_next: function() {
      this.suppress_change = true;
    }
  });

  return setting_item;
};

